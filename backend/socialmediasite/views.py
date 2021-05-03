from rest_framework import viewsets, permissions, generics
from .models import Post, PostComment
from .serializers import PostSerialzer, CommentSerializer, UserSerializer
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User


# Create your views here.
class UsersView(generics.ListAPIView):
	serializer_class = UserSerializer
	queryset = User.objects.all()

	def get_queryset(self):
		return User.objects.all()

class UserPostListView(generics.ListAPIView):
	serializer_class = PostSerialzer
	queryset = Post.objects.all()

	def get_queryset(self):
		return Post.objects.filter(owner=self.kwargs['user'])

class UserCommentListView(generics.ListAPIView):
	serializer_class = CommentSerializer
	queryset = PostComment.objects.all()

	def get_queryset(self):
		return PostComment.objects.filter(owner=self.kwargs['user'])

class PostView(viewsets.ModelViewSet):

    serializer_class = PostSerialzer

    def get_queryset(self):
        return Post.objects.all()
        # return self.request.user.posts.all() // authenticated version

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class PostCommentsView(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    queryset = PostComment.objects.all()
