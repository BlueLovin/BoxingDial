from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework.permissions import IsAuthenticated
from accounts.serializers import (
    SmallUserSerializer,
    SmallUserWithProfileSerializer,
    UserWithFollowageSerializer,
)
from fights.serializers.common import SmallFightSerializer, TinyFightSerializer
from .models import Post, PostComment, PostLike
from notifications.models import Notification


class TinyPostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ("id", "content", "date", "owner", "username")


class ReplySerializer(serializers.ModelSerializer):
    owner = SmallUserWithProfileSerializer(many=False)
    class Meta:
        model = PostComment
        fields = (
            "id",
            "owner",
            "content",
            "username",
            "vote_score",
            "is_voted_up",
            "is_voted_down",
        )


class CommentSerializer(serializers.ModelSerializer):
    replies = ReplySerializer(read_only=True, many=True)
    owner = SmallUserWithProfileSerializer(many=False)

    class Meta:
        model = PostComment
        fields = (
            "id",
            "post",
            "content",
            "owner",
            "username",
            "vote_score",
            "is_voted_up",
            "is_voted_down",
            "replies",
            "parent",
        )

        requires_context = True


class TruncatedPostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ("id", "username", "truncated_content")


class FeedCommentSerializer(serializers.ModelSerializer):
    post = TruncatedPostSerializer(many=False)
    owner = SmallUserWithProfileSerializer(many=False)

    class Meta:
        model = PostComment
        fields = (
            "id",
            "post",
            "date",
            "content",
            "owner",
            "username",
            "vote_score",
            "is_voted_up",
            "is_voted_down",
        )


class PostLikeSerializer(serializers.ModelSerializer):
    user = UserWithFollowageSerializer(many=False)

    class Meta:
        model = PostLike
        fields = ("user", "liked_on", "post")


class PostSerializer(serializers.ModelSerializer):
    comments = CommentSerializer(many=True)
    fight = SmallFightSerializer(many=False)
    comment_count = serializers.IntegerField()
    like_count = serializers.IntegerField()
    liked = serializers.BooleanField(default=False)
    owner = SmallUserWithProfileSerializer(many=False)

    class Meta:
        model = Post
        fields = (
            "id",
            "date",
            "fight",
            "comment_count",
            "liked",
            "like_count",
            "content",
            "comments",
            "owner",
            "username",
        )


class CreatePostSerializer(serializers.ModelSerializer):
    requires_context = True

    class Meta:
        model = Post
        fields = ("id", "date", "fight", "content")


class SmallPostSerializer(serializers.ModelSerializer):
    fight = TinyFightSerializer(many=False)
    comment_count = serializers.IntegerField()
    like_count = serializers.IntegerField()
    liked = serializers.BooleanField(default=False)
    owner = SmallUserWithProfileSerializer(many=False)

    class Meta:
        model = Post
        fields = (
            "id",
            "date",
            "fight",
            "content",
            "liked",
            "comment_count",
            "like_count",
            "owner",
            "username",
        )
