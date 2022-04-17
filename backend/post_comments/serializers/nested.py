from accounts.serializers import SmallUserWithProfileSerializer
from posts.serializers import TruncatedPostSerializer
from rest_framework import serializers

from ..models import PostComment
from .common import PostCommentEntitiesSerializer


class FeedCommentSerializer(serializers.ModelSerializer):
    post = TruncatedPostSerializer(many=False)
    owner = SmallUserWithProfileSerializer(many=False)
    entities = PostCommentEntitiesSerializer(many=False)
    feed_type = serializers.CharField(default="comment")

    class Meta:
        model = PostComment
        fields = (
            "id",
            "post",
            "date",
            "feed_type",
            "content",
            "owner",
            "entities",
            "username",
            "vote_score",
            "is_voted_up",
            "is_voted_down",
        )
