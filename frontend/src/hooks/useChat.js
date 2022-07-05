import { useCallback, useContext, useEffect, useRef, useState } from "react";
import WebSocketService from "../services/WebSocketService";
import axios from "axios";
import { UserContext } from "../context/UserContext";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import useInbox from "./useInbox";

export default function useChat() {
  const { headersVal, userVal } = useContext(UserContext);
  const [headers] = headersVal;
  const [user] = userVal;
  const [chats, setChats] = useState([]);
  const [selectedUser, setSelectedUser] = useState();
  const [websocket, setWebSocketInstance] = useState(null);
  const [conversations, setConversations] = useState({});
  const inbox = useInbox();
  const history = useHistory();
  const isMounted = useRef(false);

  useEffect(() => {
    const fetchConversations = () => {
      axios
        .get("/user/conversations", headers)
        .then((res) => setConversations(res.data));
    };
    fetchConversations();
  }, [headers]);

  const updateNewlyReadChats = useCallback((messageIDs) => {
    setChats((_chats) =>
      _chats.map((message) => {
        const updateMessage = messageIDs.includes(message.id);
        if (updateMessage) {
          messageIDs.push(message.id);
          return { ...message, read_by_recipient: true };
        }
        return message;
      })
    );
    return messageIDs;
  }, []);
  const getUnreadMessageIDs = useCallback(() => {
    let messageIDs = [];
    chats.forEach((message) => {
      const isOwner = message.owner.username === user.username;
      const sendReadReceipt = !isOwner && !message.read_by_recipient;
      if (sendReadReceipt) {
        messageIDs.push(message.id);
        return { ...message, read_by_recipient: true };
      }
      return message;
    });
    return messageIDs;
  }, [user.username, chats]);

  const readUnreadMessages = useCallback(() => {
    const unreadMessageIDs = getUnreadMessageIDs();
    const unreadMessageCount = unreadMessageIDs.length;
    if (unreadMessageCount > 0) {
      axios
        .post("/chat/read-messages", { message_ids: unreadMessageIDs }, headers)
        .then(() => inbox.addToUnreadChatsCount(-unreadMessageCount))
        .then(() => updateNewlyReadChats(unreadMessageIDs));
    }
  }, [getUnreadMessageIDs, updateNewlyReadChats, headers, inbox]);

  useEffect(() => {
    if (chats.length !== 0 && isMounted.current === false) {
      console.log(chats);
      readUnreadMessages();
      isMounted.current = true;
    }
  }, [chats, readUnreadMessages]);

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
    [headers, websocket, history, setSelectedUser]
  );

  const initSocketConnection = useCallback(
    () =>
      new Promise((resolve) => {
        if (websocket !== null) {
          websocket.waitForSocketConnection(() => {
            resolve();
          });
        }
      }),
    [websocket]
  );

  const receiveNewChat = useCallback(
    (message) => {
      if (conversations === {}) {
        return;
      }
      const isSendingMessage = message.owner.username === user.username;
      const isReceivingMessage = message.to.username === user.username;

      const isReceivingFromSelectedConversation =
        selectedUser !== null &&
        selectedUser !== undefined &&
        message.owner.username === selectedUser.username;
      console.log(selectedUser);
      if (isReceivingMessage && !isReceivingFromSelectedConversation) {
        inbox.addtoUnreadNotificationsCount(1);
      }

      let conversation = conversations[message.group];
      if (conversation !== undefined) {
        conversation["last_received_message"] = message;
        setConversations((c) => ({ [message.group]: conversation, ...c }));
      } else {
        // new conversation
        axios
          .post("/retrieve-message-group", { id: message.group })
          .then((res) => {
            const newConversation = res.data;
            newConversation["last_received_message"] = message;
            setConversations((c) => ({
              [message.group]: newConversation,
              ...c,
            }));
          });
      }

      if (isSendingMessage || isReceivingFromSelectedConversation) {
        setChats((c) => [...c, message]);
      }

      if (isReceivingFromSelectedConversation) {
        readUnreadMessages();
      }
    },
    [conversations, user, inbox, readUnreadMessages, selectedUser]
  );

  useEffect(() => {
    if (websocket !== null) {
      websocket.addCallbacks(
        (messages) => setChats(messages),
        (message) => receiveNewChat(message)
      );
      return;
    }

    const socket = WebSocketService.getInstance();
    setWebSocketInstance(socket);
    socket.connect();
    socket.addCallbacks(
      (messages) => setChats(messages),
      (message) => receiveNewChat(message)
    );
    socket.waitForSocketConnection();
  }, [receiveNewChat, conversations, websocket, selectedUser]);

  useEffect(() => {
    if (websocket !== null && selectedUser !== undefined) {
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
    setChats,
    readUnreadMessages,
    conversations,
    initSocketConnection,
    initChatWithUser,
    setSelectedUser,
    selectedUser,
  };
}
