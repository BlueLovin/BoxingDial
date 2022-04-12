from rest_framework import serializers
from accounts.serializers import SmallUserSerializer
from notifications.models import Notification

# User Serializer
class NotificationSerializer(serializers.ModelSerializer):
    recipient = SmallUserSerializer()

    class Meta:
        model = Notification
        fields = [
            "id",
            "recipient",
            "sender",
            "post_id",
            "comment_id",
            "text",
            "is_read",
            "date",
        ]
