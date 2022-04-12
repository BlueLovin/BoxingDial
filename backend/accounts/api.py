from http import HTTPStatus
import json
from django.contrib.auth import authenticate
from django.db.models.expressions import Value
from django.db.models.fields import IntegerField
from django.http.response import HttpResponseBadRequest
from django.db.models.query import Prefetch
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from knox.models import AuthToken
from django.contrib.auth.models import User
from django.core.exceptions import ObjectDoesNotExist
from django.db import DataError

from accounts.managers import UserManager
from .models import UserFollowing, UserProfile
from .serializers import (
    SmallUserSerializer,
    UserFollowingSerializer,
    RegisterSerializer,
    LoginSerializer,
    UserWithFollowersSerializer,
)
from notifications.models import Notification


class RegisterAPI(generics.GenericAPIView):
    serializer_class = RegisterSerializer

    def post(self, request, *args, **kwargs):

        # make the username lowercase
        request.data["username"] = request.data["username"].lower()

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # try to create user
        try:
            # create user
            user = serializer.save()

            # initialize user profile
            UserProfile.objects.create(user=user, screen_name=user.username)

            # create token and login user
            token = AuthToken.objects.create(user)
            return Response(
                {
                    "user": SmallUserSerializer(
                        user, context=self.get_serializer_context()
                    ).data,
                    "token": token[1],
                }
            )

        # return errors if exception is thrown
        except Exception as e:
            if user:  # if user was created, rollback changes.
                user.delete()

            if type(e) == AttributeError:
                return HttpResponseBadRequest()

            if type(e) == DataError:
                return Response(
                    {"username": ["Username can only be 15 characters long"]},
                    status=400,
                )

            errors = dict()
            errors["errors"] = list(e.messages)

            return HttpResponseBadRequest(
                json.dumps(errors), content_type="application/json"
            )


class LoginAPI(generics.GenericAPIView):
    serializer_class = LoginSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data
        token = AuthToken.objects.create(user)
        return Response(
            {
                "user": SmallUserSerializer(
                    user, context=self.get_serializer_context()
                ).data,
                "token": token[1],
            }
        )


# DELETE the current user
# request:
# {
#     "password": "fuckyoubitch",
# }
class DeleteUserView(generics.DestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete_all_user_objects(self, user):
        for post in user.posts.all():
            for comment in post.comments.all():
                comment.delete()
            post.delete()

        for comment in user.comments.all():
            comment.delete()

        for following_object in user.following.all():
            following_object.delete()

        for like in user.user_likes.all():
            like.delete()

        user.profile.delete()

    def delete(self, request, format=None):
        if "password" not in request.data:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        # authenticate user
        user = request.user
        auth_data = {"username": user.username, "password": request.data["password"]}
        user = authenticate(**auth_data)

        if not user or not user.is_active:
            return Response(
                {"error": "incorrect password"}, status=status.HTTP_401_UNAUTHORIZED
            )

        # delete user
        self.delete_all_user_objects(user)
        user.delete()

        return Response(status=status.HTTP_200_OK)


class UserAPI(generics.RetrieveAPIView):
    permission_classes = [
        permissions.IsAuthenticated,
    ]
    serializer_class = UserWithFollowersSerializer

    def get_object(self):
        user = self.request.user
        return user

    def get(self, request, format=None):
        user = self.request.user
        unread_messages = Value(
            Notification.objects.filter(recipient=user, is_read=False).count(),
            output_field=IntegerField(),
        )

        # annotate user with unread messages count
        user = (
            User.objects.filter(id=user.id)
            .annotate(unread_messages_count=unread_messages)
            .first()
        )

        return Response(UserWithFollowersSerializer(user).data)


class AddFollowerView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    # request should look like this:
    # {
    #     "follow": {userID}
    # }
    def post(self, request, format=None):
        user = request.user

        # get the user that you wish to follow from the request
        try:
            follow = User.objects.get(id=self.request.data.get("follow"))
        except ObjectDoesNotExist:
            return Response(
                "User does not exist",
                HTTPStatus.BAD_REQUEST,
            )

        # if you block a user, you can not follow them.
        if UserManager.is_blocked_by_you(None, request, follow.profile):
            return Response(
                "You cannot follow a user that you have blocked.",
                HTTPStatus.BAD_REQUEST,
            )

        # if the user blocks you, YOU can not follow them
        if UserManager.user_blocks_you(None, request, follow.profile):
            return Response(
                "This user has blocked you.",
                HTTPStatus.BAD_REQUEST,
            )

        # can not follow yourself
        if user == follow:
            return Response(
                "User can not follow themself, wtf are you doing?",
                HTTPStatus.BAD_REQUEST,
            )

        # create follow object
        UserFollowing.objects.get_or_create(user_id=user, following_user_id=follow)

        # send notification to user who received the follow
        notification_text = f"{user.username} just followed you!"
        Notification.objects.get_or_create(
            recipient=follow,
            text=notification_text,
            post_id=-1,
            comment_id=-1,
            sender=user,
        )

        return Response(
            {
                "response": "followed",
            }
        )


class DeleteFollowerView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    # request should look like this:
    # {
    #     "unfollow": {userID}
    # }
    def post(self, request, format=None):
        user = request.user

        try:
            unfollow = User.objects.get(id=request.data.get("unfollow"))
            UserFollowing.objects.get(user_id=user, following_user_id=unfollow).delete()

        except ObjectDoesNotExist:
            return Response(
                "You are not following this user, or the user does not exist",
                HTTPStatus.BAD_REQUEST,
            )

        return Response(
            {
                "response": "unfollowed",
            }
        )


class UserFollowingView(generics.ListAPIView):
    queryset = UserFollowing.objects.prefetch_related(
        Prefetch("following_user_id")
    ).all()
    serializer_class = UserFollowingSerializer
