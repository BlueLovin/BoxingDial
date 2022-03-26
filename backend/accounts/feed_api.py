from django.db.models.expressions import Exists, OuterRef
from posts.serializers import FeedCommentSerializer, SmallPostSerializer
from django.db.models.aggregates import Count
from rest_framework import generics, permissions
from rest_framework.response import Response
from itertools import chain
from .models import UserFollowing
from posts.models import Post, PostComment, PostLike
from vote.models import Vote, DOWN, UP


class UserFeedByRecentView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, format=None):
        user_id = request.user.id

        # get following user IDs
        following_user_ids = (
            UserFollowing.objects.filter(user_id=request.user)
            .values_list("following_user_id_id", flat=True)
            .distinct()
        )

        # get posts from following users
        posts = (
            Post.objects.filter(owner__in=following_user_ids)
            .annotate(
                comment_count=Count("comments", distinct=True),
                liked=Exists(
                    PostLike.objects.filter(post=OuterRef("pk"), user=request.user)
                ),
                like_count=Count("post_likes", distinct=True),
            )
            .order_by("-id")
        )

        comments = (
            PostComment.objects.exclude_blocked_users(request)
            .exclude(post__isnull=True)
            # you are following owner of comment, and the comment is not a reply
            .filter(owner__in=following_user_ids, parent=None)
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
            .order_by("-id")
        )

        # get posts and comments from logged in user
        user_posts = (
            Post.objects.filter(owner__in=[request.user])
            .annotate(
                like_count=Count("post_likes", distinct=True),
                liked=Exists(
                    PostLike.objects.filter(post=OuterRef("pk"), user=self.request.user)
                ),
                comment_count=Count("comments", distinct=True),
            )
            .order_by("-id")
        )

        user_comments = (
            # parent=None to exclude replies to other comments
            PostComment.objects.exclude(post__isnull=True)
            .filter(owner__in=[request.user], parent=None, post=not None)
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
            .order_by("-id")
        )

        # combine post list and comment list
        combined = list(
            chain(
                SmallPostSerializer(posts, many=True).data,
                SmallPostSerializer(user_posts, many=True).data,
                FeedCommentSerializer(comments, many=True).data,
                FeedCommentSerializer(user_comments, many=True).data,
            )
        )

        # sort combined list by date
        newlist = sorted(combined, key=lambda k: k["date"], reverse=True)

        return Response(newlist)
