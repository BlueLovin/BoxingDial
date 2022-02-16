from django.db.models.expressions import Exists, OuterRef
from django.db.models import Count, Prefetch
from rest_framework import generics

from fights.serializers.common import SmallFightSerializer
from .models import Fight
from posts.models import Post, PostLike
from .serializers.nested import FightSerializer

# single fight /api/fights/{id}
class FightView(generics.RetrieveAPIView):
    serializer_class = FightSerializer

    def get_queryset(self):

        user = self.request.user

        # if not logged in
        if not user.is_authenticated:
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

        elif self.request.user.is_authenticated:
            return (
                Fight.objects.filter(id=self.kwargs["pk"])
                .prefetch_related(
                    Prefetch(
                        "posts",
                        Post.objects.exclude_blocked_users(self.request)
                        .annotate(
                            like_count=Count("post_likes", distinct=True),
                            comment_count=Count("comments", distinct=True),
                            liked=Exists(
                                PostLike.objects.filter(
                                    post=OuterRef("pk"), user=self.request.user
                                )
                            ),
                        )
                        .order_by("-id"),
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
                    like_count=Count("post_likes", distinct=True),
                    comment_count=Count("comments", distinct=True),
                ),
            )
        )
        .annotate(posts_count=Count("posts"))
        .order_by("-id")
    )
    queryset = query[:5]  # five most recent fights


# 5 most popular fights, popularity determined by number of posts
class PopularFightsView(generics.ListAPIView):
    serializer_class = FightSerializer

    def get_queryset(self):
        return (
            Fight.objects.all()
            .prefetch_related(
                Prefetch(
                    "posts",
                    Post.objects.exclude_blocked_users(self.request).annotate(
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
