from http import HTTPStatus
from itertools import chain
from django.db.models.aggregates import Count
from django.db.models.expressions import Exists, OuterRef
from django.http.response import HttpResponse
from rest_framework import generics
from django.contrib.auth.models import User
from rest_framework import exceptions
from django.db.models.query import Prefetch
from rest_framework.exceptions import NotAuthenticated
from rest_framework.response import Response
from vote.models import DOWN, UP, Vote
from accounts.serializers import (
    FollowersSerializer,
    ProfileSerializer,
    UserFollowingSerializer,
    UserSerializer,
)
from accounts.managers import UserManager
from accounts.models import UserFollowing
from accounts.feed_api import UserFeedByRecentView
from backend.responses import BoxingDialResponses
from posts.models import Post, PostLike, Repost
from post_comments.models import PostComment
from posts.serializers import (
    RepostSerializer,
    SmallPostSerializer,
)
from post_comments.serializers.common import CommentSerializer


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

    def get(self, request, username, format=None):
        logged_in = request.user.is_authenticated

        # this_user is the user that the client user is viewing
        this_user = User.objects.annotate(posts_count=Count("posts")).get(
            username=username
        )

        if this_user == request.user or logged_in == False:
            return Response(UserSerializer(this_user).data)

        # check viewing permissions
        this_user_profile = this_user.profile

        # check to see if user follows you or if you follow the user
        following = this_user.followers.filter(user_id=request.user.id).exists()
        follows_you = request.user.followers.filter(user_id=this_user.id).exists()
        blocks_you = UserManager.user_blocks_you(None, request, this_user.profile)
        blocked = UserManager.is_blocked_by_you(None, request, this_user.profile)

        profile_data = ProfileSerializer(this_user_profile).data
        return Response(
            {
                "id": this_user.id,
                "username": this_user.username,
                "posts_count": this_user.posts.count(),
                "is_following": following,
                "follows_you": follows_you,
                "profile": profile_data,
                "blocks_you": blocks_you,
                "blocked": blocked,
            }
        )


# get a user's following accounts - /api/users/<str:user>/following/
class UserFollowingView(generics.ListAPIView):
    serializer_class = UserFollowingSerializer

    def get_queryset(self):
        return User.objects.get(username=self.kwargs["user"]).following


# get a user's followers - /api/users/<str:user>/followers/
class UserFollowersView(generics.ListAPIView):
    serializer_class = FollowersSerializer

    def get_queryset(self):
        return User.objects.get(username=self.kwargs["user"]).followers


# user's comments - /api/users/{username}/comments
class UserCommentListView(generics.ListAPIView):
    serializer_class = CommentSerializer

    def get(self, request, user):
        client_user_id = request.user.id

        username = user

        this_user_profile = User.objects.get(username=username).profile

        if request.user.is_authenticated:
            if UserManager.user_blocks_you(None, request, this_user_profile):
                return BoxingDialResponses.USER_DOESNT_EXIST_RESPONSE
            elif UserManager.is_blocked_by_you(None, request, this_user_profile):
                return BoxingDialResponses.BLOCKED_USER_RESPONSE

        return Response(
            CommentSerializer(
                PostComment.objects.filter(username=username)
                .annotate(
                    is_voted_down=Exists(
                        Vote.objects.filter(
                            user_id=client_user_id,
                            action=DOWN,
                            object_id=OuterRef("pk"),
                        )
                    ),
                    is_voted_up=Exists(
                        Vote.objects.filter(
                            user_id=client_user_id, action=UP, object_id=OuterRef("pk")
                        )
                    ),
                )
                .order_by("-id"),
                many=True,
            ).data,
            status=200,
        )


# user's posts - /api/users/{username}/posts
class UserPostListView(generics.ListAPIView):
    serializer_class = SmallPostSerializer

    def get(self, request, username):
        client_user = request.user
        this_user_profile = User.objects.get(username=username).profile

        if UserManager.user_blocks_you(None, request, this_user_profile):
            return BoxingDialResponses.USER_DOESNT_EXIST_RESPONSE

        if client_user.is_authenticated:
            post_annotation = Post.objects.annotate(
                comment_count=Count("comments", distinct=True),
                liked=Exists(
                    PostLike.objects.filter(post=OuterRef("pk"), user=request.user)
                ),
                like_count=Count("post_likes", distinct=True),
                repost_count=Count("reposts", distinct=True),
                is_reposted=Exists(
                    Repost.objects.filter(reposter=request.user, post=OuterRef("pk"))
                ),
            )

        else:
            post_annotation = Post.objects.annotate(
                like_count=Count("post_likes", distinct=True),
                comment_count=Count("comments", distinct=True),
                repost_count=Count("reposts", distinct=True),
            )

        posts = SmallPostSerializer(
            post_annotation.filter(username=username).order_by("-id"),
            many=True,
        ).data

        reposts = RepostSerializer(
            Repost.objects.filter(reposter__username=username)
            .prefetch_related(Prefetch("post", post_annotation))
            .order_by("-id"),
            many=True,
        ).data

        v = UserFeedByRecentView()
        reposts = v.remove_duplicate_reposts(reposts)

        combined_posts = list(chain(posts, reposts))

        # sort combined list by date
        feed_response = sorted(combined_posts, key=lambda k: k["date"], reverse=True)

        return Response(feed_response, 200)


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


# block a user - /api/user/block/<int:id>/
class BlockUserView(generics.UpdateAPIView):
    serializer_class = UserSerializer

    def put(self, request, id, *args, **kwargs):
        user_to_block = User.objects.get(id=id).profile
        this_user = request.user
        this_user_profile = this_user.profile

        if this_user.is_authenticated == False:
            raise exceptions.ValidationError()

        if (
            user_to_block not in this_user_profile.blocked_users.all()
            and this_user_profile != user_to_block
        ):
            this_user_profile.blocked_users.add(user_to_block)

        elif this_user_profile == user_to_block:
            return Response("Can not block yourself.", status=HTTPStatus.BAD_REQUEST)

        # unfollow user/make them unfollow you
        following_objects = UserFollowing.objects.filter(
            user_id=this_user, following_user_id=user_to_block.user
        ) | UserFollowing.objects.filter(
            user_id=user_to_block.user, following_user_id=this_user
        )

        following_objects.delete()

        return HttpResponse(200)


# unblock a user - /api/user/unblock/<int:id>/
class UnblockUserView(generics.UpdateAPIView):
    serializer_class = UserSerializer

    def put(self, request, id, *args, **kwargs):
        user_to_unblock = User.objects.get(id=id).profile
        this_user = request.user
        this_user_profile = this_user.profile

        if this_user.is_authenticated == False:
            raise exceptions.ValidationError()

        if (
            user_to_unblock in this_user_profile.blocked_users.all()
            and this_user_profile != user_to_unblock
        ):
            this_user_profile.blocked_users.remove(user_to_unblock)

        elif this_user_profile == user_to_unblock:
            return Response("Can not unblock yourself.", status=HTTPStatus.BAD_REQUEST)

        return HttpResponse(200)
