from operator import itemgetter
from django.db.models.expressions import Exists, OuterRef
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

    def remove_duplicate_reposts(self, reposts_list: list) -> list:
        post_ids = []
        reposts = {}
        for repost in reposts_list:
            post_id = repost["post"]["id"]

            # if we found a duplicate
            if post_id in post_ids:
                if post_id not in reposts:
                    reposts[post_id] = repost

                if "users_who_reposted" not in reposts[post_id]:
                    reposts[post_id]["users_who_reposted"] = []

                reposts[post_id]["users_who_reposted"].append(repost["reposter"])
            else:
                post_ids.append(post_id)
                reposts[post_id] = repost

                if "users_who_reposted" not in reposts[post_id]:
                    reposts[post_id]["users_who_reposted"] = []

                reposts[post_id]["users_who_reposted"].append(repost["reposter"])

        return list(reposts.values())

    def remove_duplicate_posts(self, posts_list: list, reposts_list: list) -> list:
        post_ids = list(map(itemgetter("id"), posts_list))
        for repost in reposts_list:
            repost_id = repost["post"]["id"]

            if repost_id in post_ids:
                posts_list.remove(repost["post"])

        return posts_list

    def get(self, request, format=None):
        user_id = request.user.id

        # get following user IDs
        following_user_ids = (
            UserFollowing.objects.filter(user_id=request.user)
            .values_list("following_user_id_id", flat=True)
            .distinct()
        )

        post_annotation = Post.objects.exclude_blocked_users(request).annotate(
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

        # get posts from followed users
        posts = post_annotation.filter(owner__in=following_user_ids).order_by("-id")

        # get reposts from followed users
        reposts = (
            Repost.objects.filter(reposter__in=following_user_ids)
            .prefetch_related(Prefetch("post", post_annotation))
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
        user_posts = post_annotation.filter(owner__exact=request.user).order_by("-id")

        # get posts and comments from logged in user
        user_reposts = (
            Repost.objects.filter(reposter__exact=request.user)
            .prefetch_related(Prefetch("post", post_annotation))
            .annotate(
                is_reposted=Exists(
                    Repost.objects.filter(
                        reposter=request.user, post=OuterRef("post__pk")
                    )
                )
            )
            .order_by("-id")
        )

        user_comments = (
            # parent=None to exclude replies to other comments
            PostComment.objects.exclude(post__isnull=True)
            .filter(owner__exact=request.user, parent=None, post=not None)
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

        combined_posts = list(
            chain(
                SmallPostSerializer(posts, many=True).data,
                SmallPostSerializer(user_posts, many=True).data,
            )
        )

        combined_reposts = list(
            chain(
                RepostSerializer(reposts, many=True).data,
                RepostSerializer(user_reposts, many=True).data,
            )
        )

        combined_reposts = self.remove_duplicate_reposts(combined_reposts)
        combined_posts = self.remove_duplicate_posts(combined_posts, combined_reposts)

        # combine post list and comment list
        combined = list(
            chain(
                combined_posts,
                combined_reposts,
                FeedCommentSerializer(comments, many=True).data,
                FeedCommentSerializer(user_comments, many=True).data,
            )
        )

        # sort combined list by date
        feed_response = sorted(combined, key=lambda k: k["date"], reverse=True)

        return Response(feed_response)
