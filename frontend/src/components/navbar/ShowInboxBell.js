import { useContext } from "react";
import { UserContext } from "../../context/UserContext";
import { faBell, faComments } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "reactstrap";

export default function ShowInbox() {
  const { loggedInVal, inboxVal } = useContext(UserContext);

  const [loggedIn] = loggedInVal;
  const [inbox] = inboxVal;

  if (loggedIn && inbox) {
    return (
      <>
        <span className="p-1">
          <Button
            color={inbox.unread_notifications_count > 0 ? "danger" : "primary"}
            href="/inbox"
          >
            <FontAwesomeIcon icon={faBell} onClick={null} />
            {" " + inbox.unread_notifications_count}
          </Button>
        </span>
        <span className="p-3">
          <Button
            color={inbox.unread_chat_messages_count > 0 ? "success" : "primary"}
            href="/chat"
          >
            <FontAwesomeIcon icon={faComments} onClick={null} />
            {" " + inbox.unread_chat_messages_count}
          </Button>
        </span>
      </>
    );
  }

  return null;
}
