from django.conf.urls import url
from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from socialmediasite import views as socialmediasite_views
from fights import views as fight_views
from accounts import views as user_views

router = routers.DefaultRouter()
router.register('comments', socialmediasite_views.PostCommentsView)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include(router.urls)),
    # accounts
    path("api/users/<str:user>/posts/", user_views.UserPostListView.as_view()),
    path("api/users/<str:user>/", user_views.UserView.as_view()),
    path("api/users/<str:user>/comments/", user_views.UserCommentListView.as_view()),
    path("api/users", user_views.UsersView.as_view()),
    path("api/users/<str:user>/following/", user_views.UserFollowingView.as_view()),
    path("api/users/<str:user>/followers/", user_views.UserFollowersView.as_view()),
    # fights
    path("api/fights/", fight_views.FightsView.as_view()),
    url(r"api/fights/(?P<pk>[0-9]+)/$", fight_views.FightView.as_view()),
    path("api/fights/small", fight_views.SmallFightView.as_view()),
    path("api/fights/popular", fight_views.PopularFightsView.as_view()),
    # posts
    path("api/posts/", socialmediasite_views.PostsView.as_view()),
    url(r"api/posts/(?P<pk>[0-9]+)/$", socialmediasite_views.PostView.as_view()),
    path("api/post/create/", socialmediasite_views.CreatePostView.as_view()),
    path("api/posts/popular", socialmediasite_views.PopularPostsView.as_view()),
    path("api/posts/<int:post>/like", socialmediasite_views.PostLikeApiView.as_view()),
    path("", include("accounts.urls")),
]
