from django.db.models.expressions import Exists, OuterRef, Subquery
from posts.serializers import FeedCommentSerializer, SmallPostSerializer
from django.db.models.aggregates import Count
from django.db.models.query import Prefetch
from rest_framework import generics, permissions
from rest_framework.response import Response
from knox.models import AuthToken
from itertools import chain
from django.contrib.auth.models import User
from .models import UserFollowing
from posts.models import Post, PostComment, PostLike
from .serializers import (
    SmallUserSerializer,
    UserSerializer,
    UserFollowingSerializer,
    RegisterSerializer,
    LoginSerializer,
    UserWithFollowersSerializer,
)

class RegisterAPI(generics.GenericAPIView):
    serializer_class = RegisterSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token = AuthToken.objects.create(user)
        return Response(
            {
                "user": SmallUserSerializer(
                    user, context=self.get_serializer_context()
                ).data,
                "token": token[1],
            }
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
        return self.request.user


class AddFollowerView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, format=None):
        user = self.request.user
        follow = User.objects.get(id=self.request.data.get("follow"))
        if user != follow:
            new_follower = UserFollowing.objects.get_or_create(
                user_id=user, following_user_id=follow
            )[0]
        else:
            return Response("User can not follow themself, u dumb shit")
        return Response(
            {"response": "followed",}
        )


class DeleteFollowerView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, format=None):
        user = self.request.user
        unfollow = User.objects.get(id=self.request.data.get("unfollow"))
        UserFollowing.objects.get(user_id=user, following_user_id=unfollow).delete()
        return Response(
            {"response": "unfollowed",}
        )


class UserFeedByRecentView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, format=None):
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
                        PostLike.objects.filter(
                            post=OuterRef('pk'), user=self.request.user
                        )
                    ),
                    like_count=Count("post_likes", distinct=True),
                )
            .order_by("-id")
        )

        comments = PostComment.objects.filter(owner__in=follower_user_ids).order_by(
            "-id"
        )

        # get posts and comments from logged in user
        user_posts = (
            Post.objects.filter(owner__in=[request.user])
            .annotate(
                like_count=Count("post_likes", distinct=True),
                liked=Exists(
                        PostLike.objects.filter(
                            post=OuterRef('pk'), user=self.request.user
                        )
                    ),
                comment_count=Count("comments", distinct=True),
            )
            .order_by("-id")
        )

        user_comments = PostComment.objects.filter(owner__in=[request.user]).order_by(
            "-id"
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
