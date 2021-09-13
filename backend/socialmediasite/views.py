from django.db.models.expressions import Exists
from django.db.models.fields import json
from django.http.response import JsonResponse
from rest_framework import viewsets, generics, views, status
from rest_framework.compat import distinct
from .models import Post, PostComment, Fight, PostLike
from .serializers import (
    CreatePostSerializer,
    PostLikeSerializer,
    PostSerializer,
    CommentSerializer,
    SmallFightSerializer,
    UserSerializer,
    FightSerializer,
    SmallPostSerializer,
)
from .permissions import IsOwnerOrReadOnly
from django.contrib.auth.models import User
from django.db.models import Count, Prefetch, query
from accounts.serializers import UserFollowingSerializer, FollowersSerializer
from rest_framework.response import Response


# all users - /api/users
class UsersView(generics.ListAPIView):
    serializer_class = UserSerializer

    def get_queryset(self):
        return User.objects.all().annotate(posts_count=Count("posts"))


# single user - /api/users/{username}
class UserView(generics.GenericAPIView):
    serializer_class = UserSerializer

    def get_queryset(self):
        return User.objects.filter(username=self.kwargs["user"]).annotate(
            posts_count=Count("posts")
        )

    def get_object(self):
        return User.objects.annotate(posts_count=Count("posts")).get(
            username=self.kwargs["user"]
        )

    def get(self, request, user, format=None):
        this_user = self.get_object()
        if this_user == request.user:
            return Response(UserSerializer(this_user).data)
        try:
            following = this_user.followers.filter(user_id=request.user).exists()

            follows_you = request.user.followers.filter(user_id=this_user).exists()
            return Response(
                {
                    "id": this_user.id,
                    "username": this_user.username,
                    "posts_count": this_user.posts.count(),
                    "following": following,
                    "follows_you": follows_you,
                }
            )
        except Exception:
            return Response(UserSerializer(this_user).data)


class UserFollowingView(generics.ListAPIView):
    serializer_class = UserFollowingSerializer

    def get_queryset(self):
        return User.objects.get(username=self.kwargs["user"]).following


class UserFollowersView(generics.ListAPIView):
    serializer_class = FollowersSerializer

    def get_queryset(self):
        return User.objects.get(username=self.kwargs["user"]).followers


# user's comments - /api/users/{username}/comments
class UserCommentListView(generics.ListAPIView):
    serializer_class = CommentSerializer

    def get_queryset(self):
        return PostComment.objects.filter(username=self.kwargs["user"]).order_by("-id")


# user's posts - /api/users/{username}/posts
class UserPostListView(generics.ListAPIView):
    serializer_class = SmallPostSerializer

    def get_queryset(self):
        return (
            Post.objects.filter(username=self.kwargs["user"])
            .annotate(
                like_count=Count("post_likes", distinct=True),
                comment_count=Count("comments", distinct=True),
            )
            .order_by("-id")
        )


# all posts /api/posts
class PostsView(generics.ListAPIView):
    serializer_class = SmallPostSerializer

    def get_queryset(self):
        return Post.objects.all().annotate(
            like_count=Count("post_likes", distinct=True),
            comment_count=Count("comments", distinct=True),
        )


class CreatePostView(viewsets.ModelViewSet):
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
        if(logged_in):
            return (
                Post.objects.filter(id=self.kwargs["pk"])
                .annotate(like_count=Count("likes", distinct=True))
                .prefetch_related(
                    Prefetch("comments", queryset=PostComment.objects.order_by("-id")),
                )
                .annotate(
                    comment_count=Count("comments", distinct=True),
                    liked=Exists(
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
                .annotate(
                    comment_count=Count("comments", distinct=True),
                )
            )


# 5 most popular posts, popularity determined by number of comments
class PopularPostsView(generics.ListAPIView):
    serializer_class = SmallPostSerializer

    def get_queryset(self):
        return Post.objects.annotate(
            like_count=Count("post_likes", distinct=True),
            comment_count=Count("comments", distinct=True),
        ).order_by("-comment_count")[:5]


# all comments /api/comments
class PostCommentsView(viewsets.ModelViewSet):
    permission_classes = [IsOwnerOrReadOnly]
    serializer_class = CommentSerializer
    queryset = PostComment.objects.all()


# single fight /api/fights/{id}
class FightView(generics.RetrieveAPIView):
    serializer_class = FightSerializer

    def get_queryset(self):
        return (
            Fight.objects.filter(id=self.kwargs["pk"])
            .prefetch_related(
                Prefetch(
                    "posts",
                    Post.objects.annotate(
                        like_count=Count("post_likes", distinct=True),
                        comment_count=Count("comments", distinct=True),
                    ).order_by("-id"),
                )
            )
            .annotate(posts_count=Count("posts", distinct=True))
        )


# all fights /api/fights
class FightsView(generics.ListAPIView):
    serializer_class = FightSerializer
    query = (
        Fight.objects.all()
        .prefetch_related(
            Prefetch(
                "posts",
                Post.objects.annotate(
                    like_count=Count("post_likes", distinct=True)
                ).annotate(comment_count=Count("comments", distinct=True)),
            )
        )
        .annotate(posts_count=Count("posts"))
        .order_by("-id")
    )
    queryset = query[:5]  # five most recent fights


# 5 most popular fights, popularity determined by number of posts
class PopularFightsView(generics.ListAPIView):
    serializer_class = FightSerializer
    queryset = (
        Fight.objects.all()
        .prefetch_related(
            Prefetch(
                "posts",
                Post.objects.annotate(
                    comment_count=Count("comments", distinct=True),
                    like_count=Count("post_likes", distinct=True),
                ),
            )
        )
        .annotate(posts_count=Count("posts", distinct=True))
        .order_by("-posts_count")[:5]
    )


# all fights without posts field
class SmallFightView(generics.ListAPIView):
    serializer_class = SmallFightSerializer
    queryset = Fight.objects.all().order_by("-id")


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

