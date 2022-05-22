from rest_framework.response import Response
from django.db.models import Subquery, OuterRef, Value, Exists
from rest_framework import generics, status, views, viewsets
from rest_framework.permissions import IsAuthenticated

from instant_messaging.models import Message, MessageGroup
from instant_messaging.serializers import MessageGroupSerializer

# Create your views here.


class MessageGroupsView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = MessageGroupSerializer

    def get(self, request):
        # TODO: paginate
        user = request.user
        query = MessageGroup.objects.filter(users=user).order_by(
            "-last_received_message__created_at"
        )
        response_data = MessageGroupSerializer(query, many=True).data

        return Response(response_data)
