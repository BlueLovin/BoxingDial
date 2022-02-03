from django.core import exceptions
from django.db import models


class UserManager(models.Manager):
    def is_user_blocked(self, request, user_profile):
        client_user_profile = request.user.profile

        if user_profile in client_user_profile.blocked_users.all():
            return True

        return False

    def user_blocks_you(self, request, user_profile):
        client_user_profile = request.user.profile

        if client_user_profile in user_profile.blocked_users.all():
            return True

        return False

    # this excludes the users that you block
    def exclude_blocked_users(self, request):
        this_user = request.user
        if this_user.is_authenticated == False:
            return super().get_queryset()

        return (
            super()
            .get_queryset()
            .exclude(
                owner__in=this_user.profile.blocked_users.all().values_list(
                    "id", flat=True
                )
            )
        )

    # this excludes both users you block, and users that block you.
    def exclude_all_blocked_users(self, request):
        this_user = request.user
        if this_user.is_authenticated == False:
            raise exceptions.ValidationError("not logged in")

        return (
            super()
            .get_queryset()
            .exclude(
                owner__in=this_user.profile.blocked_users.all().values_list(
                    "id", flat=True
                )
            )
            .exclude(owner__profile__blocked_users__id__icontains=this_user.id)
        )
