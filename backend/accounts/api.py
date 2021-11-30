import json
from django.db.models.expressions import Exists, OuterRef, Value
from django.db.models.fields import IntegerField
from django.http.response import HttpResponseBadRequest
from posts.serializers import FeedCommentSerializer, SmallPostSerializer
from django.db.models.aggregates import Count
from django.db.models.query import Prefetch
from rest_framework import generics, permissions
from rest_framework.response import Response
from knox.models import AuthToken
from itertools import chain
from django.contrib.auth.models import User
from .models import UserFollowing, UserProfile
from posts.models import Post, PostComment, PostLike
from .serializers import (
    SmallUserSerializer,
    UserFollowingSerializer,
    RegisterSerializer,
    LoginSerializer,
    UserWithFollowersSerializer,
)
from notifications.models import Notification
from vote.models import Vote, DOWN, UP


class RegisterAPI(generics.GenericAPIView):
    serializer_class = RegisterSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # try to create user
        try:
            user = serializer.save()
            UserProfile.objects.create(user=user)
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
                "token": token[1],  # must be subscripted
            }
        )


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

    def post(self, request, format=None):
        user = self.request.user
        follow = User.objects.get(id=self.request.data.get("follow"))
        
        if user != follow:
            notification_text = f"{user.username} just followed you!"
            UserFollowing.objects.get_or_create(user_id=user, following_user_id=follow)
            Notification.objects.get_or_create(
                recipient=follow, text=notification_text, post_id=-1
            )

        else:
            return Response("User can not follow themself, wtf are you doing?")

        return Response(
            {
                "response": "followed",
            }
        )


class DeleteFollowerView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, format=None):
        user = self.request.user
        unfollow = User.objects.get(id=self.request.data.get("unfollow"))

        UserFollowing.objects.get(user_id=user, following_user_id=unfollow).delete()
        return Response(
            {
                "response": "unfollowed",
            }
        )


class UserFeedByRecentView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, format=None):
        user_id = request.user.id

        # get following user IDs
        follower_user_ids = (
            UserFollowing.objects.filter(user_id=request.user)
            .values_list("following_user_id_id", flat=True)
            .distinct()
        )

        # get posts and comments from following users
        posts = (
            Post.objects.filter(owner__in=follower_user_ids)
            .annotate(
                comment_count=Count("comments", distinct=True),
                liked=Exists(
                    PostLike.objects.filter(post=OuterRef("pk"), user=self.request.user)
                ),
                like_count=Count("post_likes", distinct=True),
            )
            .order_by("-id")
        )

        comments = (
            PostComment.objects.filter(
                owner__in=follower_user_ids, parent=None, post=not None
            )
            .annotate(
                is_voted_down=Exists(
                    Vote.objects.filter(
                        user_id=user_id,
                        action=DOWN,
                        object_id=OuterRef("pk"),
                    )
                ),
                is_voted_up=Exists(
                    Vote.objects.filter(
                        user_id=user_id, action=UP, object_id=OuterRef("pk")
                    )
                ),
            )
            .order_by("-id")
        )

        # get posts and comments from logged in user
        user_posts = (
            Post.objects.filter(owner__in=[request.user])
            .annotate(
                like_count=Count("post_likes", distinct=True),
                liked=Exists(
                    PostLike.objects.filter(post=OuterRef("pk"), user=self.request.user)
                ),
                comment_count=Count("comments", distinct=True),
            )
            .order_by("-id")
        )

        user_comments = (
            # parent=None to exclude replies to other comments
            PostComment.objects.filter(
                owner__in=[request.user], parent=None, post=not None
            )
            .annotate(
                is_voted_down=Exists(
                    Vote.objects.filter(
                        user_id=user_id,
                        action=DOWN,
                        object_id=OuterRef("pk"),
                    )
                ),
                is_voted_up=Exists(
                    Vote.objects.filter(
                        user_id=user_id, action=UP, object_id=OuterRef("pk")
                    )
                ),
            )
            .order_by("-id")
        )

        # combine post list and comment list
        combined = list(
            chain(
                SmallPostSerializer(posts, many=True).data,
                SmallPostSerializer(user_posts, many=True).data,
                FeedCommentSerializer(comments, many=True).data,
                FeedCommentSerializer(user_comments, many=True).data,
            )
        )

        # sort combined list by date
        newlist = sorted(combined, key=lambda k: k["date"], reverse=True)

        return Response(newlist)


class UserFollowingView(generics.ListAPIView):
    queryset = UserFollowing.objects.prefetch_related(
        Prefetch("following_user_id")
    ).all()
    serializer_class = UserFollowingSerializer
