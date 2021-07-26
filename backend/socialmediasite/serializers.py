from rest_framework import serializers
from .models import Post, PostComment, Fight
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    posts_count = serializers.IntegerField()
    class Meta:
        model = User
        fields = ['id', 'username', 'posts_count']
        
class TinyPostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ('id', 'content', 'date', 'owner', 'username')

class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostComment
        fields = ('id', 'post', 'content', 'owner', 'username')
    def create(self, validated_data):
        comment = PostComment.objects.create(**validated_data)
        return comment
    
class FeedCommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostComment
        fields = ('id', 'post', 'date', 'content', 'owner', 'username')

class SmallFightSerializer(serializers.ModelSerializer):
    class Meta:
        model = Fight
        fields = ('id', 'title', 'description', 'result', 'date', 'image_URL')

class TinyFightSerializer(serializers.ModelSerializer):
    class Meta:
        model = Fight
        fields = ('id', 'title', 'result', 'date', 'image_URL')

class PostSerializer(serializers.ModelSerializer):
    comments = CommentSerializer(many=True)
    fight = SmallFightSerializer(many=False)
    comment_count = serializers.IntegerField()

    class Meta:
        model = Post
        fields = ('id', 'date', 'fight', 'comment_count', 'content', 'comments', 'owner', 'username')
        
class CreatePostSerializer(serializers.ModelSerializer):
    comments = CommentSerializer(many=True)

    class Meta:
        model = Post
        fields = ('id', 'date', 'fight', 'content', 'comments', 'owner', 'username')
        
    def create(self, validated_data):
        comment_data = validated_data.pop('comments')
        post = Post.objects.create(**validated_data)
        owner = validated_data.pop('owner')
        username = validated_data.pop('username')
        for comments in comment_data:
            PostComment.objects.create(Post=post, **comments, owner=owner, username=username)
        return post

class SmallPostSerializer(serializers.ModelSerializer):
    fight = TinyFightSerializer(many=False)
    comment_count = serializers.IntegerField()
    class Meta:
        model = Post
        fields = ('id', 'date', 'fight', 'content', 'comment_count', 'owner', 'username')
                
class FightSerializer(serializers.ModelSerializer):
    posts = SmallPostSerializer(many=True)
    posts_count = serializers.IntegerField()
    class Meta:
        model = Fight
        fields = ('id', 'title', 'description', 'result', 'date', 'image_URL','posts_count', 'posts')

    def create(self, validated_data):
        posts_data = validated_data.pop('posts')
        fight = Fight.objects.create(**validated_data)
        for posts in posts_data:
            Post.objects.create(Fight=self.title, **posts)
        return fight 