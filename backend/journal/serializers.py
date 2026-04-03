from rest_framework import serializers
from django.contrib.auth.models import User
from .models import JournalEntry, MoodLog

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'password']
        extra_kwargs = {'password': {'write_only': True, 'required': True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class MoodLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = MoodLog
        fields = ['id', 'user', 'date', 'timestamp', 'emotion', 'score', 'source']
        read_only_fields = ['user', 'timestamp']

class JournalEntrySerializer(serializers.ModelSerializer):
    emotion = serializers.SerializerMethodField()

    class Meta:
        model = JournalEntry
        fields = [
            'id', 'user', 'date', 'content', 
            'manual_mood', 'detected_emotion', 'emotion', 'detected_confidence', 
            'insight_text', 'affirmation', 'remedy_text', 'created_at'
        ]
        read_only_fields = ['user', 'detected_emotion', 'emotion', 'detected_confidence', 'insight_text', 'affirmation', 'remedy_text', 'created_at']

    def get_emotion(self, obj):
        # Prioritize detected_emotion if manual_mood is None or 'neutral'
        if not obj.manual_mood or obj.manual_mood == 'neutral':
            return obj.detected_emotion or 'neutral'
        return obj.manual_mood
