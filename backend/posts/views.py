from django.http import request
from vote.managers import UP
from vote.models import DOWN, Vote
from accounts.models import UserFollowing
from django.db.models.expressions import Exists, OuterRef, Subquery
from rest_framework import viewsets, generics, views, status
from rest_framework.permissions import IsAuthenticated
from .models import Post, PostComment, PostLike
from .serializers import (
    CreatePostSerializer,
    PostLikeSerializer,
    PostSerializer,
    CommentSerializer,
    SmallPostSerializer,
)
from backend.permissions import IsOwnerOrReadOnly
from django.contrib.auth.models import User
from django.db.models import Count, Prefetch
from rest_framework.response import Response
from vote.views import VoteMixin

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


# post's comments /api/posts/6/comments
class SinglePostCommentsView(generics.ListAPIView):
    serializer_class = CommentSerializer

    def get_queryset(self):
        post_id = self.kwargs["pk"]
        user_id = self.request.user.id  # client user

        # looks for '?order_by={score || date}' in the URL
        request_order = self.request.query_params.get("order_by")
        order = "-date"  # default: order by newest

        if request_order == "score":
            order = "-vote_score"

        # get comments related to post passed in through URL,
        # annotate is_voted_down and is_voted_up
        return (
            PostComment.objects.filter(post=post_id)
            .annotate(
                is_voted_down=Exists(
                    Vote.objects.filter(
                        user_id=user_id,
                        action=DOWN,
                        object_id=OuterRef("pk"),
                    )
                ),
                is_voted_up=Exists(
                    Vote.objects.filter(
                        user_id=user_id, action=UP, object_id=OuterRef("pk")
                    )
                ),
            )
            .order_by(order)
        )


# single post - /api/posts/{postID}
class PostView(generics.RetrieveDestroyAPIView):
    permission_classes = [IsOwnerOrReadOnly]
    serializer_class = PostSerializer
    # get current post, and order the comments by their ID descending. or recent, in other words
    def get_queryset(self):
        logged_in = self.request.user.is_authenticated
        user_id = self.request.user.id
        if logged_in:
            return (
                Post.objects.filter(id=self.kwargs["pk"])
                .annotate(like_count=Count("likes", distinct=True))
                .prefetch_related(
                    Prefetch(
                        "comments",
                        queryset=PostComment.objects.annotate(
                            is_voted_down=Exists(
                                Vote.objects.filter(
                                    user_id=user_id,
                                    action=DOWN,
                                    object_id=OuterRef("pk"),
                                )
                            ),
                            is_voted_up=Exists(
                                Vote.objects.filter(
                                    user_id=user_id, action=UP, object_id=OuterRef("pk")
                                )
                            ),
                        ).order_by("-date"),
                    ),
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
                .annotate(
                    comment_count=Count("comments", distinct=True),
                )
            )


# single post - /api/posts/{postID}/likes
class PostLikesView(generics.ListAPIView):
    serializer_class = PostLikeSerializer

    def get_queryset(self):
        post = Post.objects.get(id=self.kwargs["pk"])
        client_user_id = self.request.user.id

        # check to see if a 'following' object exists matching the client user and current user in iteration, or vice versa
        follows_you = Exists(
            UserFollowing.objects.filter(
                user_id=OuterRef("pk"), following_user_id=client_user_id
            )
        )
        following = Exists(
            UserFollowing.objects.filter(
                user_id=client_user_id, following_user_id=OuterRef("pk")
            )
        )

        return (
            PostLike.objects.filter(post=post)
            .prefetch_related(
                Prefetch(
                    "user",
                    User.objects.annotate(
                        posts_count=Count("posts"),
                        is_following=following,
                        follows_you=follows_you,
                    ),
                )
            )
            .order_by("-liked_on")
        )


# 5 most popular posts, popularity determined by number of comments
class PopularPostsView(generics.ListAPIView):
    serializer_class = SmallPostSerializer

    def get_queryset(self):
        return Post.objects.annotate(
            like_count=Count("post_likes", distinct=True),
            comment_count=Count("comments", distinct=True),
        ).order_by("-comment_count", "-like_count")[:5]


# all comments /api/comments
class PostCommentsView(viewsets.ModelViewSet, VoteMixin):
    permission_classes = [IsOwnerOrReadOnly]
    serializer_class = CommentSerializer
    queryset = PostComment.objects.all()

    def retrieve(self, request, pk):
        comment = PostComment.objects.annotate(
            is_voted_down=Exists(
                Vote.objects.filter(user_id=request.user.id, action=DOWN)
            ),
            is_voted_up=Exists(Vote.objects.filter(user_id=request.user.id, action=UP)),
        ).get(pk=pk)
        serializer = CommentSerializer(comment)
        return Response(serializer.data)


class PostLikeApiView(views.APIView):
    def post(self, request, post, format=None):

        user = request.user

        # if not logged in
        if not user.is_authenticated:
            return Response(
                {"result": "not logged in"},
            )

        post = Post.objects.get(id=post)

        post_like_obj = PostLike.objects.filter(user=user, post=post)
        if post_like_obj.exists():
            post_like_obj.delete()
            result = "unliked"
        else:
            PostLike.objects.create(user=user, post=post)
            result = "liked"

        return Response(
            {
                "result": result,
            },
            status=status.HTTP_200_OK,
        )


class PostCommentViewSet(viewsets.ModelViewSet, VoteMixin):
    queryset = PostComment.objects.all()
    serializer_class = CommentSerializer
