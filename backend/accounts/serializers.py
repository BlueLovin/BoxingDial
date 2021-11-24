from django.http.response import HttpResponse, HttpResponseBadRequest, HttpResponseServerError
from rest_framework import exceptions, serializers
from django.contrib.auth.models import User
from rest_framework.fields import IntegerField
from rest_framework.response import Response
from .models import UserFollowing
from django.contrib.auth import authenticate
import django.contrib.auth.password_validation as validators

# User Serializer
class UserSerializer(serializers.ModelSerializer):
    posts_count = serializers.IntegerField()

    class Meta:
        model = User
        fields = ["id", "username", "posts_count"]


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
        #validators.validate_password(password)

        errors = dict() 
        try:
            # validate the password and catch the exception
            validators.validate_password(password=password)

        # the exception raised here is different than serializers.ValidationError
        except exceptions.ValidationError as e:
            errors['password'] = list(e.messages)

        if errors:
            raise serializers.ValidationError(errors)

        user = User.objects.create_user(
            username,
            email,
            password,
        )
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
