import re

from accounts.managers import UserManager
from backend.permissions import IsOwnerOrReadOnly
from backend.responses import BoxingDialResponses
from django.contrib.auth.models import User
from django.core.exceptions import ObjectDoesNotExist
from django.db.models import Prefetch
from django.db.models.expressions import Exists, OuterRef
from notifications.models import Notification
from posts.models import Post
from post_comments.serializers import CommentSerializer, ReplySerializer
from rest_framework import generics, serializers, status, views, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from vote.managers import UP
from vote.models import DOWN, Vote
from vote.views import VoteMixin

from .models import PostComment, PostCommentEntities


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
            # get replies and properly annotate them
            .prefetch_related(
                Prefetch("replies", queryset=prefetch_query.order_by("-date"))
            )
            .order_by(order)
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
            return BoxingDialResponses.NOT_LOGGED_IN_RESPONSE

        username = owner.username

        # MUST be a comment on a post, no exceptions
        if "post" not in request.data or "content" not in request.data:
            return Response(status=400)

        content = request.data["content"]

        # must contain at least 3 non whitespace characters
        if len(content.replace(" ", "")) < 3:
            return BoxingDialResponses.CONTENT_TOO_SHORT_RESPONSE

        post_id = request.data.pop("post")
        post = Post.objects.get(id=post_id)

        if UserManager.user_blocks_you(None, self.request, post.owner.profile):
            return BoxingDialResponses.USER_DOESNT_EXIST_RESPONSE

        entities = self.create_entities(content)

        comment = PostComment.objects.create(
            owner=owner, username=username, post=post, **request.data, entities=entities
        )
        self.create_notification(comment, post)
        self.send_notifications_to_mentioned_users(request, comment, False)
        # upvote comment
        comment.votes.up(owner.id)

        # annotate response
        comment.is_voted_up = True
        comment.vote_score = 1
        return Response(CommentSerializer(comment).data)

    def send_notifications_to_mentioned_users(self, request, comment, isReply):
        for mentioned_user in comment.entities.mentioned_users.all():
            mentioning_themself = request.user == comment.owner
            blocked = UserManager.is_user_blocked_either_way(
                None, request, comment.owner.profile
            )

            if mentioning_themself or blocked:
                continue

            if isReply:
                notification_text = f"{comment.owner.username} replied to your comment: '{comment.parent.content[:10]}...': '{comment.content[:25]}'"
            else:
                notification_text = f"{comment.owner.username} mentioned you in a comment: {comment.content[:10]}..."

            Notification.objects.create(
                recipient=mentioned_user,
                sender=comment.owner.username,
                text=notification_text,
                post_id=comment.post.id,
            )

    def get_user_mentions(self, content: str):
        mention_re = "@[0-9a-z]*"
        mentions = re.findall(mention_re, content)
        mentioned_users = []

        if len(mentions) == 0:
            return []

        for mention in mentions:
            if mention == "@" or mention in mentioned_users:
                continue

            mentioned_username = mention[1:]

            try:
                mentioned_user = User.objects.get(username=mentioned_username)
                mentioned_users.append(mentioned_user)

            except ObjectDoesNotExist:
                continue

        return mentioned_users

    def create_entities(self, content: str):
        mentioned_users = self.get_user_mentions(content)

        entities = PostCommentEntities.objects.create()
        entities.mentioned_users.set(mentioned_users)

        return entities


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
        owner = self.request.user

        if owner.is_anonymous:
            return BoxingDialResponses.NOT_LOGGED_IN_RESPONSE

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

        # don't allow user to reply to user that is blocked
        blocked = UserManager.user_blocks_you(
            None, request, parent_comment.owner.profile
        ) or UserManager.is_blocked_by_you(None, request, parent_comment.owner.profile)
        if blocked:
            return BoxingDialResponses.USER_DOESNT_EXIST_RESPONSE

        if owner.is_anonymous:
            raise BoxingDialResponses.NOT_LOGGED_IN_RESPONSE

        if parent_comment.parent != None:
            return Response(
                {"result": "can not reply to reply"}, status=status.HTTP_400_BAD_REQUEST
            )

        username = owner.username

        # create this object so we can re-use its functions
        c = CreatePostCommentView()
        entities = c.create_entities(content)

        new_comment = PostComment.objects.create(
            owner=owner,
            username=username,
            parent=parent_comment,
            content=content,
            entities=entities,
        )

        # create notification for parent comment owner
        self.create_reply_notification(new_comment, parent_comment)
        c.send_notifications_to_mentioned_users(request, new_comment, True)

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
            status=200,
        )
