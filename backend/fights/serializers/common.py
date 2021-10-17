from rest_framework import serializers
from posts.models import Post
from ..models import Fight


class SmallFightSerializer(serializers.ModelSerializer):
    class Meta:
        model = Fight
        fields = ("id", "title", "description", "result", "date", "image_URL")


class TinyFightSerializer(serializers.ModelSerializer):
    class Meta:
        model = Fight
        fields = ("id", "title", "result", "date", "image_URL")
