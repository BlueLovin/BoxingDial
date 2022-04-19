from email.policy import default
from accounts.serializers import (
    SmallUserSerializer,
    SmallUserWithProfileSerializer,
    UserWithFollowageSerializer,
)
from fights.serializers.common import SmallFightSerializer, TinyFightSerializer
from post_comments.serializers.common import CommentSerializer
from rest_framework import serializers

from .models import Post, PostEntities, PostLike, Repost


class TinyPostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ("id", "content", "date", "owner", "username")


class TruncatedPostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ("id", "username", "truncated_content")


class PostLikeSerializer(serializers.ModelSerializer):
    user = UserWithFollowageSerializer(many=False)

    class Meta:
        model = PostLike
        fields = ("user", "liked_on", "post")


class PostEntitiesSerializer(serializers.ModelSerializer):
    mentioned_users = SmallUserSerializer(many=True)

    class Meta:
        model = PostEntities
        fields = ("mentioned_users",)


class PostSerializer(serializers.ModelSerializer):
    comments = CommentSerializer(many=True)
    fight = SmallFightSerializer(many=False)
    comment_count = serializers.IntegerField()
    like_count = serializers.IntegerField()
    liked = serializers.BooleanField(default=False)
    owner = SmallUserWithProfileSerializer(many=False)
    entities = PostEntitiesSerializer(many=False)
    is_reposted = serializers.BooleanField(default=False)
    repost_count = serializers.IntegerField()

    class Meta:
        model = Post
        fields = (
            "id",
            "date",
            "fight",
            "is_reposted",
            "liked",
            "comment_count",
            "like_count",
            "repost_count",
            "content",
            "comments",
            "entities",
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
    entities = PostEntitiesSerializer(many=False)
    feed_type = serializers.CharField(default="post")
    is_reposted = serializers.BooleanField(default=False)
    repost_count = serializers.IntegerField()

    class Meta:
        model = Post
        fields = (
            "id",
            "date",
            "fight",
            "is_reposted",
            "feed_type",
            "content",
            "liked",
            "entities",
            "comment_count",
            "like_count",
            "repost_count",
            "owner",
            "username",
        )


class RepostSerializer(serializers.ModelSerializer):
    reposter = SmallUserWithProfileSerializer(many=False)
    post = SmallPostSerializer(many=False)
    feed_type = serializers.CharField(default="repost")
    is_reposted = serializers.BooleanField(default=False)

    class Meta:
        model = Repost
        fields = (
            "date",
            "reposter",
            "post",
            "is_reposted",
            "repost_message",
            "feed_type",
        )


class PostRepostsListSerializer(serializers.ModelSerializer):
    reposter = SmallUserWithProfileSerializer(many=False)

    class Meta:
        model = Repost
        fields = (
            "date",
            "reposter",
            "post",
            "repost_message",
        )
