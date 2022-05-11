from accounts.serializers import SmallUserSerializer, SmallUserWithProfileSerializer
from .models import Message, MessageGroup
from rest_framework import serializers

class MessageSerializer(serializers.ModelSerializer):
    owner = SmallUserWithProfileSerializer(many=True)
    class Meta:
        model = Message
        fields = ("id", "owner", "to", "content", "created_at")
    

class MessageGroupSerializer(serializers.ModelSerializer):
    users = SmallUserWithProfileSerializer(many=True)

    class Meta:
        model = MessageGroup
        fields = ("id", "users", "group_name", "last_received_message")
