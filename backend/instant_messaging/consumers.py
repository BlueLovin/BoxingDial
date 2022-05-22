from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
import json
from accounts.serializers import SmallUserSerializer, SmallUserWithProfileSerializer
from django.contrib.auth.models import User
from knox.auth import TokenAuthentication
from .models import Message, MessageGroup


class ChatConsumer(WebsocketConsumer):
    def fetch_messages(self, data):
        if not self.connected_to_group:
            self.send_message({"error": "not connected to a group"})
            return

        messages = Message.last_50_messages(None, self.group)
        content = {"command": "messages", "messages": self.messages_to_json(messages)}
        self.send_message(content)

    def get_user(self, token):
        try:
            auth = TokenAuthentication()
            user = auth.authenticate_credentials(token.encode("utf-8"))
            return user[0]
        except Exception:
            return None

    def new_message(self, data):
        if not self.connected_to_group:
            self.send_message({"error": "not connected to a group"})
            return

        owner = self.user

        content = data["text"]

        message = Message.objects.create(
            owner=owner, to=self.user_to_contact, group=self.group, content=content
        )

        self.group.last_received_message = message
        self.group.save()

        content = {"command": "new_message", "message": self.message_to_json(message)}
        self.send_chat_message(content)

    def messages_to_json(self, messages):
        result = []
        for message in messages:
            result.append(self.message_to_json(message))
        return result

    def message_to_json(self, message):
        return {
            "id": str(message.id),
            "owner": SmallUserWithProfileSerializer(message.owner).data,
            "group": str(self.group.id),
            "content": message.content,
            "created_at": str(message.created_at),
        }

    def connect_to_group(self, data):
        user_to_contact_username = data["user_to_contact"]
        self.user_to_contact = User.objects.get(username=user_to_contact_username)
        usernames = [user_to_contact_username, self.user.username]
        usernames.sort()
        self.room_name = "_".join(usernames)
        self.room_group_name = f"chat_{self.room_name}"

        group = MessageGroup.objects.get_or_create(group_name=self.room_group_name)[0]
        group.users.set([self.user, self.user_to_contact])
        group.save()
        self.group = group
        self.connected_to_group = True
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name, self.channel_name
        )
        user_to_contact_data = SmallUserWithProfileSerializer(self.user_to_contact).data
        self.send_message(
            {
                "success": f"now chatting with {user_to_contact_username}",
                "user_to_contact": user_to_contact_data,
            }
        )

    commands = {
        "fetch_messages": fetch_messages,
        "new_message": new_message,
        "connect_to_group": connect_to_group,
    }

    def connect(self):
        cookies = self.scope["cookies"]
        try:
            auth_token = cookies["Authorization"].replace("Token ", "")
            self.user = self.get_user(auth_token)

        except Exception:
            self.close()
            return

        self.accept()

        if self.user == None:
            self.send_message({"error": "invalid auth token received"})
            self.close()
            return

        self.connected_to_group = False

    def disconnect(self, close_code):
        # leave group room
        if hasattr(self, "room_group_name"):
            async_to_sync(self.channel_layer.group_discard)(
                self.room_group_name, self.channel_name
            )

    def receive(self, text_data):
        data = json.loads(text_data)
        self.commands[data["command"]](self, data)

    def send_message(self, message):
        self.send(text_data=json.dumps(message))

    def send_chat_message(self, message):
        # Send message to room group
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name, {"type": "chat_message", "message": message}
        )

    # Receive message from room group
    def chat_message(self, event):
        message = event["message"]
        # Send message to WebSocket
        self.send(text_data=json.dumps(message))
