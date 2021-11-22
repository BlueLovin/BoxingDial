from rest_framework import serializers
from accounts.serializers import UserSerializer
from notifications.models import Notification

# User Serializer
class NotificationSerializer(serializers.ModelSerializer):
    recipient = UserSerializer
    class Meta:
        model = Notification
        fields = ["id", "recipient", "post_id", "text", "is_read", "date"]