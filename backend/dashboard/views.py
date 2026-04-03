import json
import logging
import numpy as np
from datetime import timedelta
from django.utils import timezone
from django.db.models import Count, Avg, Q
from django.db.models.functions import ExtractWeekDay, ExtractHour
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
import requests
from django.conf import settings

from journal.models import JournalEntry, MoodLog
from users.models import UserProfile

logger = logging.getLogger(__name__)

class MoodStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        # 1. Date Windows
        today = timezone.now().date()
        seven_days_ago = today - timedelta(days=7)
        fourteen_days_ago = today - timedelta(days=14)
        thirty_days_ago = today - timedelta(days=30)

        # 2. Mood Logs (last 14 days)
        logs_14d = MoodLog.objects.filter(user=user, date__gte=fourteen_days_ago)
        logs_7d = logs_14d.filter(date__gte=seven_days_ago)
        logs_prev_7d = logs_14d.filter(date__lt=seven_days_ago)

        # 3. Mood Score & Change
        current_avg = logs_7d.aggregate(Avg('score'))['score__avg'] or 0.0
        prev_avg = logs_prev_7d.aggregate(Avg('score'))['score__avg'] or 0.0
        mood_change_val = current_avg - prev_avg
        mood_change = f"{'+' if mood_change_val >= 0 else ''}{round(mood_change_val, 1)}"

        # 4. Emotion Counts & Change
        def get_emotion_stats(emotion_name):
            curr = logs_7d.filter(emotion=emotion_name).count()
            prev = logs_prev_7d.filter(emotion=emotion_name).count()
            diff = curr - prev
            return curr, f"{'+' if diff >= 0 else ''}{diff}"

        happy_moments, happy_change = get_emotion_stats('happy')
        anxious_triggers, anxious_change = get_emotion_stats('anxious')

        # 5. Streak Logic
        all_entry_dates = set(JournalEntry.objects.filter(user=user).values_list('date', flat=True))
        streak = 0
        search_date = today
        if search_date not in all_entry_dates:
            search_date = today - timedelta(days=1)
        
        while search_date in all_entry_dates:
            streak += 1
            search_date -= timedelta(days=1)

        profile, _ = UserProfile.objects.get_or_create(user=user)
        if streak > profile.personal_best:
            profile.personal_best = streak
            profile.save()

        # 6. Emotion Breakdown (%)
        total_logs = logs_7d.count()
        emotions_list = ['happy', 'sad', 'anxious', 'angry']
        breakdown = {}
        if total_logs > 0:
            for em in emotions_list:
                cnt = logs_7d.filter(emotion=em).count()
                breakdown[em] = round((cnt / total_logs) * 100)
        else:
            breakdown = {em: 0 for em in emotions_list}
            breakdown['happy'] = 100 # Default if no data

        dominant_emotion = max(breakdown, key=breakdown.get) if breakdown else "happy"

        # 7. Checked Days (for Mon-Sun layout)
        # Find which days of the CURRENT week have entries
        start_of_week = today - timedelta(days=today.weekday()) # Monday
        checked_days = []
        for i in range(7):
            d = start_of_week + timedelta(days=i)
            if d in all_entry_dates:
                checked_days.append(i)

        # 8. Mood Trend (Last 30 Days) - Required for MoodChart.jsx
        logs_30d = MoodLog.objects.filter(user=user, date__gte=thirty_days_ago).order_by('date')
        mood_trend = []
        x_data = []
        y_data = []
        
        for i in range(31):
            d = thirty_days_ago + timedelta(days=i)
            if d > today: break
            
            day_avg = logs_30d.filter(date=d).aggregate(Avg('score'))['score__avg']
            
            # Format day as requested by chart (Mon, Tue or Mon 01)
            day_label = d.strftime('%a') if i > 23 else d.strftime('%b %d')
            
            entry_data = {
                "day": day_label,
                "score": round(day_avg, 1) if day_avg is not None else None,
                "x_idx": i
            }
            
            if day_avg is not None:
                x_data.append(i)
                y_data.append(day_avg)
            
            mood_trend.append(entry_data)

        # Linear Regression Math (Must sum up to valid regression line)
        if len(x_data) > 1:
            try:
                m, b = np.polyfit(np.array(x_data), np.array(y_data), 1)
                for item in mood_trend:
                    item['regression'] = round(m * item['x_idx'] + b, 2)
            except:
                for item in mood_trend: item['regression'] = item['score'] or 5
        else:
            for item in mood_trend:
                item['regression'] = item['score'] if item['score'] is not None else 5

        # 9. Recent Entries
        recent_entries = []
        entries_qs = JournalEntry.objects.filter(user=user).order_by('-date', '-created_at')[:5]
        for entry in entries_qs:
            recent_entries.append({
                "date": str(entry.date),
                "content": entry.content[:80] + ("..." if len(entry.content) > 80 else ""),
                "emotion": entry.detected_emotion or "neutral" # Frontend uses 'emotion'
            })

        # 10. AI Insight
        ai_insight = profile.ai_insight
        ai_remedy = profile.ai_remedy
        if profile.insight_generated_at != today:
            try:
                # Get today's actual journaling text for context
                today_entries = JournalEntry.objects.filter(user=user, date=today)
                today_text = " ".join([e.content for e in today_entries])
                
                day_map = {1: 'Sunday', 2: 'Monday', 3: 'Tuesday', 4: 'Wednesday', 5: 'Thursday', 6: 'Friday', 7: 'Saturday'}
                def get_peak_pattern(emotion_filter):
                    peak = logs_14d.filter(emotion_filter).annotate(
                        day=ExtractWeekDay('timestamp'), hour=ExtractHour('timestamp')
                    ).values('day', 'hour').annotate(count=Count('id')).order_by('-count').first()
                    if peak:
                        day_name = day_map.get(peak['day'], 'some day')
                        h = peak['hour']
                        time_range = "morning" if 6<=h<12 else "afternoon" if 12<=h<18 else "evening" if 18<=h<24 else "night"
                        return f"{day_name} {time_range}"
                    return "no specific time"

                anxious_pattern = get_peak_pattern(Q(emotion='anxious'))
                happy_pattern = get_peak_pattern(Q(emotion='happy'))
                
                first_half_avg = logs_prev_7d.aggregate(Avg('score'))['score__avg'] or 5.0
                second_half_avg = logs_7d.aggregate(Avg('score'))['score__avg'] or 5.0
                trend_status = "stable"
                if second_half_avg > first_half_avg + 0.5: trend_status = "improving"
                elif second_half_avg < first_half_avg - 0.5: trend_status = "declining"

                try:
                    resp = requests.post(
                        "https://openrouter.ai/api/v1/chat/completions",
                        json={
                            "model": "qwen/qwen3.6-plus-preview:free",
                            "messages": [{"role": "user", "content": prompt}]
                        },
                        headers={
                            "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
                            "Content-Type": "application/json",
                            "HTTP-Referer": "https://amore-wellness.app",
                            "X-Title": "Amore Wellness Dashboard"
                        },
                        timeout=15
                    )
                    resp.raise_for_status()
                    response_text = resp.json()["choices"][0]["message"]["content"]
                except Exception as api_err:
                    logger.error(f"OpenRouter API call failed in Dashboard: {str(api_err)}")
                    response_text = '{"insight": "Keep journaling to unlock deeper insights!", "remedy": "Take a moment for self-care today."}'
                
                # Parse JSON from response text
                try:
                    # Remove markdown code blocks if present
                    clean_text = response_text.strip()
                    if clean_text.startswith('```json'):
                        clean_text = clean_text[7:]
                    if clean_text.endswith('```'):
                        clean_text = clean_text[:-3]
                    clean_text = clean_text.strip()
                    
                    ai_data = json.loads(clean_text)
                    ai_insight = ai_data.get('insight', ai_insight)
                    remedy_val = ai_data.get('remedy', ai_remedy)
                    
                    # Convert list to string if needed
                    if isinstance(remedy_val, list):
                        ai_remedy = " ".join(remedy_val)
                    else:
                        ai_remedy = str(remedy_val)
                        
                except Exception as json_err:
                    logger.error(f"Dashboard OpenRouter JSON parse failed: {str(json_err)}")
                    # Fallback if parsing fails - just use the raw text as insight if it's reasonably short
                    if len(response_text) < 500:
                        ai_insight = response_text.strip()
                    ai_remedy = "Take a moment for self-care today."

                profile.ai_insight = ai_insight
                profile.ai_remedy = ai_remedy
                profile.insight_generated_at = today
                profile.save()
            except Exception as e:
                logger.error(f"Journal/Dashboard AI insight generation failed: {str(e)}")
                ai_insight = ai_insight or "Keep journaling to unlock deeper AI insights! ✨"
                ai_remedy = ai_remedy or "Continue exploring your thoughts through journaling."

        return Response({
            "mood_score": round(current_avg, 1),
            "mood_change": mood_change,
            "happy_moments": happy_moments,
            "happy_change": happy_change,
            "anxious_triggers": anxious_triggers,
            "anxious_change": anxious_change,
            "streak": streak,
            "personal_best": profile.personal_best,
            "dominant_emotion": dominant_emotion,
            "confidence": 85,
            "breakdown": breakdown,
            "checked_days": checked_days,
            "mood_trend": mood_trend,
            "recent_entries": recent_entries,
            "ai_insight": ai_insight,
            "ai_remedy": ai_remedy
        })

class MoodTrendView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        return Response([])

class InsightView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        return Response({'insight': ""})
