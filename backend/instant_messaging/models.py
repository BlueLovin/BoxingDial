from django.db import models
from django.contrib.auth.models import User

# Create your models here.
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
    last_received_message = models.TextField(max_length=150)


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

    def last_50_messages(self, message_group):
        return (
            Message.objects.filter(group=message_group)
            .order_by("created_at")
            .all()[:50]
        )
