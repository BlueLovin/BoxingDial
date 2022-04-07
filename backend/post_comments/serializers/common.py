from accounts.serializers import SmallUserSerializer, SmallUserWithProfileSerializer
from rest_framework import serializers
from ..models import PostComment, PostCommentEntities


class PostCommentEntitiesSerializer(serializers.ModelSerializer):
    mentioned_users = SmallUserSerializer(many=True)

    class Meta:
        model = PostCommentEntities
        fields = ("mentioned_users",)


class ReplySerializer(serializers.ModelSerializer):
    owner = SmallUserWithProfileSerializer(many=False)
    entities = PostCommentEntitiesSerializer(many=False)

    class Meta:
        model = PostComment
        fields = (
            "id",
            "owner",
            "content",
            "username",
            "entities",
            "vote_score",
            "is_voted_up",
            "is_voted_down",
        )


class CommentSerializer(serializers.ModelSerializer):
    replies = ReplySerializer(read_only=True, many=True)
    owner = SmallUserWithProfileSerializer(many=False)
    entities = PostCommentEntitiesSerializer(many=False)

    class Meta:
        model = PostComment
        fields = (
            "id",
            "post",
            "content",
            "owner",
            "entities",
            "username",
            "vote_score",
            "is_voted_up",
            "is_voted_down",
            "replies",
            "parent",
        )

        requires_context = True