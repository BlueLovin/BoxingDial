import { useCallback, useContext, useEffect, useState } from "react";
import WebSocketService from "../services/WebSocketService";
import axios from "axios";
import { UserContext } from "../context/UserContext";

export default function useChat() {
  const { headersVal, userVal } = useContext(UserContext);
  const [headers] = headersVal;
  const [user] = userVal;
  const [chats, setChats] = useState([]);
  const [contactingUser, setContactingUser] = useState();
  const [websocket, setWebSocketInstance] = useState(null);
  const [conversations, setConversations] = useState({});

  useEffect(() => {
    const fetchConversations = () => {
      axios
        .get("/user/conversations", headers)
        .then((res) => setConversations(res.data));
    };
    fetchConversations();
  }, [headers]);
  useEffect(() => console.log(conversations), [conversations]);
  const receiveNewChat = useCallback(
    (message) => {
      console.log(conversations);
      if (conversations === {} || contactingUser === undefined) {
        return;
      }

      if (
        (message.to.username === contactingUser.username &&
          message.owner.username === user.username) ||
        (message.owner.username === contactingUser.username &&
          message.to.username === user.username)
      ) {
        setChats((c) => [...c, message]);
      }

      let conversation = conversations[message.group];
      conversation["last_received_message"] = message;
      setConversations((c) => ({ [message.group]: conversation, ...c }));
    },
    [conversations, contactingUser, user.username]
  );
  useEffect(() => {
    if (websocket !== null) {
      websocket.addCallbacks(
        (_user) => setContactingUser(_user),
        (messages) => setChats(messages),
        (message) => receiveNewChat(message)
      );
      return;
    }

    const socket = WebSocketService.getInstance();
    setWebSocketInstance(socket);
    socket.connect();
    socket.waitForSocketConnection(() => {
      socket.addCallbacks(
        (_user) => setContactingUser(_user),
        (messages) => setChats(messages),
        (message) => receiveNewChat(message)
      );
    });
  }, [receiveNewChat, conversations, websocket, contactingUser]);

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
  return { newChat, initChatWithUser, chats, conversations, contactingUser };
}
