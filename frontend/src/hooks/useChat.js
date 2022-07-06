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
      readUnreadMessages();
      isMounted.current = true;
    }
  }, [chats, readUnreadMessages]);

  const disconnect = useCallback(() => {
    if (websocket !== null) {
      websocket.disconnect();
    }
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

  const updateLastReceivedMessageInConversation = useCallback(
    (newMessage) => {
      let conversation = conversations[newMessage.group];
      const creatingNewConversation = conversation === undefined;
      if (creatingNewConversation) {
        axios
          .post("/retrieve-message-group", { id: newMessage.group })
          .then((res) => {
            const newConversation = res.data;
            newConversation["last_received_message"] = newMessage;
            setConversations((c) => ({
              [newMessage.group]: newConversation,
              ...c,
            }));
          });
      } else {
        conversation["last_received_message"] = newMessage;
        setConversations((c) => ({ [newMessage.group]: conversation, ...c }));
      }
    },
    [conversations]
  );

  const receiveNewChat = useCallback(
    (message) => {
      const isSendingMessage = message.owner.username === user.username;
      const isReceivingMessage = message.to.username === user.username;

      const isReceivingFromSelectedConversation =
        isReceivingMessage &&
        selectedUser !== undefined &&
        message.owner.username === selectedUser.username;

      const isSendingToSelectedConversation =
        isSendingMessage &&
        selectedUser !== undefined &&
        message.to.username === selectedUser.username;

      if (isReceivingMessage && !isReceivingFromSelectedConversation) {
        inbox.addtoUnreadNotificationsCount(1);
      }

      if (
        isSendingToSelectedConversation ||
        isReceivingFromSelectedConversation
      ) {
        setChats((c) => [...c, message]);
      }

      if (isReceivingFromSelectedConversation) {
        readUnreadMessages();
      }

      updateLastReceivedMessageInConversation(message);
    },
    [
      user,
      inbox,
      readUnreadMessages,
      selectedUser,
      updateLastReceivedMessageInConversation,
    ]
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
    conversations,
    initSocketConnection,
    initChatWithUser,
    setSelectedUser,
    selectedUser,
  };
}
