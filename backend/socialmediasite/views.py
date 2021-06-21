from rest_framework import viewsets, permissions, generics
from .models import Post, PostComment, Fight
from .serializers import CreatePostSerializer, PostSerialzer, CommentSerializer, SmallFightSerializer, UserSerializer, FightSerializer, SmallPostSerialzer
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from django.db.models import Count

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
        return Post.objects.all().annotate(comment_count=Count('comments'))


class CreatePostView(viewsets.ModelViewSet):
    serializer_class = CreatePostSerializer

    def get_queryset(self):
        return Post.objects.all()

    def perform_create(self, serializer):
        serializer.save()

# single post - /api/post/{postID}


class PostView(generics.RetrieveAPIView):
    serializer_class = PostSerialzer

    def get_queryset(self):
        return Post.objects.filter(id=self.kwargs['pk']).annotate(comment_count=Count('comments'))


class PopularPostsView(generics.ListAPIView):
    serializer_class = SmallPostSerialzer

    def get_queryset(self):
        return Post.objects.annotate(comment_count=Count('comments')).order_by('-comment_count')[:5]

# all comments /api/comments


class PostCommentsView(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    queryset = PostComment.objects.all()

# all fights /api/fights


class FightView(generics.RetrieveAPIView):
    serializer_class = FightSerializer

    def get_queryset(self):
        return Fight.objects.filter(id=self.kwargs['pk']).annotate(
            posts_count=Count('posts'))


class FightsView(generics.ListAPIView):
    serializer_class = FightSerializer
    query = Fight.objects.all().annotate(
        posts_count=Count('posts')).order_by('-id')
    queryset = query[:5]  # five most recent fights


class PopularFightsView(generics.ListAPIView):
    serializer_class = FightSerializer
    queryset = Fight.objects.all().annotate(
        posts_count=Count('posts')).order_by('-posts_count')


class SmallFightView(generics.ListAPIView):
    serializer_class = SmallFightSerializer
    queryset = Fight.objects.all()
