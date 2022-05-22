import { useCallback, useEffect, useState } from "react";
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
          (user) => setContactingUser(user),
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
  }, [websocket]);

  const initChatWithUser = useCallback(
    (userToContact) =>
      new Promise((resolve) => {
        if (websocket !== null && userToContact) {
          websocket.waitForSocketConnection(() => {
            websocket.initChatWithUser(userToContact);
            websocket.fetchMessages();
            resolve();
          });
        }
      }),
    [websocket]
  );

  const newChat = useCallback(
    (newChatMessage) => {
      websocket.newChatMessage(newChatMessage);
    },
    [websocket]
  );
  return { newChat, initChatWithUser, chats, contactingUser };
}
