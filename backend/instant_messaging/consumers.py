from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
import json
from django.contrib.auth.models import User
from knox.auth import TokenAuthentication
from .models import Message, MessageGroup


class ChatConsumer(WebsocketConsumer):
    def fetch_messages(self, data):
        print(data)
        user_to_contact = data["user_to_contact"]
        group = self.get_or_create_group(user_to_contact)

        if group == None:
            return

        messages = Message.last_50_messages(group)
        messages_json = MessageGroup.messages_to_json(messages)

        content = {"command": "messages", "messages": messages_json}
        self.send_message(content)

    def get_or_create_group(self, user_to_contact_username):
        if User.objects.filter(username=user_to_contact_username).exists() == False:
            return None

        username_list = [self.user.username, user_to_contact_username]
        username_list.sort()
        group_name = "chat_" + "_".join(username_list)
        group = MessageGroup.objects.get_or_create(group_name=group_name)[0]
        return group

    def get_user(self, token):
        auth = TokenAuthentication()
        user = auth.authenticate_credentials(token.encode("utf-8"))
        return user[0]

    def connect_to_inbox(self):
        self.inbox_channel_name = f"inbox_{self.user.username}"
        async_to_sync(self.channel_layer.group_add)(
            self.inbox_channel_name, self.channel_name
        )

    commands = {"fetch_messages": fetch_messages}

    def connect(self):
        cookies = self.scope["cookies"]
        try:
            auth_token = cookies["Authorization"].replace("Token ", "")
            self.user = self.get_user(auth_token)

        except Exception:
            self.close()
            return

        self.accept()
        self.connect_to_inbox()

    def disconnect(self, close_code):
        # leave group room
        if hasattr(self, "room_group_name"):
            async_to_sync(self.channel_layer.group_discard)(
                self.chatroom_interceptor_name, self.channel_name
            )

    def receive(self, text_data):
        data = json.loads(text_data)
        self.commands[data["command"]](self, data)

    def send_message(self, message):
        self.send(text_data=json.dumps(message))
