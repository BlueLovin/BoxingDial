from rest_framework import serializers
from accounts.serializers import UserSerializer, SmallUserSerializer
from fights.serializers.common import SmallFightSerializer, TinyFightSerializer
from .models import Post, PostComment, PostLike
from django.contrib.auth.models import User


class TinyPostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ("id", "content", "date", "owner", "username")


class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostComment
        fields = ("id", "post", "content", "owner", "username")

    def create(self, validated_data):
        comment = PostComment.objects.create(**validated_data)
        return comment


class MicroPostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ("id", "username", "truncated_content")


class FeedCommentSerializer(serializers.ModelSerializer):
    post = MicroPostSerializer(many=False)

    class Meta:
        model = PostComment
        fields = ("id", "post", "date", "content", "owner", "username")


class PostLikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostLike
        fields = "__all__"


class PostSerializer(serializers.ModelSerializer):
    comments = CommentSerializer(many=True)
    fight = SmallFightSerializer(many=False)
    comment_count = serializers.IntegerField()
    like_count = serializers.IntegerField()
    liked = serializers.BooleanField(default=False)

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
    comments = CommentSerializer(many=True)

    class Meta:
        model = Post
        fields = ("id", "date", "fight", "content", "comments", "owner", "username")

    def create(self, validated_data):
        comment_data = validated_data.pop("comments")
        post = Post.objects.create(**validated_data)
        owner = validated_data.pop("owner")
        username = validated_data.pop("username")
        for comments in comment_data:
            PostComment.objects.create(
                Post=post, **comments, owner=owner, username=username
            )
        return post


class SmallPostSerializer(serializers.ModelSerializer):
    fight = TinyFightSerializer(many=False)
    comment_count = serializers.IntegerField()
    like_count = serializers.IntegerField()
    liked = serializers.BooleanField(default=False)

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