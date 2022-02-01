from ast import Return
from http import HTTPStatus
from os import stat
from telnetlib import STATUS
from django import http
from django.db.models.aggregates import Count
from django.db.models.expressions import Exists, OuterRef
from django.http.response import HttpResponse, HttpResponseBadRequest
from rest_framework import generics
from django.contrib.auth.models import User
from rest_framework import exceptions
from rest_framework.exceptions import NotAuthenticated
from rest_framework.response import Response
from vote.models import DOWN, UP, Vote
from accounts.serializers import (
    FollowersSerializer,
    ProfileSerializer,
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

    def get(self, request, user, format=None):

        this_user = User.objects.annotate(posts_count=Count("posts")).get(username=user)
        if this_user == request.user:
            return Response(UserSerializer(this_user).data)
        try:

            following = this_user.followers.filter(user_id=request.user.id).exists()

            follows_you = request.user.followers.filter(user_id=this_user.id).exists()
            profile = ProfileSerializer(this_user.profile).data

            return Response(
                {
                    "id": this_user.id,
                    "username": this_user.username,
                    "posts_count": this_user.posts.count(),
                    "is_following": following,
                    "follows_you": follows_you,
                    "profile": profile,
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
        user_id = self.request.user.id
        return (
            PostComment.objects.filter(username=self.kwargs["user"])
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


# change user profile /api/user/change-profile
class ChangeUserProfileView(generics.UpdateAPIView):
    serializer_class = UserSerializer

    def post(self, request, *args, **kwargs):
        user = request.user
        if user.is_anonymous:
            raise NotAuthenticated

        if "bio" in request.data:
            user.profile.bio = request.data["bio"]
            
        if "screen_name" in request.data:
            user.profile.screen_name = request.data["screen_name"]
            
        user.profile.save()

        return Response(ProfileSerializer(user.profile).data)


class BlockUserView(generics.UpdateAPIView):
    serializer_class = UserSerializer

    def put(self, request, id, *args, **kwargs):
        user_to_block = User.objects.get(id=id).profile
        this_user = request.user
        this_user_profile = this_user.profile

        if(this_user.is_authenticated == False):
            raise exceptions.ValidationError()
        
        if(user_to_block not in this_user_profile.blocked_users.all() and this_user_profile != user_to_block):
            this_user_profile.blocked_users.add(user_to_block)

        elif(this_user_profile == user_to_block):
            return Response("Can not block yourself.", status=HTTPStatus.BAD_REQUEST)    

        return HttpResponse(200)
