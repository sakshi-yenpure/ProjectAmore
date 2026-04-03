import logging
import requests
import threading
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from .models import ChatSession, Message
from .serializers import ChatSessionListSerializer, MessageSerializer
from emotions.service import EmotionService
from journal.models import JournalEntry, MoodLog
from django.conf import settings
from vectors.service import store_vector, search_similar, get_emotion_memories

logger = logging.getLogger(__name__)

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
PRIMARY_MODEL = "qwen/qwen3.6-plus:free"
FALLBACK_MODEL = "nvidia/nemotron-3-super-120b-a12b:free"
TERTIARY_MODEL = "google/gemini-flash-1.5:free"


def call_openrouter(system_prompt, history, user_message, model=None):
    """Call OpenRouter API and return the reply text, or None on failure."""
    if model is None:
        model = PRIMARY_MODEL

    api_key = settings.OPENROUTER_API_KEY
    if not api_key:
        logger.error("OPENROUTER_API_KEY is not set.")
        return None

    # Build messages list: system + history + current user message
    messages = [{"role": "system", "content": system_prompt}]
    for msg in history:
        messages.append({"role": msg["role"], "content": msg["content"]})
    messages.append({"role": "user", "content": user_message})

    payload = {
        "model": model,
        "messages": messages,
        "max_tokens": 150,
        "temperature": 0.7,
    }

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://amore-wellness.app",
        "X-Title": "Amore Wellness",
    }

    try:
        resp = requests.post(OPENROUTER_URL, json=payload, headers=headers, timeout=20)
        resp.raise_for_status()
        data = resp.json()
        reply = data["choices"][0]["message"]["content"].strip()
        return reply
    except requests.exceptions.HTTPError as e:
        logger.error(f"OpenRouter HTTP error ({model}): {e} — {resp.text}")
    except requests.exceptions.Timeout:
        logger.error(f"OpenRouter Timeout ({model}) after 20s")
    except Exception as e:
        logger.error(f"OpenRouter error ({model}): {type(e).__name__}: {e}")
    return None


class ChatSessionViewSet(viewsets.ModelViewSet):
    serializer_class = ChatSessionListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ChatSession.objects.filter(user=self.request.user).order_by('-updated_at')

    def perform_create(self, serializer):
        title = self.request.data.get('title')
        if not title:
            title = timezone.now().strftime("%B %d, %Y")
        serializer.save(user=self.request.user, title=title)

    @action(detail=True, methods=['get'])
    def messages(self, request, pk=None):
        session = self.get_object()
        messages = session.messages.all().order_by('timestamp')
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)


