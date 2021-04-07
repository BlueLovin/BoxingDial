from rest_framework import serializers
from .models import Post, PostComment



class PostCommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostComment
        fields = ('id', 'post', 'content')

class PostSerialzer(serializers.ModelSerializer):
    comments = PostCommentSerializer(many=True)
    class Meta:
        model = Post
        fields = ('id', 'fight', 'content', 'comments')