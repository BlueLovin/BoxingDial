from rest_framework import viewsets, permissions, generics
from .models import Post, PostComment, Fight
from .serializers import CreatePostSerializer, PostSerialzer, CommentSerializer, UserSerializer, FightSerializer, SmallPostSerialzer
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User


# all users - /api/users
class UsersView(generics.ListAPIView):
	serializer_class = UserSerializer

	def get_queryset(self):
		return User.objects.all()

# single user - /api/users/{userID}
class UserView(generics.ListAPIView):
	serializer_class = UserSerializer

	def get_queryset(self):
		return User.objects.filter(id=self.kwargs['user'])

# user's comments - /api/users/{userID}/comments
class UserCommentListView(generics.ListAPIView):
	serializer_class = CommentSerializer

	def get_queryset(self):
		return PostComment.objects.filter(owner=self.kwargs['user'])

# user's posts - /api/users/{userID}/posts
class UserPostListView(generics.ListAPIView):
	serializer_class = SmallPostSerialzer

	def get_queryset(self):
		return Post.objects.filter(owner=self.kwargs['user'])

# all posts /api/posts 
# OR single post -- /api/posts/{postID}
class PostsView(viewsets.ModelViewSet):
    serializer_class = SmallPostSerialzer

    def get_queryset(self):
        return Post.objects.all()

class CreatePostView(viewsets.ModelViewSet):
    serializer_class = CreatePostSerializer

    def get_queryset(self):
        return Post.objects.all()
        
    def perform_create(self, serializer):
        serializer.save()

# single post - /api/post/{postID}
class PostView(generics.ListAPIView):
	serializer_class = PostSerialzer

	def get_queryset(self):
		return Post.objects.filter(id=self.kwargs['postID'])

# all comments /api/comments
class PostCommentsView(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    queryset = PostComment.objects.all()

# all fights /api/fights
class FightView(viewsets.ModelViewSet):
    serializer_class = FightSerializer
    queryset = Fight.objects.all()

