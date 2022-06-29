from django.db import models
from django.contrib.auth.models import User

# Create your models here.
from accounts.serializers import SmallUserSerializer, SmallUserWithProfileSerializer
import uuid

from django.core.exceptions import ValidationError
from django.db import models


def validate_message_content(content):
    if content is None or content == "" or content.isspace():
        raise ValidationError(
            "Content is empty/invalid",
            code="invalid",
            params={"content": content},
        )


class MessageGroup(models.Model):
    id = models.UUIDField(
        primary_key=True, null=False, default=uuid.uuid4, editable=False
    )
    users = models.ManyToManyField(User, default=list)
    group_name = models.TextField()
    last_received_message = models.ForeignKey(
        "Message", on_delete=models.CASCADE, blank=True, null=True
    )

    @classmethod
    def messages_to_json(cls, messages):
        result = []
        for message in messages:
            result.append(cls.message_to_json(message))
        return result

    @classmethod
    def message_to_json(cls, message):
        return {
            "id": str(message.id),
            "owner": SmallUserWithProfileSerializer(message.owner).data,
            "to": SmallUserSerializer(message.to).data,
            "group": str(message.group.id),
            "content": message.content,
            "created_at": str(message.created_at),
        }


class Message(models.Model):
    id = models.UUIDField(
        primary_key=True, null=False, default=uuid.uuid4, editable=False
    )
    owner = models.ForeignKey(
        User,
        blank=False,
        null=False,
        related_name="owner_messages",
        on_delete=models.CASCADE,
    )
    to = models.ForeignKey(
        User,
        blank=False,
        null=False,
        related_name="chat_messages",
        on_delete=models.CASCADE,
    )
    group = models.ForeignKey(MessageGroup, on_delete=models.CASCADE)
    content = models.TextField(validators=[validate_message_content])
    created_at = models.DateTimeField(auto_now_add=True, blank=True)
    read_by_recipient = models.BooleanField(default=False)

    @classmethod
    def last_50_messages(cls, message_group):
        return (
            Message.objects.filter(group=message_group)
            .order_by("created_at")
            .all()[:150]
        )

    @classmethod
    def check_user_messaging_permissions(cls, owner, recipient) -> bool:
        recipient_follows_you = recipient.following.filter(
            following_user_id=owner.id
        ).exists()
        # could return recipient_follows_you, but for prototyping lets just return true
        return True
