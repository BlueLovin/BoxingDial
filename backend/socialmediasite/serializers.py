from rest_framework import serializers
from .models import Post, PostComment, Fight
from django.contrib.auth.models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username']

class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostComment
        fields = ('id', 'post', 'content', 'owner', 'username')
    def create(self, validated_data):
        # content = validated_data.pop('content')
        # fight = validated_data.pop('fight')
        # owner = validated_data.pop('owner')
        # username = owner.username
        post = PostComment.objects.create(**validated_data)
        return post
class SmallFightSerializer(serializers.ModelSerializer):
    class Meta:
        model = Fight
        fields = ('id', 'title', 'description', 'result', 'date')
class PostSerialzer(serializers.ModelSerializer):
    comments = CommentSerializer(many=True)
    fight = SmallFightSerializer(many=False)

    class Meta:
        model = Post
        fields = ('id', 'fight', 'content', 'comments', 'owner', 'username')
        

    def create(self, validated_data):
        comment_data = validated_data.pop('comments')
        post = Post.objects.create(**validated_data)
        owner = validated_data.pop('owner')
        username = owner.username
        for comments in comment_data:
            PostComment.objects.create(Post=post, **comments, owner=owner, username=username)
        return post

class FightSerializer(serializers.ModelSerializer):
    posts = PostSerialzer(many=True)
    
    class Meta:
        model = Fight
        fields = ('id', 'title', 'description', 'result', 'date', 'image_URL', 'posts')

    def create(self, validated_data):
        posts_data = validated_data.pop('posts')
        fight = Fight.objects.create(**validated_data)
        for posts in posts_data:
            Post.objects.create(Fight=self.title, **posts)
        return fight 