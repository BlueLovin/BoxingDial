import { useCallback, useContext, useEffect, useState } from "react";
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

  useEffect(() => {
    const fetchConversations = () => {
      axios
        .get("/user/conversations", headers)
        .then((res) => setConversations(res.data));
    };
    fetchConversations();
  }, [headers]);

  const getUnreadMessageIDsAndUpdateChats = useCallback(() => {
    let messageIDs = [];
    const newChatList = chats.forEach((message) => {
      const isOwner = message.owner.username === user.username;
      const sendReadReceipt = !isOwner && !message.read_by_recipient;
      if (sendReadReceipt) {
        messageIDs.push(message.id);
        return { ...message, read_by_recipient: true };
      }
      return message;
    });
    // setChats(newChatList);
    return messageIDs;
  }, [chats, user.username]);

  const readUnreadMessages = useCallback(() => {
    const unreadMessageIDs = getUnreadMessageIDsAndUpdateChats();
    console.log(unreadMessageIDs);
    const unreadMessageCount = unreadMessageIDs.length;
    if (unreadMessageCount > 0) {
      axios
        .post("/chat/read-messages", { message_ids: unreadMessageIDs }, headers)
        .then(() => inbox.addToUnreadChatsCount(-unreadMessageCount));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getUnreadMessageIDsAndUpdateChats, headers]);

  useEffect(() => {
    if (chats !== undefined) {
      readUnreadMessages();
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

  useEffect(() => {
    console.log("selected user changed")
    console.log(selectedUser);
  }, [selectedUser]);

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


      // WHY TF IS SELECTED USER UNDEFINED HERE???
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

      if (isReceivingFromSelectedConversation) {
        readUnreadMessages();
      }

      if (isSendingMessage || isReceivingFromSelectedConversation) {
        setChats((c) => [...c, message]);
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
    socket.waitForSocketConnection(() => {
      socket.addCallbacks(
        (messages) => setChats(messages),
        (message) => receiveNewChat(message)
      );
    });
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
