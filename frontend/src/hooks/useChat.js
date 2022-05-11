import { useEffect, useState } from "react";
import WebSocketService from "../services/WebSocketService";

export default function useChat() {
  const [chats, setChats] = useState([]);
  const [contactingUser, setContactingUser] = useState();
  const [websocket, setWebSocketInstance] = useState(null);

  useEffect(() => {
    if (websocket !== null) {
      websocket.connect();
      websocket.waitForSocketConnection(() => {
        websocket.addCallbacks(
          (messages) => setChats(messages),
          (message) => setChats((c) => [...c, message])
        );
      });
    } else {
      const instance = WebSocketService.getInstance();
      setWebSocketInstance(instance);
    }
  }, [websocket]);

  useEffect(() => {
    if (websocket !== null) {
      websocket.fetchMessages();
    }
  }, [contactingUser, websocket]);

  const initChatWithUser = (userToContact) => {
    if (websocket !== null && userToContact) {
      websocket.waitForSocketConnection(() => {
        websocket.initChatWithUser(userToContact);
        setContactingUser(userToContact);
      });
    }
  };

  const newChat = (newChatMessage) => {
    websocket.newChatMessage(newChatMessage);
  };
  return { newChat, initChatWithUser, chats };
}
