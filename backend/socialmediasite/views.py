from rest_framework import viewsets, permissions
from .models import Post, PostComment
from .serializers import PostSerialzer, CommentSerializer

# Create your views here.

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