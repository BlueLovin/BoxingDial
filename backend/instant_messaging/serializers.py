from accounts.serializers import SmallUserSerializer, SmallUserWithProfileSerializer
from .models import Message, MessageGroup
from rest_framework import serializers


class MessageSerializer(serializers.ModelSerializer):
    owner = SmallUserWithProfileSerializer()
    to = SmallUserWithProfileSerializer()

    class Meta:
        model = Message
        fields = (
            "id",
            "owner",
            "to",
            "group",
            "content",
            "created_at",
            "read_by_recipient",
        )


class MessageGroupSerializer(serializers.ModelSerializer):
    users = SmallUserWithProfileSerializer(many=True)
    last_received_message = MessageSerializer()

    class Meta:
        model = MessageGroup
        fields = ("id", "users", "group_name", "last_received_message")
