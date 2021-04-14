from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from socialmediasite import views

router = routers.DefaultRouter()
router.register(r'posts', views.PostView, 'post')
router.register(r'comments', views.PostCommentsView, 'postcomment')


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('', include('accounts.urls')),
]
