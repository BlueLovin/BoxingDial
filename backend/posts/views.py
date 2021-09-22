from django.db.models.expressions import Exists, OuterRef
from django.db.models.fields import BooleanField
from rest_framework import viewsets, generics, views, status
from rest_framework import permissions
from rest_framework.compat import distinct
from rest_framework.permissions import IsAuthenticated
from .models import Post, PostComment, PostLike
from accounts.serializers import UserSerializer, UserWithFollowageSerializer
from fights.models import Fight
from fights.serializers.nested import FightSerializer
from .serializers import (
    CreatePostSerializer,
    PostLikeSerializer,
    PostSerializer,
    CommentSerializer,
    SmallPostSerializer,
)
from backend.permissions import IsOwnerOrReadOnly
from django.contrib.auth.models import User
from django.db.models import Count, Prefetch, query
from rest_framework.response import Response


# all posts /api/posts
class PostsView(generics.ListAPIView):
    serializer_class = SmallPostSerializer

    def get_queryset(self):
        return Post.objects.all().annotate(
            like_count=Count("post_likes", distinct=True),
            comment_count=Count("comments", distinct=True),
        )


class CreatePostView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CreatePostSerializer

    def get_queryset(self):
        return Post.objects.all()

    def perform_create(self, serializer):
        serializer.save()


# single post - /api/posts/{postID}
class PostView(generics.RetrieveDestroyAPIView):
    permission_classes = [IsOwnerOrReadOnly]
    serializer_class = PostSerializer
    # get current post, and order the comments by their ID descending. or recent, in other words
    def get_queryset(self):
        logged_in = self.request.user.is_authenticated
        if logged_in:
            return (
                Post.objects.filter(id=self.kwargs["pk"])
                .annotate(like_count=Count("likes", distinct=True))
                .prefetch_related(
                    Prefetch("comments", queryset=PostComment.objects.order_by("-id")),
                )
                .annotate(
                    comment_count=Count("comments", distinct=True),
                    liked=Exists(  # see if a PostLike object exists matching the client user and post.
                        PostLike.objects.filter(
                            post=self.kwargs["pk"], user=self.request.user
                        )
                    ),
                )
            )
        else:
            return (
                Post.objects.filter(id=self.kwargs["pk"])
                .annotate(like_count=Count("likes", distinct=True))
                .prefetch_related(
                    Prefetch("comments", queryset=PostComment.objects.order_by("-id")),
                )
                .annotate(comment_count=Count("comments", distinct=True),)
            )


# single post - /api/posts/{postID}/likes
class PostLikesView(generics.ListAPIView):
    serializer_class = PostLikeSerializer

    def get_queryset(self):
        post = Post.objects.get(id=self.kwargs["pk"])
        this_user = post.owner

        if self.request.user.is_authenticated:
            following = this_user.followers.filter(user_id=self.request.user).exists()

            follows_you = self.request.user.followers.filter(user_id=this_user).exists()
            return (
                PostLike.objects.filter(post=post)
                .prefetch_related(
                    Prefetch("user", User.objects.annotate(
                        posts_count=Count("posts"),
                        following=following,
                        follows_you=follows_you,
                    )
                ))
                .order_by("-liked_on")
            )
        else:
            return (
                PostLike.objects.filter(post=post)
                .prefetch_related(
                    Prefetch("user", User.objects.annotate(
                        posts_count=Count("posts"),
                    )
                ))
                .order_by("-liked_on"))


# 5 most popular posts, popularity determined by number of comments
class PopularPostsView(generics.ListAPIView):
    serializer_class = SmallPostSerializer

    def get_queryset(self):
        return Post.objects.annotate(
            like_count=Count("post_likes", distinct=True),
            comment_count=Count("comments", distinct=True),
        ).order_by("-comment_count", "-like_count")[:5]


# all comments /api/comments
class PostCommentsView(viewsets.ModelViewSet):
    permission_classes = [IsOwnerOrReadOnly]
    serializer_class = CommentSerializer
    queryset = PostComment.objects.all()


class PostLikeApiView(views.APIView):
    def post(self, request, post, format=None):

        user = request.user

        # if not logged in
        if not user.is_authenticated:
            return Response({"result": "not logged in"},)

        post = Post.objects.get(id=post)

        post_like_obj = PostLike.objects.filter(user=user, post=post)
        if post_like_obj.exists():
            post_like_obj.delete()
            result = "unliked"
        else:
            PostLike.objects.create(user=user, post=post)
            result = "liked"

        return Response({"result": result,}, status=status.HTTP_200_OK)
