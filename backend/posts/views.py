import re

from accounts.managers import UserManager
from accounts.models import UserFollowing
from backend.permissions import IsOwnerOrReadOnly
from backend.responses import BoxingDialResponses
from django.contrib.auth.models import User
from django.core.exceptions import ObjectDoesNotExist
from django.db.models import Count, Prefetch
from django.db.models.expressions import Exists, OuterRef, Value
from fights.models import Fight
from notifications.models import Notification
from rest_framework import generics, status, views, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from vote.managers import UP
from vote.models import DOWN, Vote
from vote.views import VoteMixin

from post_comments.models import PostComment
from .models import Post, PostEntities, PostLike, Repost
from .serializers import (
    CommentSerializer,
    CreatePostSerializer,
    PostLikeSerializer,
    PostSerializer,
    RepostSerializer,
    SmallPostSerializer,
)


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

        entities = self.create_entities(content)

        new_post = Post.objects.create(
            owner=owner,
            username=username,
            content=content,
            fight=fight_obj,
            entities=entities,
        )
        new_post.comments.set([])

        self.send_notifications_to_mentioned_users(request, new_post)

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

    def create_entities(self, content: str):
        mentioned_users = self.get_user_mentions(content)

        entities = PostEntities.objects.create()
        entities.mentioned_users.set(mentioned_users)

        return entities

    def send_notifications_to_mentioned_users(self, request, post):
        for mentioned_user in post.entities.mentioned_users.all():
            blocked = UserManager.is_user_blocked_either_way(
                None, request, post.owner.profile
            )
            mentioning_themself = post.owner == request.user

            if mentioning_themself or blocked:
                continue

            notification_text = f"{post.owner.username} commented mentioned you in their post: {post.content[:10]}..."
            Notification.objects.create(
                recipient=mentioned_user,
                sender=post.owner.username,
                text=notification_text,
                post_id=post.id,
                comment_id=-1,
            )

    def get_user_mentions(self, content: str):
        mention_re = "@[0-9a-z]*"
        mentions = re.findall(mention_re, content)
        mentioned_users = []

        if len(mentions) == 0:
            return []

        for mention in mentions:
            if mention == "@":
                continue

            mentioned_username = mention[1:]

            try:
                mentioned_user = User.objects.get(username=mentioned_username)
                mentioned_users.append(mentioned_user)

            except ObjectDoesNotExist:
                pass

        return mentioned_users


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

        post_query = Post.objects.filter(id=pk)
        if post_query.first() == None:
            return BoxingDialResponses.POST_DOES_NOT_EXIST_RESPONSE

        if logged_in:
            post_owner_profile = post_query.first().owner.profile

            if UserManager.user_blocks_you(None, request, post_owner_profile):
                return BoxingDialResponses.USER_DOESNT_EXIST_RESPONSE
            elif UserManager.is_blocked_by_you(None, request, post_owner_profile):
                return BoxingDialResponses.BLOCKED_USER_RESPONSE

            return Response(
                PostSerializer(
                    post_query.annotate(like_count=Count("likes", distinct=True))
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
                        is_reposted=Exists(
                            Repost.objects.filter(
                                reposter=request.user, post=OuterRef("pk")
                            )
                        ),
                    )
                    .first()
                ).data,
                status=200,
            )
        else:
            return Response(
                PostSerializer(
                    post_query.annotate(like_count=Count("likes", distinct=True))
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
                    liked=Exists(
                        PostLike.objects.filter(post=OuterRef("pk"), user=request.user)
                    ),
                ).order_by("-comment_count", "-like_count")[:5],
                many=True,
            ).data
        )


class PostLikeApiView(views.APIView):
    def post(self, request, post_id, format=None):

        user = request.user

        # if not logged in
        if not user.is_authenticated:
            return Response(
                {"result": "not logged in"},
            )

        post = Post.objects.get(id=post_id)

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


class RepostView(generics.CreateAPIView):
    # repost
    def post(self, request, post_id, *args, **kwargs):
        if request.user.is_anonymous:
            return BoxingDialResponses.NOT_LOGGED_IN_RESPONSE

        try:
            post = Post.objects.get(id=post_id)
        except ObjectDoesNotExist:
            return BoxingDialResponses.POST_DOES_NOT_EXIST_RESPONSE

        # already reposted
        if Repost.objects.filter(post=post, reposter=request.user).exists():
            return Response(200)

        repost_message = ""

        if "content" in request.data:
            repost_message = request.data["content"]

        Repost.objects.create(
            post=post, reposter=request.user, repost_message=repost_message
        )

        return Response(200)

    # un-repost
    def delete(self, request, post_id):
        if request.user.is_anonymous:
            return BoxingDialResponses.NOT_LOGGED_IN_RESPONSE

        try:
            post = Post.objects.get(id=post_id)
            Repost.objects.get(post=post, reposter=request.user).delete()
        except ObjectDoesNotExist:
            return BoxingDialResponses.POST_DOES_NOT_EXIST_RESPONSE

        return Response(200)
