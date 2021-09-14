from rest_framework import serializers
from posts.serializers import SmallPostSerializer
from posts.models import Post
from ..models import Fight

class FightSerializer(serializers.ModelSerializer):
    posts = SmallPostSerializer(many=True)
    posts_count = serializers.IntegerField()

    class Meta:
        model = Fight
        fields = (
            "id",
            "title",
            "description",
            "result",
            "date",
            "image_URL",
            "posts_count",
            "posts",
        )

    def create(self, validated_data):
        posts_data = validated_data.pop("posts")
        fight = Fight.objects.create(**validated_data)
        for posts in posts_data:
            Post.objects.create(Fight=self.title, **posts)
        return fight
