from rest_framework.response import Response
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from django.contrib.auth.models import User
from instant_messaging.models import Message, MessageGroup
from instant_messaging.serializers import MessageGroupSerializer, MessageSerializer
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer


# Create your views here.


def get_group_name(username_list) -> str:
    username_list.sort()
    return "chat_" + "_".join(username_list)


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
        output_dict = dict()
        for message_group in response_data:
            output_dict[message_group["id"]] = message_group

        return Response(output_dict)


class CreateMessageView(generics.CreateAPIView):
    def get_or_create_group(self, to, _from):

        group_name = get_group_name([to.username, _from.username])
        group = MessageGroup.objects.get_or_create(group_name=group_name)[0]
        group.users.set([to, _from])
        group.save()
        return group

    def send_to_websocket_connections(self, message):
        channel_layer = get_channel_layer()
        message_json = MessageGroup.message_to_json(message)
        for user in message.group.users.all():
            username = user.username
            async_to_sync(channel_layer.group_send)(
                f"inbox_{username}",
                {
                    "type": "send_message",
                    "command": "new_message",
                    "message": message_json,
                },
            )

    def post(self, request, recipient, format=None):
        owner = request.user
        content = request.data["content"]
        user_to_contact = User.objects.get(username=recipient)

        has_permission = Message.check_user_messaging_permissions(
            owner, user_to_contact
        )

        if has_permission == False:
            return Response({"error": "Can not message this user."}, 500)

        group = self.get_or_create_group(owner, user_to_contact)

        message = Message.objects.create(
            owner=owner, to=user_to_contact, group=group, content=content
        )
        group.last_received_message = message
        group.save()
        self.send_to_websocket_connections(message)
        return Response(MessageSerializer(message).data)


class ReadMessagesView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        message_ids = request.data["message_ids"]

        for message_id in message_ids:
            message = Message.objects.get(id=message_id)

            client_is_recipient = message.to == request.user

            if not client_is_recipient:
                continue

            message.read_by_recipient = True
            message.save()

        return Response(200)


class RetrieveMessageGroupView(generics.RetrieveAPIView):
    def post(self, request):
        group_id = request.data["id"]

        group = MessageGroup.objects.get(id=group_id)
        return Response(MessageGroupSerializer(group).data)
