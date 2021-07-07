from rest_framework import generics, permissions, viewsets
from rest_framework.response import Response
from knox.models import AuthToken
from django.db import models
import json
# from django.contrib.auth import User
from django.contrib.auth.models import User
from .models import UserFollowing
from .serializers import UserSerializer, UserFollowingSerializer,RegisterSerializer, LoginSerializer


class RegisterAPI(generics.GenericAPIView):
    serializer_class = RegisterSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token = AuthToken.objects.create(user)
        return Response({
            "user":
            UserSerializer(user, context=self.get_serializer_context()).data,
            "token":
            token[1]
        })


class LoginAPI(generics.GenericAPIView):
    serializer_class = LoginSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data
        token = AuthToken.objects.create(user)
        return Response({
            "user":
            UserSerializer(user, context=self.get_serializer_context()).data,
            "token":
            token[1]  # must be subscripted 
        })


class UserAPI(generics.RetrieveAPIView):
    permission_classes = [
        permissions.IsAuthenticated,
    ]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


class AddFollowerView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request, format=None):
        user = self.request.user
        follow = User.objects.get(id=self.request.data.get('follow'))
        if(user != follow):
            new_follower = UserFollowing.objects.get_or_create(user_id=user,
                following_user_id=follow)[0]
        else:
            return Response("User can not follow themself u dumb shit")
        return Response({
            "follow_object": 
            UserFollowingSerializer(new_follower, 
            context=self.get_serializer_context()).data,

        })
        
class DeleteFollowerView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request, format=None):
        user = self.request.user
        unfollow = User.objects.get(id=self.request.data.get('unfollow'))
        new_follower = UserFollowing.objects.get(user_id=user,
            following_user_id=unfollow).delete()
        # return Response("unfollowed successfully")
        return Response({
            "user": 
            UserSerializer(user, 
            context=self.get_serializer_context()).data,

        })