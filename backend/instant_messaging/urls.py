from .views import MessageGroupsView

from django.urls import path
from rest_framework import routers

router = routers.DefaultRouter()

urlpatterns = [
    path("api/user/conversations", MessageGroupsView.as_view()),
]
