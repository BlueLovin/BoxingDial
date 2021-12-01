from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserFollowing, UserProfile
from django.contrib.auth import authenticate
import django.contrib.auth.password_validation as validators


# UserProfile Serializer
class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ["screen_name", "bio"]

# User Serializer
class UserSerializer(serializers.ModelSerializer):
    posts_count = serializers.IntegerField()
    profile = ProfileSerializer(many=False)

    class Meta:
        model = User
        fields = ["id", "username", "posts_count", "profile"]




# User Serializer
class UserWithFollowageSerializer(serializers.ModelSerializer):
    posts_count = serializers.IntegerField()
    is_following = serializers.BooleanField(default=False)
    follows_you = serializers.BooleanField(default=False)

    class Meta:
        model = User
        fields = ["id", "username", "posts_count", "is_following", "follows_you"]


class SmallUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username")


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
    unread_messages_count = serializers.IntegerField(default=0)

    class Meta:
        unique_together = ["followers, following"]
        model = User
        fields = ("id", "username", "followers", "following", "unread_messages_count")


# Register Serializer
class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "email", "password")
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        username = validated_data["username"]
        email = validated_data["email"]
        password = validated_data["password"]

        validators.validate_password(password=password)

        user = User.objects.create_user(
            username,
            email,
            password,
        )

        user.save()

        return user


# Login Serializer
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
