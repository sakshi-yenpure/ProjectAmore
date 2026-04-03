import json
import logging
import requests
from django.conf import settings
from django.utils import timezone
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status, decorators
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth.models import User
from django.db.models import Max

from .models import JournalEntry, MoodLog
from .serializers import JournalEntrySerializer, MoodLogSerializer
from emotions.service import EmotionService

logger = logging.getLogger(__name__)

class JournalEntryViewSet(viewsets.ModelViewSet):
    serializer_class = JournalEntrySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Return all journal entries for the user, ordered by date."""
        return JournalEntry.objects.filter(user=self.request.user).order_by('-date', '-created_at')

    def perform_create(self, serializer):
        """Save a new journal entry for the logged-in user."""
        content = self.request.data.get('content', '')
        manual_mood = self.request.data.get('manual_mood', 'neutral')
        
        # Auto-detect emotion
        detected_emotion = 'neutral'
        confidence = 0.0
        if content:
            result = EmotionService.analyze(content)
            if result:
                detected_emotion = result['emotion']
                confidence = result['confidence']

        # Save as a new entry
        serializer.save(
            user=self.request.user,
            detected_emotion=detected_emotion,
            detected_confidence=confidence
        )

        # Also log the mood
        MoodLog.objects.create(
            user=self.request.user,
            date=self.request.data.get('date', timezone.now().date()),
            emotion=detected_emotion,
            score=confidence * 10.0,
            source='journal'
        )

    @action(detail=False, methods=['post'])
    def analyze(self, request):
        """
        The main analysis endpoint:
        1. Run EmotionService.analyze
        2. Check today's MoodLog for chat context
        3. Call Gemini API for empathetic insight and affirmation
        4. Save/Update JournalEntry and MoodLog
        """
        user = request.user

        content = request.data.get('content', '')
        manual_mood = request.data.get('manual_mood', 'neutral')
        date_str = request.data.get('date', str(timezone.now().date()))
        try:
            date_obj = timezone.datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            date_obj = timezone.now().date()

        if not content:
            return Response({'error': 'Content is required'}, status=status.HTTP_400_BAD_REQUEST)

        # STEP 1: Emotion Analysis
        emotion_result = EmotionService.analyze(content)
        if not emotion_result:
            return Response({'error': 'Emotion service failure'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        detected_emotion = emotion_result['emotion']
        confidence = emotion_result['confidence']
        all_scores = emotion_result['all_scores']

        # STEP 2: Check today's MoodLog for chat context
        today = date_obj
        chat_log = MoodLog.objects.filter(user=user, date=today, source='chat').first()
        chat_emotion_context = f"Today's chat emotion was also {chat_log.emotion} — consider this pattern." if chat_log else ""

        # STEP 3: OpenRouter AI call (Qwen/Nemotron)
        insight = "I'm here for you. Your feelings are valid and I'm listening."
        remedy = "Try a 5-minute breathing exercise or a short walk to clear your mind. You've got this!"
        affirmation = "\"You are stronger than you feel, and your journey matters.\""

        prompt = f"""You are a compassionate journaling assistant.
User journal text: {content}
Detected emotion: {detected_emotion} ({confidence * 100:.1f}% confidence).
Manual mood selected by user: {manual_mood}.
{chat_emotion_context}

Write:
1. insight: 2-3 empathetic sentences referencing specific themes from their writing
2. affirmation: one powerful sentence in quotes
3. remedy: one actionable, small wellness step

Respond ONLY as valid JSON, no markdown, no extra text:
{{ "insight": "...", "affirmation": "...", "remedy": "..." }}"""

        try:
            # TRY 1: Primary Model (Qwen)
            resp = requests.post(
                "https://openrouter.ai/api/v1/chat/completions",
                json={"model": "qwen/qwen3.6-plus:free", "messages": [{"role": "user", "content": prompt}]},
                headers={"Authorization": f"Bearer {settings.OPENROUTER_API_KEY}", "Content-Type": "application/json", "HTTP-Referer": "https://amore-wellness.app", "X-Title": "Amore Wellness Journal"},
                timeout=25
            )

            # TRY 2: Secondary Fallback (Nemotron)
            if resp.status_code != 200:
                logger.warning(f"Primary model failed in Journal, trying fallback (Nemotron)...")
                resp = requests.post(
                    "https://openrouter.ai/api/v1/chat/completions",
                    json={"model": "nvidia/nemotron-3-super-120b-a12b:free", "messages": [{"role": "user", "content": prompt}]},
                    headers={"Authorization": f"Bearer {settings.OPENROUTER_API_KEY}", "Content-Type": "application/json", "HTTP-Referer": "https://amore-wellness.app", "X-Title": "Amore Wellness Journal"},
                    timeout=25
                )

            # TRY 3: Tertiary Fallback (Gemini)
            if resp.status_code != 200:
                logger.warning(f"Secondary model failed in Journal, trying tertiary fallback (Gemini)...")
                resp = requests.post(
                    "https://openrouter.ai/api/v1/chat/completions",
                    json={"model": "google/gemini-flash-1.5:free", "messages": [{"role": "user", "content": prompt}]},
                    headers={"Authorization": f"Bearer {settings.OPENROUTER_API_KEY}", "Content-Type": "application/json", "HTTP-Referer": "https://amore-wellness.app", "X-Title": "Amore Wellness Journal"},
                    timeout=25
                )

            resp.raise_for_status()
            response_text = resp.json()["choices"][0]["message"]["content"]
            
            # Try to parse JSON from response text
            try:
                # Remove markdown code blocks if present
                clean_text = response_text.strip()
                if clean_text.startswith('```'):
                    # Handle ```json or just ```
                    clean_text = clean_text.split('```')[1]
                    if clean_text.startswith('json'):
                        clean_text = clean_text[4:]
                clean_text = clean_text.strip()
                
                ai_data = json.loads(clean_text)
                insight = ai_data.get('insight', insight)
                affirmation = ai_data.get('affirmation', affirmation)
                remedy_val = ai_data.get('remedy', remedy)
                
                if isinstance(remedy_val, list):
                    remedy = " ".join(remedy_val)
                else:
                    remedy = str(remedy_val)
                    
            except Exception as json_err:
                logger.error(f"OpenRouter JSON parse failed in Journal: {str(json_err)} - Response was: {response_text}")
        except Exception as api_err:
            logger.error(f"OpenRouter API call failed in Journal: {str(api_err)}")

        # STEP 6: Return to frontend (NO PERSISTENCE during analyze)
        return Response({
            'detected_emotion': detected_emotion,
            'confidence': round(confidence, 4),
            'all_scores': all_scores,
            'insight': insight,
            'affirmation': affirmation,
            'remedy': remedy
        })

    @action(detail=False, methods=['get'], url_path='by-date/(?P<date>[^/.]+)')
    def by_date(self, request, date=None):
        """Fetch the entry for a specific date (YYYY-MM-DD)."""
        entry = JournalEntry.objects.filter(user=request.user, date=date).first()
        if entry:
            serializer = self.get_serializer(entry)
            return Response(serializer.data)
        return Response(None) # Return null if not found (cleaner than 404 for dashboard context)
