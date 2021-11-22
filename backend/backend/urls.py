from django.conf.urls import url
from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from posts import views as posts_views
from fights import views as fight_views
from accounts import views as user_views
from notifications import views as inbox_views

router = routers.DefaultRouter()
router.register("comments", posts_views.PostCommentsView, basename="postcomment")

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include(router.urls)),
    ############
    # accounts #
    ############
    path("api/users/<str:user>/posts/", user_views.UserPostListView.as_view()),
    path("api/users/<str:user>/", user_views.UserView.as_view()),
    path("api/users/<str:user>/comments/", user_views.UserCommentListView.as_view()),
    path("api/users", user_views.UsersView.as_view()),
    path("api/users/<str:user>/following/", user_views.UserFollowingView.as_view()),
    path("api/users/<str:user>/followers/", user_views.UserFollowersView.as_view()),
    #########
    # inbox #
    #########
    path("api/inbox/", inbox_views.InboxView.as_view()),
    path(
        "api/inbox/<int:notification>/read",
        inbox_views.MarkNotificationAsReadView.as_view(),
    ),
    path(
        "api/inbox/<int:notification>/delete",
        inbox_views.DeleteNotificationView.as_view(),
    ),
    ##########
    # fights #
    ##########
    path("api/fights/", fight_views.FightsView.as_view()),
    url(r"api/fights/(?P<pk>[0-9]+)/$", fight_views.FightView.as_view()),
    path("api/fights/small", fight_views.SmallFightView.as_view()),
    path("api/fights/popular", fight_views.PopularFightsView.as_view()),
    #########
    # posts #
    #########
    path("api/posts/", posts_views.PostsView.as_view()),
    url(r"api/posts/(?P<pk>[0-9]+)/$", posts_views.PostView.as_view()),
    path("api/posts/<int:pk>/comments", posts_views.SinglePostCommentsView.as_view()),
    path("api/posts/<int:pk>/likes", posts_views.PostLikesView.as_view()),
    path("api/post/create/", posts_views.CreatePostView.as_view()),
    path("api/posts/popular", posts_views.PopularPostsView.as_view()),
    path("api/posts/<int:post>/like", posts_views.PostLikeApiView.as_view()),
    path("api/comments/<int:parent>/reply", posts_views.CommentReplyView.as_view()),
    path("", include("accounts.urls")),
]
