from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from socialmediasite import views

router = routers.DefaultRouter()
router.register(r'posts', views.PostView, 'post')
router.register(r'comments', views.PostCommentsView, 'postcomment')
router.register(r'fights', views.FightView, 'fight')


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/users/<int:user>/posts/', views.UserPostListView.as_view()),
    path('api/users/<int:user>/', views.UserView.as_view()),
    path('api/users/<int:user>/comments/', views.UserCommentListView.as_view()),
    path('api/users', views.UsersView.as_view()),
    path('', include('accounts.urls')),
]
