from django.urls import path
from . import api as auth_views
from . import views as account_views

from .feed_api import UserFeedByRecentView
from knox import views as knox_views
from rest_framework.authtoken import views

urlpatterns = [
    # AUTH ROUTES
    path("api/token-auth/", views.obtain_auth_token),
    path("api/token-auth/register", auth_views.RegisterAPI.as_view()),
    path("api/token-auth/user", auth_views.UserAPI.as_view()),
    path("api/token-auth/login", auth_views.LoginAPI.as_view()),
    path("api/token-auth/logout", knox_views.LogoutView.as_view(), name="knox_logout"),
    path("api/users/follow", auth_views.AddFollowerView.as_view(), name="follow"),
    path(
        "api/users/unfollow", auth_views.DeleteFollowerView.as_view(), name="unfollow"
    ),
    path("api/user/delete", auth_views.DeleteUserView.as_view(), name="delete"),
    path("api/feed/recent", UserFeedByRecentView.as_view(), name="feed"),
    # ACCOUNT ROUTES
    path("api/users/<str:user>/posts/", account_views.UserPostListView.as_view()),
    path("api/users/<str:user>/", account_views.UserView.as_view()),
    path("api/users/<str:user>/comments/", account_views.UserCommentListView.as_view()),
    path("api/users", account_views.UsersView.as_view()),
    path("api/users/<str:user>/following/", account_views.UserFollowingView.as_view()),
    path("api/users/<str:user>/followers/", account_views.UserFollowersView.as_view()),
    path("api/user/change-profile", account_views.ChangeUserProfileView.as_view()),
    path("api/user/block/<int:id>/", account_views.BlockUserView.as_view()),
]
