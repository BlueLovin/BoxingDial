from rest_framework import serializers
from rest_framework.permissions import IsAuthenticated
from accounts.serializers import UserWithFollowageSerializer
from fights.serializers.common import SmallFightSerializer, TinyFightSerializer
from .models import Post, PostComment, PostLike


class TinyPostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ("id", "content", "date", "owner", "username")


class ReplySerializer(serializers.ModelSerializer):
    class Meta:
        model = PostComment
        fields = (
            "id",
            "content",
            "username",
            "vote_score",
            "is_voted_up",
            "is_voted_down",
        )


class CommentSerializer(serializers.ModelSerializer):
    replies = ReplySerializer(read_only=True, many=True)

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

    def create(self, validated_data):
        owner = self.context["request"].user

        if owner.is_anonymous:
            raise serializers.DjangoValidationError("not logged in")

        username = owner.username

        comment = PostComment.objects.create(
            owner=owner, username=username, **validated_data
        )

        # upvote comment
        comment.votes.up(owner.id)

        # annotate response
        comment.is_voted_up = True
        comment.vote_score = 1
        return comment


class TruncatedPostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ("id", "username", "truncated_content")


class FeedCommentSerializer(serializers.ModelSerializer):
    post = TruncatedPostSerializer(many=False)

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

    def create(self, validated_data):
        owner = self.context["request"].user

        if owner.is_anonymous:
            raise IsAuthenticated(detail=None, code=None)

        comment_data = []
        username = owner.username
        post = Post.objects.create(owner=owner, username=username, **validated_data)

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
