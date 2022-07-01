from django.core import exceptions
from django.http.response import HttpResponse, HttpResponseNotAllowed
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.status import (
    HTTP_200_OK,
    HTTP_206_PARTIAL_CONTENT,
    HTTP_403_FORBIDDEN,
)

from accounts.serializers import UserSerializer
from .serializers import NotificationSerializer
from .models import Notification
from backend.permissions import IsOwnerOrReadOnly
from instant_messaging.models import Message

not_logged_in_exception = exceptions.ValidationError("Not logged in.")

# user inbox - /api/inbox/all/
class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer

    def get_queryset(self):
        user = self.request.user

        return user.notifications.order_by("-date")


class InboxView(generics.GenericAPIView):
    def get(self, request):
        user = request.user

        notifications_count = user.notifications.filter(is_read=False).count()
        unread_chats_count = Message.objects.filter(
            to=user, read_by_recipient=False
        ).count()

        return Response(
            {
                "unread_notifications_count": notifications_count,
                "unread_chat_messages_count": unread_chats_count,
            },
            200,
        )


class MarkNotificationAsReadView(generics.UpdateAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, notification, format=None):
        user = request.user

        if user.is_anonymous:
            raise not_logged_in_exception

        # get notification object
        notification_object = Notification.objects.get(id=notification)

        # if notification belongs to client user
        if notification_object.recipient == user:
            notification_object.is_read = True
            notification_object.save()
        else:
            return Response(None, HTTP_403_FORBIDDEN)

        serializer = NotificationSerializer(notification_object).data

        return Response(serializer, HTTP_200_OK)


# mark all notifications as read in user's inbox
class MarkAllAsReadView(generics.UpdateAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsOwnerOrReadOnly]

    def post(self, request, format=None):
        user = self.request.user

        if user.is_anonymous:
            raise not_logged_in_exception

        for notification in user.notifications.all():
            notification.is_read = True
            notification.save()

        return Response({}, HTTP_200_OK)


class DeleteNotificationView(generics.DestroyAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsOwnerOrReadOnly]

    def post(self, request, notification, format=None):
        user = self.request.user

        if user.is_anonymous:
            raise not_logged_in_exception

        # get notification object
        notification_object = Notification.objects.get(id=notification)

        # if notification belongs to client user
        if notification_object.recipient == user:
            notification_object.delete()
        else:
            return Response(None, HTTP_403_FORBIDDEN)

        return Response({}, HTTP_200_OK)


# clear inbox, delete all user notifications
class DeleteAllNotificationsView(generics.DestroyAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsOwnerOrReadOnly]

    def post(self, request, format=None):
        user = self.request.user

        if user.is_anonymous:
            raise not_logged_in_exception

        for notification in user.notifications.all():
            notification.delete()

        return Response({}, HTTP_200_OK)
