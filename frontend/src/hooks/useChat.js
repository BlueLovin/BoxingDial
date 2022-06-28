import { useCallback, useContext, useEffect, useState } from "react";
import WebSocketService from "../services/WebSocketService";
import axios from "axios";
import { UserContext } from "../context/UserContext";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";

export default function useChat() {
  const { headersVal, userVal } = useContext(UserContext);
  const [headers] = headersVal;
  const [user] = userVal;
  const [chats, setChats] = useState([]);
  const [selectedUser, setSelectedUser] = useState({});
  const [websocket, setWebSocketInstance] = useState(null);
  const [conversations, setConversations] = useState({});
  const history = useHistory();

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
          .then(() => resolve())
          .catch(() => history.push("/404"));
      }),
    [headers, websocket, history]
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

      const isSendingMessage =
        message.to.username === selectedUser.username &&
        message.owner.username === user.username;
      const isReceivingMessage =
        message.owner.username === selectedUser.username &&
        message.to.username === user.username;

      if (isSendingMessage || isReceivingMessage) {
        setChats((c) => [...c, message]);
      }

      let conversation = conversations[message.group];
      if (conversation !== undefined) {
        conversation["last_received_message"] = message;
        setConversations((c) => ({ [message.group]: conversation, ...c }));
      } else {
        // new conversation
        axios
          .post("/retrieve-message-group", { id: message.group })
          .then((res) =>
            setConversations((c) => ({ [message.group]: res.data, ...c }))
          );
      }
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
      axios
        .post(`/chat/${selectedUser.username}`, { content: newChat }, headers)
        .catch((err) => {
          alert(
            "there was an error sending your message: \n" +
              err.response.data.error
          );
        });
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
