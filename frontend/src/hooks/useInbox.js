import axios from "axios";
import { useCallback, useContext, useEffect, useState } from "react";
import { UserContext } from "../context/UserContext";

const useInbox = () => {
  const [unreadChatsCount, setUnreadChatsCount] = useState();
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState();
  const { headersVal, inboxVal } = useContext(UserContext);
  const [headers] = headersVal;
  const [inbox, setInbox] = inboxVal;

  useEffect(() => {
    if (
      unreadChatsCount !== undefined &&
      unreadNotificationsCount !== undefined
    ) {
      setInbox({
        unread_chat_messages_count: unreadChatsCount,
        unread_notifications_count: unreadNotificationsCount,
      });
    }
  }, [unreadChatsCount, unreadNotificationsCount, setInbox]);

  useEffect(() => {
    const beforeMount = inbox !== null && unreadChatsCount === undefined;

    if (beforeMount) {
      console.table(inbox);
      setUnreadChatsCount(inbox.unread_chat_messages_count);
      setUnreadNotificationsCount(inbox.unread_notifications_count);
    }
  }, [inbox, unreadChatsCount, unreadNotificationsCount]);

  const fetchInbox = useCallback(() => {
    axios.get("/inbox", headers).then((res) => {
      const _inbox = res.data;
      setUnreadChatsCount(_inbox.unread_chat_messages_count);
      setUnreadNotificationsCount(_inbox.unread_notifications_count);
    });
  }, [headers]);

  const validateNewNumber = useCallback((currentCount, numberToAdd) => {
    const newVal = currentCount + numberToAdd;

    if (newVal > -1) {
      return newVal;
    }
    return currentCount;
  }, []);

  const addToUnreadChatsCount = useCallback(
    (num) => {
      setUnreadChatsCount((c) => validateNewNumber(c, num));
    },
    [validateNewNumber]
  );

  const addtoUnreadNotificationsCount = useCallback(
    (num) => {
      setUnreadChatsCount((c) => validateNewNumber(c, num));
    },
    [validateNewNumber]
  );

  return {
    fetchInbox,
    unreadChatsCount,
    unreadNotificationsCount,
    addToUnreadChatsCount,
    addtoUnreadNotificationsCount,
  };
};

export default useInbox;
