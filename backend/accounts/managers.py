from django.core import exceptions
from django.db import models


class UserManager(models.Manager):
    def is_user_blocked(self, request, user_profile):
        client_has_profile = hasattr(request.user, "profile")

        if client_has_profile == False:
            return False

        client_user_profile = request.user.profile
        return user_profile in client_user_profile.blocked_users.all()

    def user_blocks_you(self, request, user_profile):
        client_has_profile = hasattr(request.user, "profile")

        if client_has_profile == False:
            return False

        client_user_profile = request.user.profile
        return client_user_profile in user_profile.blocked_users.all()

    # this excludes the users that you block
    def exclude_blocked_users(self, request):
        this_user = request.user
        client_has_profile = hasattr(this_user, "profile")

        # if logged out or user has no profile, return original query
        if client_has_profile == False:
            return super().get_queryset()

        blocked_user_ids = this_user.profile.blocked_users.all().values_list(
            "id", flat=True
        )

        if self.model.__name__ == "PostComment":
            return (
                super().get_queryset()
                # exclude comments from people that you block
                .exclude(owner__profile__id__in=blocked_user_ids)
                # exclude comments from people that block you
                .exclude(
                    owner__profile__blocked_users__id__icontains=this_user.profile.id
                )
                # exclude comments on a post where the owner of the post blocks you
                .exclude(
                    post__owner__profile__blocked_users__id__icontains=this_user.profile.id
                )
            )

        return (
            super()
            .get_queryset()
            .exclude(owner__profile__id__in=blocked_user_ids)
            .exclude(owner__profile__blocked_users__id__icontains=this_user.profile.id)
        )
