from rest_framework import serializers
from .models import Post, PostComment

class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostComment
        fields = ('id', 'post', 'content')

class PostSerialzer(serializers.ModelSerializer):
    comments = CommentSerializer(many=True)
    class Meta:
        model = Post
        fields = ('id', 'fight', 'content', 'comments')

    def create(self, validated_data):
        comment_data = validated_data.pop('comments')
        post = Post.objects.create(**validated_data)
        for comments in comment_data:
            PostComment.objects.create(Post=post, **comments)
        return post