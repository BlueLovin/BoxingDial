from django.conf.urls import url
from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from django.views.decorators.csrf import csrf_exempt
from socialmediasite import views

router = routers.DefaultRouter()
router.register(r'comments', views.PostCommentsView, 'postcomment')
router.register(r'post/create', views.CreatePostView, 'createpost')


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),

    path('api/users/<str:user>/posts/', views.UserPostListView.as_view()),
    path('api/users/<str:user>/', views.UserView.as_view()),
    path('api/users/<str:user>/comments/', views.UserCommentListView.as_view()),
    path('api/users', views.UsersView.as_view()),
    path('api/users/<str:user>/following/', views.UserFollowingView.as_view()),
    path('api/users/<str:user>/followers/', views.UserFollowersView.as_view()),

    path('api/fights/', views.FightsView.as_view()),
    url(r'api/fights/(?P<pk>[0-9]+)/$', views.FightView.as_view()),
    path('api/fights/small', views.SmallFightView.as_view()),
    path('api/fights/popular', views.PopularFightsView.as_view()),

    
    path('api/posts/', views.PostsView.as_view()),
    url(r'api/posts/(?P<pk>[0-9]+)/$', views.PostView.as_view()),
    path('api/posts/popular', views.PopularPostsView.as_view()),

    path('', include('accounts.urls')),
]
