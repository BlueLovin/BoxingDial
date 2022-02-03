from django.db import models
from django.contrib.auth.models import User


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    bio = models.CharField(
        max_length=500, blank=True, null=True, default="", editable=True
    )
    screen_name = models.CharField(
        max_length=15, blank=True, null=True, default="", editable=True
    )
    blocked_users = models.ManyToManyField("UserProfile", blank=True)

    # avatar = models.ImageField()


class UserFollowing(models.Model):
    user_id = models.ForeignKey(
        User, related_name="following", on_delete=models.CASCADE
    )

    following_user_id = models.ForeignKey(
        User, related_name="followers", on_delete=models.CASCADE
    )

    # add info about when user started following
    followed_on = models.DateTimeField(auto_now_add=True)
