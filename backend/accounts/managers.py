from django.core import exceptions
from django.db import models


class UserManager(models.Manager):
    def is_user_blocked(self, request, user_profile):
        client_user_profile = request.user.profile
        return user_profile in client_user_profile.blocked_users.all()

    def user_blocks_you(self, request, user_profile):
        client_user_profile = request.user.profile
        return client_user_profile in user_profile.blocked_users.all()

    # this excludes the users that you block
    def exclude_blocked_users(self, request):
        this_user = request.user

        # if logged out, return original query
        if this_user.is_authenticated == False:
            return super().get_queryset()

        blocked_user_ids = this_user.profile.blocked_users.all().values_list(
            "id", flat=True
        )

        return (
            super()
            .get_queryset()
            .exclude(owner__profile__id__in=blocked_user_ids)
            .exclude(owner__profile__blocked_users__id__icontains=this_user.id)
        )
