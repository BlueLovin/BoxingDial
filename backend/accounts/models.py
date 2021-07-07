from django.db import models
from django.contrib.auth.models import User


class UserFollowing(models.Model):
    user_id = models.ForeignKey(User, related_name="following", on_delete=models.CASCADE)

    following_user_id = models.ForeignKey(User, related_name="followers", on_delete=models.CASCADE)

    # You can even add info about when user started following
    followed_on = models.DateTimeField(auto_now_add=True)
