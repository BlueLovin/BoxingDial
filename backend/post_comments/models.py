from django.db import models
from vote.models import VoteModel
from accounts.managers import UserManager
from django.contrib.auth.models import User
from posts.models import Post

# Create your models here.
class PostComment(VoteModel, models.Model):
    post = models.ForeignKey(
        Post, on_delete=models.CASCADE, related_name="comments", blank=True, null=True
    )

    content = models.TextField()
    date = models.DateTimeField(auto_now_add=True)
    owner = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="comments", null=True
    )

    parent = models.ForeignKey(
        "self", null=True, blank=True, related_name="replies", on_delete=models.CASCADE
    )

    username = models.TextField(blank=True)

    objects = UserManager()