class SendMessageView(APIView):
    permission_classes = [IsAuthenticated]

    CRISIS_KEYWORDS = [
        'hurt myself', 'end it all', 'want to die', 'give up on life',
        'suicidal', 'no point living', 'worthless', "can't go on",
        'kill myself', 'not worth living'
    ]

    def post(self, request):
        user = request.user
        content = request.data.get('content', '').strip()
        session_id = request.data.get('session_id')

        if not content:
            return Response({'error': 'Message cannot be empty'}, status=status.HTTP_400_BAD_REQUEST)

        if not session_id:
            return Response({'error': 'session_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            session = ChatSession.objects.get(id=session_id, user=user)
        except ChatSession.DoesNotExist:
            return Response({'error': 'Session not found'}, status=status.HTTP_404_NOT_FOUND)

        # STEP 1: Crisis Check
        content_lower = content.lower()
        is_crisis = any(keyword in content_lower for keyword in self.CRISIS_KEYWORDS)

        # STEP 2: Emotion Detection
        emotion_data = EmotionService.analyze(content)
        emotion = None
        confidence = None
        all_scores = {}
        if emotion_data:
            emotion = emotion_data.get('emotion')
            confidence = emotion_data.get('confidence')
            all_scores = emotion_data.get('all_scores')

        # STEP 3: Vector memory search
        similar_memories = search_similar(content, user.id, top_k=5)

        # STEP 4: Same-emotion memories
        emotion_memories = []
        if emotion:
            emotion_memories = get_emotion_memories(user.id, emotion, top_k=3)

        # STEP 5: Check today's journal
        today = timezone.localdate()
        today_journal = JournalEntry.objects.filter(user=user, date=today).first()

        # STEP 6: Get recent messages (last 6, oldest first)
        recent_msgs = list(Message.objects.filter(session=session).order_by('-timestamp')[:6])
        recent_msgs = list(reversed(recent_msgs))

        system_prompt = (
            "You are AmoreChat, a warm and empathetic AI wellness companion. "
            "Always validate feelings before suggesting anything.\n"
            "Keep responses warm, empathetic, but concise (1-3 sentences max).\n"
            "NEVER show your reasoning or internal monologue. "
            "NEVER say 'Okay, I will do X'. ALWAYS respond directly to the user.\n"
            "Never give medical advice.\n"
            "Speak like a caring friend, not a therapist.\n\n"
        )

        if similar_memories:
            system_prompt += "=== Long term memory ===\n"
            for mem in similar_memories:
                system_prompt += f"- [{mem.get('source')} on {mem.get('timestamp')}]: {mem.get('text')} (felt {mem.get('emotion')})\n"
            system_prompt += "\n"

        if emotion_memories:
            system_prompt += "=== Same emotion memories ===\n"
            for mem in emotion_memories:
                system_prompt += f"- [on {mem.get('timestamp')}]: {mem.get('text')}\n"
            system_prompt += "\n"

        if today_journal:
            journal_mood = today_journal.manual_mood or today_journal.detected_emotion or "neutral"
            first_100 = today_journal.content[:100]
            system_prompt += "=== Today's journal ===\n"
            system_prompt += f"The user journaled today feeling {journal_mood}.\n"
            system_prompt += f"They wrote: {first_100}...\n"
            system_prompt += "Use this to make your response feel connected.\n\n"

        if is_crisis:
            system_prompt += (
                "=== IMPORTANT ===\n"
                "The user may be expressing distress.\n"
                "Respond with warmth and care.\n"
                "Gently mention that professional support exists. Do not panic them.\n"
                "Never be dismissive.\n\n"
            )

        if emotion:
            system_prompt += f"=== Current emotion ===\nDetected: {emotion} ({confidence}% confidence)\n\n"

        system_prompt += "Use memories naturally — if the user mentions something they discussed before, acknowledge it warmly. Never list memories robotically."

        # Build chat history for the API
        history = []
        for msg in recent_msgs:
            role = "user" if msg.role == "user" else "assistant"
            history.append({"role": role, "content": msg.content})

        # STEP 8: Call OpenRouter API (with tiered fallback)
        ai_reply = call_openrouter(system_prompt, history, content, model=PRIMARY_MODEL)
        if not ai_reply:
            logger.warning("Primary model failed, trying fallback model...")
            ai_reply = call_openrouter(system_prompt, history, content, model=FALLBACK_MODEL)
        if not ai_reply:
            logger.warning("Secondary model failed, trying tertiary model (Gemini)...")
            ai_reply = call_openrouter(system_prompt, history, content, model=TERTIARY_MODEL)
            
        if not ai_reply:
            ai_reply = "I'm here for you. It seems I'm having a little trouble right now — could you try again in a moment?"

        # STEP 9: Save to database
        user_message = Message.objects.create(
            session=session,
            role="user",
            content=content,
            emotion=emotion,
            confidence=confidence,
            is_crisis=is_crisis
        )

        ai_message = Message.objects.create(
            session=session,
            role="ai",
            content=ai_reply
        )

        # Save MoodLog
        if emotion:
            MoodLog.objects.create(
                user=user,
                source='chat',
                emotion=emotion,
                score=all_scores.get(emotion, 0.0) if all_scores else 0.0,
                date=today
            )

        # STEP 10: Save to ChromaDB (In Background)
        def save_memory_thread():
            from django.db import connection
            try:
                vector_id = store_vector(
                    text=content,
                    user_id=user.id,
                    source="chat",
                    emotion=emotion,
                    timestamp=user_message.timestamp,
                    entry_id=user_message.id
                )
                if vector_id:
                    user_message.vector_id = vector_id
                    user_message.save(update_fields=['vector_id'])
            finally:
                connection.close()
                
        threading.Thread(target=save_memory_thread).start()

        # STEP 11: Auto-title session after first message (In Background)
        is_first = Message.objects.filter(session=session).count() <= 2
        if is_first and len(content) > 5:
            def auto_title_thread():
                from django.db import connection
                try:
                    title_reply = call_openrouter(
                        "You create ultra-short titles. Reply with ONLY 4 words or fewer, no quotes, no punctuation.",
                        [],
                        f"Summarize this in 4 words max: {content}",
                        model=PRIMARY_MODEL
                    )
                    if title_reply:
                        session.title = title_reply.strip().strip('"').strip()
                        session.save(update_fields=['title'])
                except Exception as e:
                    logger.error(f"Error auto-titling: {type(e).__name__}: {e}")
                finally:
                    connection.close()
                    
            threading.Thread(target=auto_title_thread).start()

        # STEP 12: Return to frontend
        return Response({
            "user_message_id": user_message.id,
            "ai_message_id": ai_message.id,
            "ai_reply": ai_reply,
            "emotion": emotion,
            "confidence": confidence,
            "all_scores": all_scores,
            "is_crisis": is_crisis,
            "session_id": session.id,
            "session_title": session.title,
            "memories_used": len(similar_memories) + len(emotion_memories)
        })
