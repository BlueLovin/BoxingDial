from django.urls import path, re_path
from . import views as post_views
from rest_framework import routers

router = routers.DefaultRouter()

urlpatterns = [
    path("api/posts/", post_views.PostsView.as_view()),
    re_path(r"api/posts/(?P<id>[0-9]+)/$", post_views.PostView.as_view()),
    path("api/posts/<int:pk>/comments", post_views.SinglePostCommentsView.as_view()),
    path("api/posts/<int:pk>/likes", post_views.PostLikesView.as_view()),
    path("api/post/create/", post_views.CreatePostView.as_view()),
    path("api/posts/popular", post_views.PopularPostsView.as_view()),
    path("api/posts/<int:post>/like", post_views.PostLikeApiView.as_view()),
    path("api/comments/<int:parent>/reply", post_views.CommentReplyView.as_view()),
    path("api/comments/create", post_views.CreatePostCommentView.as_view()),
]
