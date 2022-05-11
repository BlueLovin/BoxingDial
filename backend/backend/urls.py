from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from post_comments.views import PostCommentsView
from django.conf import settings 
from django.conf.urls.static import static 


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
    path("", include("instant_messaging.urls")),
]
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
