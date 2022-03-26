from http.client import HTTPResponse
from django.http import HttpResponse
from vote.managers import UP
from vote.models import DOWN, Vote
from accounts.models import UserFollowing
from django.db.models.expressions import Exists, OuterRef, Value
from rest_framework import serializers, viewsets, generics, views, status
from rest_framework.permissions import IsAuthenticated
from accounts.managers import UserManager
from backend.responses import BoxingDialResponses
from fights.models import Fight

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

NOT_LOGGED_IN_EXCEPTION = serializers.DjangoValidationError("not logged in")

# all posts /api/posts
class PostsView(generics.ListAPIView):
    serializer_class = SmallPostSerializer

    def get_queryset(self):
        return (
            Post.objects.exclude_blocked_users(self.request)
            .all()
            .annotate(
                like_count=Count("post_likes", distinct=True),
                comment_count=Count("comments", distinct=True),
            )
        )


class CreatePostView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CreatePostSerializer

    def post(self, request, *args, **kwargs):
        owner = request.user
        content = request.data["content"]

        if len(content) < 5:
            return BoxingDialResponses.CONTENT_TOO_SHORT_RESPONSE

        if owner.is_anonymous:
            raise IsAuthenticated(detail=None, code=None)

        username = owner.username

        # fight field is optional when creating a post.
        if "fight" in request.data:
            fight_id = request.data["fight"]

            if fight_id is not None:
                fight_obj = Fight.objects.get(id=fight_id)
            else:
                fight_obj = None

        new_post = Post.objects.create(
            owner=owner, username=username, content=content, fight=fight_obj
        )
        new_post.comments.set([])

        annotated_query = (
            Post.objects.filter(id=new_post.id)
            .annotate(
                comment_count=Value(0),
                liked=Value(False),
                like_count=Value(0),
            )
            .first()
        )

        return Response(SmallPostSerializer(annotated_query).data)


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
            PostComment.objects.exclude_blocked_users(self.request)
            .filter(post=post_id)
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

    def get_queryset(self):
        return Post.objects.all()

    # get current post, and order the comments by their ID descending. or recent, in other words
    def get(self, request, pk):
        logged_in = request.user.is_authenticated
        user_id = request.user.id

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
            post_query = Post.objects.filter(id=pk)
            post_owner_profile = post_query.first().owner.profile

            if UserManager.user_blocks_you(None, request, post_owner_profile):
                return BoxingDialResponses.USER_DOESNT_EXIST_RESPONSE
            elif UserManager.is_user_blocked(None, request, post_owner_profile):
                return BoxingDialResponses.BLOCKED_USER_RESPONSE

            return Response(
                PostSerializer(
                    Post.objects.filter(id=pk)
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
                            PostLike.objects.filter(post=pk, user=request.user)
                        ),
                    )
                    .first()
                ).data,
                status=200,
            )
        else:
            return Response(
                PostSerializer(
                    Post.objects.exclude_blocked_users(request)
                    .filter(id=pk)
                    .annotate(like_count=Count("likes", distinct=True))
                    .prefetch_related(
                        Prefetch(
                            "comments", queryset=PostComment.objects.order_by("-id")
                        ),
                    )
                    .annotate(
                        comment_count=Count("comments", distinct=True),
                    )
                    .first()
                ).data
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


# 5 most popular posts, popularity determined by number of comments and likes
class PopularPostsView(generics.ListAPIView):
    serializer_class = SmallPostSerializer

    def get(self, request, *args, **kwargs):
        query = Post.objects

        # if client user is logged in, exclude blocked users
        if request.user.is_authenticated:
            query = query.exclude_blocked_users(request)

        return Response(
            SmallPostSerializer(
                query.annotate(
                    like_count=Count("post_likes", distinct=True),
                    comment_count=Count("comments", distinct=True),
                ).order_by("-comment_count", "-like_count")[:5],
                many=True,
            ).data
        )


# create comment /api/comments/create
class CreatePostCommentView(generics.CreateAPIView):
    permission_classes = [IsOwnerOrReadOnly]
    serializer_class = CommentSerializer

    def create_notification(self, new_comment, parent_post):
        recipient = parent_post.owner
        new_comment_username = new_comment.username
        recipient_username = recipient.username

        if UserManager.user_blocks_you(None, self.request, recipient.profile):
            return BoxingDialResponses.USER_DOESNT_EXIST_RESPONSE

        # user does not send notification to theirself
        if recipient_username != new_comment_username:
            truncated_new_comment = new_comment.content[:25] + "..."
            truncated_parent_post = parent_post.content[:25] + "..."

            notification_text = f'{new_comment_username} commented "{truncated_new_comment}" on your post: {truncated_parent_post}'

            Notification.objects.create(
                recipient=recipient,
                sender=new_comment.username,
                text=notification_text,
                post_id=parent_post.id,
            )

    def post(self, request, format=None):
        owner = self.request.user

        if owner.is_anonymous:
            raise NOT_LOGGED_IN_EXCEPTION

        username = owner.username

        # MUST be a comment on a post, no exceptions
        if "post" not in request.data or "content" not in request.data:
            return Response(status=400)

        content = request.data["content"]

        # must contain at least 3 non whitespace characters
        if len(content.replace(" ", "")) < 3:
            return Response(
                {"error": "content must contain at least 3 characters."}, status=400
            )

        post_id = request.data.pop("post")
        post = Post.objects.get(id=post_id)

        if UserManager.user_blocks_you(None, self.request, post.owner.profile):
            return BoxingDialResponses.USER_DOESNT_EXIST_RESPONSE

        comment = PostComment.objects.create(
            owner=owner, username=username, post=post, **request.data
        )
        self.create_notification(comment, post)

        # upvote comment
        comment.votes.up(owner.id)

        # annotate response
        comment.is_voted_up = True
        comment.vote_score = 1
        return Response(CommentSerializer(comment).data)


# all comments /api/comments
class PostCommentsView(viewsets.ModelViewSet, VoteMixin):
    permission_classes = [IsOwnerOrReadOnly]
    serializer_class = CommentSerializer
    queryset = PostComment.objects.all()

    def retrieve(self, request, pk):
        comment = (
            PostComment.objects.exclude_blocked_users(request)
            .annotate(
                is_voted_down=Exists(
                    Vote.objects.filter(user_id=request.user.id, action=DOWN)
                ),
                is_voted_up=Exists(
                    Vote.objects.filter(user_id=request.user.id, action=UP)
                ),
            )
            .get(pk=pk)
        )
        serializer = CommentSerializer(comment)
        return Response(serializer.data)

    def post(self, request, parent, format=None):
        print("\n\n\ndafd\n\n\n\n")
        owner = self.request.user

        if owner.is_anonymous:
            raise NOT_LOGGED_IN_EXCEPTION

        username = owner.username

        # if a comment on a post, specify post
        if request.data["post"] is not None:
            post = request.data.pop("post")

            # prevent user from commenting on post if the owner blocks them
            post_owner_blocks_you = UserManager.user_blocks_you(
                None, request, post.owner.profile
            )
            if post_owner_blocks_you:
                return BoxingDialResponses.USER_DOESNT_EXIST_RESPONSE

            comment = PostComment.objects.create(
                owner=owner, username=username, post=post, **request.data
            )
            self.create_notification(comment, post)

        else:
            comment = PostComment.objects.create(
                owner=owner, username=username, **request.data
            )

        # upvote comment
        comment.votes.up(owner.id)

        # annotate response
        comment.is_voted_up = True
        comment.vote_score = 1
        return CommentSerializer(comment).data


# reply to comment /api/comments/{comment_ID}/reply
class CommentReplyView(views.APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ReplySerializer

    # create notification object for parent user
    def create_reply_notification(self, new_comment, parent_comment):
        new_comment_username = new_comment.username

        # don't send a notification if replying to yourself
        if new_comment_username == parent_comment.username:
            return

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
            sender=new_comment.owner,
            text=notification_text,
            post_id=parent_comment.post.id,
        )

    # create reply
    def post(self, request, parent, format=None):
        parent_pk = parent
        owner = request.user
        content = request.data["content"]

        if len(content) < 5:
            return BoxingDialResponses.CONTENT_TOO_SHORT_RESPONSE

        try:  # try getting the parent comment
            parent_comment = PostComment.objects.get(id=parent_pk)

        except PostComment.DoesNotExist:
            raise serializers.ValidationError("error getting parent comment")

        if owner.is_anonymous:
            raise NOT_LOGGED_IN_EXCEPTION

        if parent_comment.parent == None:

            username = owner.username

            new_comment = PostComment.objects.create(
                owner=owner,
                username=username,
                parent=parent_comment,
                content=content,
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
