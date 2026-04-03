from django.db import models
from django.contrib.auth.models import User

class JournalEntry(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='journal_entries')
    date = models.DateField()
    content = models.TextField()
    
    # Mood and Emotions
    manual_mood = models.CharField(max_length=20, null=True, blank=True) # happy/sad/anxious/angry
    detected_emotion = models.CharField(max_length=20, null=True, blank=True)
    detected_confidence = models.FloatField(default=0.0)
    
    # AI Insights
    insight_text = models.TextField(null=True, blank=True)
    affirmation = models.TextField(null=True, blank=True)
    remedy_text = models.TextField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username}'s journal on {self.date}"

class MoodLog(models.Model):
    SOURCE_CHOICES = [
        ('chat', 'Chat'),
        ('journal', 'Journal'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='mood_logs')
    date = models.DateField()
    timestamp = models.DateTimeField(auto_now_add=True)
    emotion = models.CharField(max_length=20) # happy/sad/anxious/angry
    score = models.FloatField() # 0.0 to 10.0
    source = models.CharField(max_length=10, choices=SOURCE_CHOICES)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.user.username} - {self.emotion} ({self.source}) at {self.timestamp}"
