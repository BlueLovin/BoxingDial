import { useContext } from "react";
import { UserContext } from "../../context/UserContext";
import { faComments } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom/cjs/react-router-dom.min";
import { NavItem, NavLink } from "reactstrap";
export default function ChatNavItem() {
  const { loggedInVal, inboxVal } = useContext(UserContext);

  const [loggedIn] = loggedInVal;
  const [inbox] = inboxVal;

  let navItemText = "";

  if (!loggedIn || !inbox) {
    return null;
  }

  if (inbox.unread_chat_messages_count > 0) {
    navItemText = ` Chat (${inbox.unread_chat_messages_count})`;
  } else {
    navItemText = " Chat";
  }

  return (
    <NavItem>
      <NavLink tag={Link} to="/chat">
        <FontAwesomeIcon icon={faComments} />
        {navItemText}
      </NavLink>
    </NavItem>
  );
}
