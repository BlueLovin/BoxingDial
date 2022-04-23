from operator import itemgetter
from django.db.models.expressions import Exists, OuterRef, Value
from posts.serializers import RepostSerializer, SmallPostSerializer
from post_comments.serializers.nested import FeedCommentSerializer
from django.db.models.aggregates import Count
from django.db.models.query import Prefetch
from rest_framework import generics, permissions
from rest_framework.response import Response
from itertools import chain
from .models import UserFollowing
from posts.models import Post, PostLike, Repost
from post_comments.models import PostComment
from vote.models import Vote, DOWN, UP


class UserFeedByRecentView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def annotate_users_who_reposted(self, reposts_with_duplicates: list) -> list:
        repost_objects = {}
        for repost in reposts_with_duplicates:
            post_id = repost["post"]["id"]

            if post_id not in repost_objects:
                repost_objects[post_id] = repost

            is_reposted = repost_objects[post_id]["post"]["is_reposted"]
            repost_objects[post_id]["is_reposted"] = is_reposted
            repost_objects[post_id]["users_who_reposted"].append(repost["reposter"])

        return list(repost_objects.values())

    def remove_duplicate_posts(self, posts_list: list, reposts_list: list) -> list:
        post_ids = list(map(itemgetter("id"), posts_list))
        for repost in reposts_list:
            repost_id = repost["post"]["id"]

            if repost_id in post_ids:
                posts_list.remove(repost["post"])

        return posts_list

    def get(self, request, format=None):
        user_id = request.user.id

        following_user_ids = (
            UserFollowing.objects.filter(user_id=request.user)
            .values_list("following_user_id_id", flat=True)
            .distinct()
        )

        post_query = Post.objects.exclude_blocked_users(request).annotate(
            comment_count=Count("comments", distinct=True),
            liked=Exists(
                PostLike.objects.filter(post=OuterRef("pk"), user=request.user)
            ),
            like_count=Count("post_likes", distinct=True),
            repost_count=Count("reposts", distinct=True),
            is_reposted=Exists(
                Repost.objects.filter(reposter=request.user, post=OuterRef("pk"))
            ),
        )

        comment_query = (
            PostComment.objects.exclude_blocked_users(request)
            .exclude(post__isnull=True)
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
        )

        posts_from_followed_users = post_query.filter(
            owner__in=following_user_ids
        ).order_by("-id")

        reposts_from_followed_users = (
            Repost.objects.filter(reposter__in=following_user_ids)
            .prefetch_related(Prefetch("post", post_query))
            .order_by("-id")
        )

        comments_from_followed_users = (
            comment_query
            # you are following owner of comment, and the comment is not a reply
            .filter(owner__in=following_user_ids, parent=None).order_by("-id")
        )

        client_posts = post_query.filter(owner__exact=request.user).order_by("-id")

        client_reposts = (
            Repost.objects.filter(reposter__exact=request.user)
            .prefetch_related(Prefetch("post", post_query))
            .annotate(is_reposted=Value(True))
            .order_by("-id")
        )

        client_comments = (
            # parent=None to exclude replies to other comments
            comment_query.filter(
                owner__exact=request.user, parent=None, post=not None
            ).order_by("-id")
        )

        combined_posts = list(
            chain(
                SmallPostSerializer(posts_from_followed_users, many=True).data,
                SmallPostSerializer(client_posts, many=True).data,
            )
        )

        combined_reposts = list(
            chain(
                RepostSerializer(reposts_from_followed_users, many=True).data,
                RepostSerializer(client_reposts, many=True).data,
            )
        )

        combined_reposts = self.annotate_users_who_reposted(combined_reposts)
        combined_posts = self.remove_duplicate_posts(combined_posts, combined_reposts)

        combined_posts_and_comments = list(
            chain(
                combined_posts,
                combined_reposts,
                FeedCommentSerializer(comments_from_followed_users, many=True).data,
                FeedCommentSerializer(client_comments, many=True).data,
            )
        )

        # sort combined list by date
        feed_response = sorted(
            combined_posts_and_comments, key=lambda k: k["date"], reverse=True
        )

        return Response(feed_response)
