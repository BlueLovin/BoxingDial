from django.http.response import HttpResponseNotAllowed
from rest_framework import generics
from rest_framework.response import Response

from accounts.serializers import UserSerializer
from .serializers import NotificationSerializer
from .models import Notification

# user inbox - /api/users/{username}
class InboxView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    

    def get_queryset(self):
        user = self.request.user

        return user.notifications