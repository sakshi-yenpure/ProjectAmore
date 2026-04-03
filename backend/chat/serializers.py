from rest_framework import serializers
from .models import ChatSession, Message

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['id', 'role', 'content', 'emotion', 'confidence', 'is_crisis', 'timestamp']

class ChatSessionListSerializer(serializers.ModelSerializer):
    last_message = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatSession
        fields = ['id', 'title', 'last_message', 'created_at', 'updated_at']
        extra_kwargs = {
            'title': {'required': False}
        }

    def get_last_message(self, obj):
        last_msg = obj.messages.last() # Because ordering is timestamp ascending
        if last_msg:
            return last_msg.content[:100] + ("..." if len(last_msg.content) > 100 else "")
        return None
