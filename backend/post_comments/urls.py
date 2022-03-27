from django.urls import path
from . import views as post_views
from rest_framework import routers

router = routers.DefaultRouter()

urlpatterns = [
    path("api/posts/<int:pk>/comments", post_views.SinglePostCommentsView.as_view()),
    path("api/comments/<int:parent>/reply", post_views.CommentReplyView.as_view()),
    path("api/comments/create", post_views.CreatePostCommentView.as_view()),
]
