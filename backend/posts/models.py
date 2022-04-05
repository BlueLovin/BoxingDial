from django.db import models
from django.contrib.auth.models import User
from accounts.managers import UserManager
from fights.models import Fight
from vote.models import VoteModel


class PostComment(VoteModel, models.Model):
    post = models.ForeignKey(
        "Post", on_delete=models.CASCADE, related_name="comments", blank=True, null=True
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


class PostLike(models.Model):
    user = models.ForeignKey(User, related_name="user_likes", on_delete=models.CASCADE)

    post = models.ForeignKey(
        "Post", related_name="post_likes", on_delete=models.CASCADE
    )

    liked_on = models.DateTimeField(auto_now_add=True)


class PostEntities(models.Model):
    mentioned_users = models.ManyToManyField(
        User, related_name="user_mentions", blank=True
    )


class Post(models.Model):
    fight = models.ForeignKey(
        Fight, on_delete=models.CASCADE, related_name="posts", null=True
    )
    content = models.TextField()
    owner = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="posts", null=True
    )
    username = models.TextField()
    likes = models.ManyToManyField(User, related_name="user", through=PostLike)
    date = models.DateTimeField(auto_now_add=True)
    entities = models.ForeignKey(
        PostEntities, on_delete=models.CASCADE, related_name="entities", blank=True
    )

    objects = UserManager()

    @property
    def truncated_content(self):
        if len(self.content) > 25:
            return self.content[:25] + "..."

        return self.content

    def __str__(self):
        return self.content
