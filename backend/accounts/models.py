import django
from django.core import exceptions
from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    bio = models.CharField(max_length=500, blank=True, null=True, default='', editable=True)
    screen_name = models.CharField(max_length=15, blank=True, null=True, default='', editable=True)
    blocked_users = models.ManyToManyField("UserProfile", blank=True)

    #avatar = models.ImageField()



class UserFollowing(models.Model):
    user_id = models.ForeignKey(
        User, related_name="following", on_delete=models.CASCADE
    )

    following_user_id = models.ForeignKey(
        User, related_name="followers", on_delete=models.CASCADE
    )

    # add info about when user started following
    followed_on = models.DateTimeField(auto_now_add=True)


class UserManager(models.Manager):
    def exclude_blocked_users(self, request):
        this_user = request.user
        if(this_user.is_authenticated == False):
            raise exceptions.ValidationError("not logged in")
        
        return super().get_queryset().exclude(owner__in=this_user.profile.blocked_users.all().values_list('id', flat=True))