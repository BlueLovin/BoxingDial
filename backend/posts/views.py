from vote.managers import UP
from vote.models import DOWN, Vote
from accounts.models import UserFollowing
from django.db.models.expressions import Exists, OuterRef
from rest_framework import serializers, viewsets, generics, views, status
from rest_framework.permissions import IsAuthenticated

from notifications.models import Notification
from .models import Post, PostComment, PostLike
from .serializers import (
    CreatePostSerializer,
    PostLikeSerializer,
    PostSerializer,
    CommentSerializer,
    ReplySerializer,
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


# post's comments /api/posts/6/comments
class SinglePostCommentsView(generics.ListAPIView):
    serializer_class = CommentSerializer

    def get_queryset(self):
        post_id = self.kwargs["pk"]
        user_id = self.request.user.id  # client user

        # looks for '?order_by={score || date}' in the URL
        request_order = self.request.query_params.get("order_by")

        # default: order by newest
        order = "-date"

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

        # query to see if the logged in user has upvoted or downvoted the current comment
        prefetch_query = PostComment.objects.annotate(
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

        if logged_in:
            return (
                Post.objects.filter(id=self.kwargs["pk"])
                .annotate(like_count=Count("likes", distinct=True))
                .prefetch_related(
                    Prefetch(
                        "comments",
                        queryset=prefetch_query.prefetch_related(
                            Prefetch(
                                "replies", queryset=prefetch_query.order_by("-date")
                            )
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


# all comments /api/comments/{comment_ID}/reply
class CommentReplyView(views.APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ReplySerializer

    # create notification object for parent user
    def create_reply_notification(self, new_comment, parent_comment):
        new_comment_username = new_comment.username

        # show first 15 chars if longer than 15 chars, and append ellipses
        truncated_parent_content = (
            parent_comment.content[:15] + "..."
            if len(parent_comment.content) > 15
            else parent_comment.content
        )
        truncated_new_content = (
            new_comment.content[:15] + "..."
            if len(new_comment.content) > 15
            else new_comment.content
        )

        notification_text = f'{new_comment_username} replied "{truncated_new_content}" to your comment: "{truncated_parent_content}"'

        Notification.objects.create(
            recipient=parent_comment.owner,
            text=notification_text,
            post_id=parent_comment.post.id,
        )

    # create reply
    def post(self, request, parent, format=None):
        parent_pk = parent
        owner = request.user

        try:  # try getting the parent comment
            parent_comment = PostComment.objects.get(id=parent_pk)
        except PostComment.DoesNotExist:
            raise serializers.ValidationError("error getting parent comment")

        if owner.is_anonymous:
            raise serializers.DjangoValidationError("not logged in")

        if parent_comment.parent == None:

            username = owner.username

            new_comment = PostComment.objects.create(
                owner=owner,
                username=username,
                parent=parent_comment,
                content=request.data["content"],
            )

            # create notification for parent comment owner
            self.create_reply_notification(new_comment, parent_comment)

            # upvote comment
            new_comment.votes.up(owner.id)

            # annotate response
            new_comment.vote_score = 1
            new_comment.is_voted_up = True

            result = ReplySerializer(new_comment).data

            return Response(
                {
                    "result": result,
                },
                status=status.HTTP_200_OK,
            )
        else:
            return Response(
                {"result": "can not reply to reply"}, status=status.HTTP_400_BAD_REQUEST
            )


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
