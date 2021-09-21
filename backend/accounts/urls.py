from django.urls import path
from .api import (
    RegisterAPI,
    LoginAPI,
    UserAPI,
    AddFollowerView,
    DeleteFollowerView,
    UserFeedByRecentView,
)
from knox import views as knox_views
from rest_framework.authtoken import views

urlpatterns = [
    path("api/token-auth/", views.obtain_auth_token),
    path("api/token-auth/register", RegisterAPI.as_view()),
    path("api/token-auth/user", UserAPI.as_view()),
    path("api/token-auth/login", LoginAPI.as_view()),
    path("api/token-auth/logout", knox_views.LogoutView.as_view(), name="knox_logout"),
    path("api/users/follow", AddFollowerView.as_view(), name="follow"),
    path("api/users/unfollow", DeleteFollowerView.as_view(), name="unfollow"),
    path("api/feed/recent", UserFeedByRecentView.as_view(), name="feed"),
]
