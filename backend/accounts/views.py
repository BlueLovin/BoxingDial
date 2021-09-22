from django.db.models.aggregates import Count
from django.db.models.expressions import Exists, OuterRef
from django.shortcuts import render
from rest_framework import generics, viewsets, permissions
from django.contrib.auth.models import User
from django.views.generic import ListView
from rest_framework.response import Response

from accounts.serializers import (
    FollowersSerializer,
    UserFollowingSerializer,
    UserSerializer,
)
from posts.models import Post, PostComment, PostLike
from posts.serializers import CommentSerializer, SmallPostSerializer

# all users - /api/users
class UsersView(generics.ListAPIView):
    serializer_class = UserSerializer

    def get_queryset(self):
        return User.objects.all().annotate(posts_count=Count("posts"))


# single user - /api/users/{username}
class UserView(generics.GenericAPIView):
    serializer_class = UserSerializer

    def get_queryset(self):
        return User.objects.filter(username=self.kwargs["user"]).annotate(
            posts_count=Count("posts")
        )

    def get_object(self):
        return User.objects.annotate(posts_count=Count("posts")).get(
            username=self.kwargs["user"]
        )

    def get(self, request, user, format=None):
        this_user = self.get_object()
        if this_user == request.user:
            return Response(UserSerializer(this_user).data)
        try:
            following = this_user.followers.filter(user_id=request.user).exists()

            follows_you = request.user.followers.filter(user_id=this_user).exists()
            return Response(
                {
                    "id": this_user.id,
                    "username": this_user.username,
                    "posts_count": this_user.posts.count(),
                    "following": following,
                    "follows_you": follows_you,
                }
            )
        except Exception:
            return Response(UserSerializer(this_user).data)


class UserFollowingView(generics.ListAPIView):
    serializer_class = UserFollowingSerializer

    def get_queryset(self):
        return User.objects.get(username=self.kwargs["user"]).following


class UserFollowersView(generics.ListAPIView):
    serializer_class = FollowersSerializer

    def get_queryset(self):
        return User.objects.get(username=self.kwargs["user"]).followers


# user's comments - /api/users/{username}/comments
class UserCommentListView(generics.ListAPIView):
    serializer_class = CommentSerializer

    def get_queryset(self):
        return PostComment.objects.filter(username=self.kwargs["user"]).order_by("-id")


# user's posts - /api/users/{username}/posts
class UserPostListView(generics.ListAPIView):
    serializer_class = SmallPostSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated:
            return (
                Post.objects.filter(username=self.kwargs["user"])
                .annotate(
                    like_count=Count("post_likes", distinct=True),
                    comment_count=Count("comments", distinct=True),
                    liked=Exists(
                        PostLike.objects.filter(
                            post=OuterRef("pk"), user=self.request.user
                        )
                    ),
                )
                .order_by("-id")
            )
        else:
            return (
                Post.objects.filter(username=self.kwargs["user"])
                .annotate(
                    like_count=Count("post_likes", distinct=True),
                    comment_count=Count("comments", distinct=True),
                )
                .order_by("-id")
            )

