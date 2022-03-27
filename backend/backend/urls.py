from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from post_comments.views import PostCommentsView


router = routers.DefaultRouter()
router.register("comments", PostCommentsView)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include(router.urls)),
    path("", include("accounts.urls")),
    path("", include("fights.urls")),
    path("", include("notifications.urls")),
    path("", include("posts.urls")),
    path("", include("post_comments.urls")),
]
