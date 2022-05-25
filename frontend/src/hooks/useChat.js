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

  const receiveNewChat = useCallback(
    (message) => {
      if (conversations === {} || contactingUser === undefined) {
        return;
      }

      const sending =
        message.to.username === contactingUser.username &&
        message.owner.username === user.username;
      const receiving =
        message.owner.username === contactingUser.username &&
        message.to.username === user.username;


      if (sending || receiving) {
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

  const sendChat = useCallback(
    (newChatMessage) => {
      websocket.sendChatMessage(newChatMessage);
    },
    [websocket]
  );
  return { sendChat, initChatWithUser, chats, conversations, contactingUser };
}
