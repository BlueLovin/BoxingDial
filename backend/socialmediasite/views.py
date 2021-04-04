from django.shortcuts import render
from rest_framework import viewsets
from .serializers import PostSerialzer
from .models import Post

# Create your views here.

class PostView(viewsets.ModelViewSet):
    serializer_class = PostSerialzer
    queryset = Post.objects.all()
