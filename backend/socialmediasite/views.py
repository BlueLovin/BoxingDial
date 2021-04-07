from django.shortcuts import render
from rest_framework import viewsets
from .serializers import PostSerialzer, PostCommentSerializer
from .models import Post, PostComment

# Create your views here.

class PostView(viewsets.ModelViewSet):
    serializer_class = PostSerialzer
    queryset = Post.objects.all()

class PostCommentsView(viewsets.ModelViewSet):
    serializer_class = PostCommentSerializer
    queryset = PostComment.objects.all()
