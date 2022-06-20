from .views import CreateMessageView, MessageGroupsView, RetrieveMessageGroupView

from django.urls import path
from rest_framework import routers

router = routers.DefaultRouter()

urlpatterns = [
    path("api/user/conversations", MessageGroupsView.as_view()),
    path("api/retrieve-message-group", RetrieveMessageGroupView.as_view()),
    path("api/chat/<str:recipient>", CreateMessageView.as_view()),
]
