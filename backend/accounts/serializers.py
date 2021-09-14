from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserFollowing
from django.contrib.auth import authenticate

#User Serializer
class UserSerializer(serializers.ModelSerializer):
    posts_count = serializers.IntegerField()

    class Meta:
        model = User
        fields = ["id", "username", "posts_count"]


class SmallUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username')

class UserFollowingSerializer(serializers.ModelSerializer):
    following_user_id = SmallUserSerializer()
    class Meta:
        model = UserFollowing
        fields = ("following_user_id", "followed_on")
        
class FollowersSerializer(serializers.ModelSerializer):
    user_id = SmallUserSerializer()
    class Meta:
        model = UserFollowing
        fields = ("user_id", "followed_on")

class UserWithFollowersSerializer(serializers.ModelSerializer):
    following = UserFollowingSerializer(many=True)
    followers = FollowersSerializer(many=True)
    class Meta:
        unique_together = ['followers, following']
        model = User
        fields = ('id', 'username', 'followers', "following")

#Register Serializer
class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password')
        extra_kwargs = {'password':{'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            validated_data['username'],
            validated_data['email'],
            validated_data['password']
        )
        return user
#Login Serializer

class LoginSerializer(serializers.Serializer):
    class Meta:
        model = User
        fields = ("username", "password")
    username = serializers.CharField()
    password = serializers.CharField()

    def validate(self, data):
        user = authenticate(**data)
        if user and user.is_active:
            return user
        raise serializers.ValidationError("Incorrect Credentials.")
