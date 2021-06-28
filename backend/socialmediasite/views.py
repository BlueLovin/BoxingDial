from django.http import response
from rest_framework import viewsets, permissions, generics, status
from .models import Post, PostComment, Fight
from .serializers import CreatePostSerializer, PostSerializer, CommentSerializer, SmallFightSerializer, UserSerializer, FightSerializer, SmallPostSerializer
from django.shortcuts import get_object_or_404
from .permissions import IsAdminUserOrReadOnly, IsOwnerOrReadOnly
from django.contrib.auth.models import User
from django.db.models import Count, Prefetch

# all users - /api/users
class UsersView(generics.ListAPIView):
    serializer_class = UserSerializer

    def get_queryset(self):
        return User.objects.all().annotate(posts_count=Count('posts'))

# single user - /api/users/{userID}
class UserView(generics.ListAPIView):
    serializer_class = UserSerializer

    def get_queryset(self):
        return User.objects.filter(id=self.kwargs['user']).annotate(posts_count=Count('posts'))

# user's comments - /api/users/{userID}/comments
class UserCommentListView(generics.ListAPIView):
    serializer_class = CommentSerializer

    def get_queryset(self):
        return PostComment.objects.filter(owner=self.kwargs['user']).order_by('-id')

# user's posts - /api/users/{userID}/posts
class UserPostListView(generics.ListAPIView):
    serializer_class = SmallPostSerializer

    def get_queryset(self):
        return Post.objects.filter(owner=self.kwargs['user']).annotate(comment_count=Count('comments')).order_by('-id')

# all posts /api/posts
class PostsView(generics.ListAPIView):
    serializer_class = SmallPostSerializer

    def get_queryset(self):
        return Post.objects.all().annotate(comment_count=Count('comments'))


class CreatePostView(viewsets.ModelViewSet):
    serializer_class = CreatePostSerializer

    def get_queryset(self):
        return Post.objects.all()

    def perform_create(self, serializer):
        serializer.save()

# single post - /api/post/{postID}
class PostView(generics.RetrieveDestroyAPIView):
    permission_classes = [IsOwnerOrReadOnly]
    serializer_class = PostSerializer

    def get_queryset(self):
        return Post.objects.filter(id=self.kwargs['pk']).annotate(comment_count=Count('comments'))

# 5 most popular posts, popularity determined by number of comments
class PopularPostsView(generics.ListAPIView):
    serializer_class = SmallPostSerializer

    def get_queryset(self):
        return Post.objects.annotate(comment_count=Count('comments')).order_by('-comment_count')[:5]

# all comments /api/comments
class PostCommentsView(viewsets.ModelViewSet):
    permission_classes = [IsOwnerOrReadOnly]
    serializer_class = CommentSerializer
    queryset = PostComment.objects.all()

# single fight /api/fights/{id}
class FightView(generics.RetrieveAPIView):
    serializer_class = FightSerializer
    def get_queryset(self):
        return Fight.objects.filter(id=self.kwargs['pk']).prefetch_related(
            Prefetch('posts', Post.objects.annotate(comment_count=Count('comments')))).annotate(
            posts_count=Count('posts'))

# all fights /api/fights
class FightsView(generics.ListAPIView):
    serializer_class = FightSerializer
    query = Fight.objects.all().prefetch_related(
            Prefetch('posts', Post.objects.annotate(comment_count=Count('comments')))).annotate(
        posts_count=Count('posts')).order_by('-id')
    queryset = query[:5]  # five most recent fights

# 5 most popular fights, popularity determined by number of posts
class PopularFightsView(generics.ListAPIView):
    serializer_class = FightSerializer
    queryset = Fight.objects.all().prefetch_related(
            Prefetch('posts', Post.objects.annotate(comment_count=Count('comments')))).annotate(
            posts_count=Count('posts')).order_by('-posts_count')[:5]

# all fights without posts field
class SmallFightView(generics.ListAPIView):
    serializer_class = SmallFightSerializer
    queryset = Fight.objects.all()
