import { useCallback, useContext, useEffect, useState } from "react";
import WebSocketService from "../services/WebSocketService";
import axios from "axios";
import { UserContext } from "../context/UserContext";

export default function useChat() {
  const { headersVal, userVal } = useContext(UserContext);
  const [headers] = headersVal;
  const [user] = userVal;
  const [chats, setChats] = useState([]);
  const [selectedUser, setSelectedUser] = useState({});
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

  const disconnect = useCallback(() => {
    if (websocket === null) {
      return;
    }
    websocket.disconnect();
  }, [websocket]);

  const initChatWithUser = useCallback(
    (userToContact) =>
      new Promise((resolve) => {
        if (websocket === null) {
          return;
        }
        axios
          .get(`/users/${userToContact}/`, headers)
          .then((res) => setSelectedUser(res.data))
          .then(() => websocket.fetchMessages())
          .then(() => resolve());
      }),
    [headers, websocket]
  );

  const initSocketConnection = useCallback(
    () =>
      new Promise((resolve) => {
        if (websocket !== null && selectedUser !== {}) {
          websocket.waitForSocketConnection(() => {
            resolve();
          });
        }
      }),
    [selectedUser, websocket]
  );

  const receiveNewChat = useCallback(
    (message) => {
      if (conversations === {} || selectedUser === undefined) {
        return;
      }

      const sending =
        message.to.username === selectedUser.username &&
        message.owner.username === user.username;
      const receiving =
        message.owner.username === selectedUser.username &&
        message.to.username === user.username;

      if (sending || receiving) {
        setChats((c) => [...c, message]);
      }

      let conversation = conversations[message.group];
      if (conversation !== undefined) {
        conversation["last_received_message"] = message;
        setConversations((c) => ({ [message.group]: conversation, ...c }));
      } else {
        axios
          .post("/retrieve-message-group", { id: message.group })
          .then((res) =>
            setConversations((c) => ({ [message.group]: res.data, ...c }))
          );
      }

      // new conversation
    },
    [conversations, selectedUser, user]
  );

  useEffect(() => {
    if (websocket !== null) {
      websocket.addCallbacks(
        (_user) => setSelectedUser(_user),
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
        (_user) => setSelectedUser(_user),
        (messages) => setChats(messages),
        (message) => receiveNewChat(message)
      );
    });
  }, [receiveNewChat, conversations, websocket, selectedUser]);

  useEffect(() => {
    if (websocket !== null && selectedUser !== {}) {
      websocket.fetchMessages(selectedUser.username);
    }
  }, [websocket, selectedUser]);

  const sendChat = useCallback(
    (newChat) => {
      axios.post(
        `/chat/${selectedUser.username}`,
        { content: newChat },
        headers
      );
    },
    [selectedUser, headers]
  );

  return {
    sendChat,
    disconnect,
    chats,
    conversations,
    initSocketConnection,
    initChatWithUser,
    setSelectedUser,
    selectedUser,
  };
}
