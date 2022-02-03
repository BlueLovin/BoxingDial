from django.contrib import admin
from django.urls import path, include
from rest_framework import routers


router = routers.DefaultRouter()

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include(router.urls)),
    path("", include("accounts.urls")),
    path("", include("fights.urls")),
    path("", include("notifications.urls")),
    path("", include("posts.urls")),
]
