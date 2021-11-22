from django.core import exceptions
from django.http.response import HttpResponse, HttpResponseNotAllowed
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK, HTTP_206_PARTIAL_CONTENT, HTTP_403_FORBIDDEN

from accounts.serializers import UserSerializer
from .serializers import NotificationSerializer
from .models import Notification

# user inbox - /api/users/{username}
class InboxView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    

    def get_queryset(self):
        user = self.request.user

        return user.notifications

class MarkNotificationAsReadView(generics.UpdateAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, notification, format=None):
        user = self.request.user

        if(user.is_anonymous):
            raise exceptions.ValidationError

        # get notification object
        notification_object = Notification.objects.get(id=notification)

        # if notification belongs to client user
        if(notification_object.recipient == user):
            notification_object.is_read = True
            notification_object.save()
        else:
            return Response(None, HTTP_403_FORBIDDEN)

        serializer = NotificationSerializer(notification_object).data

        return Response(serializer, HTTP_200_OK)
