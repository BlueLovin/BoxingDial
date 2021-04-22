from rest_framework import serializers
from .models import Post, PostComment
from django.contrib.auth.models import User


class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostComment
        fields = ('id', 'post', 'content', 'owner', 'username')

class PostSerialzer(serializers.ModelSerializer):
    comments = CommentSerializer(many=True)
    class Meta:
        model = Post
        fields = ('id', 'fight', 'content', 'comments', 'owner', 'username')

    def create(self, validated_data):
        comment_data = validated_data.pop('comments')
        post = Post.objects.create(**validated_data)
        owner = validated_data.pop('owner')
        username = owner.username
        for comments in comment_data:
            PostComment.objects.create(Post=post, **comments, owner=owner)
        return post