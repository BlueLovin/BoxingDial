import { useContext } from "react";
import { UserContext } from "../../UserContext";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "reactstrap";

export default function ShowInboxBell() {
  const { userVal, loggedInVal } = useContext(UserContext);
  const [user] = userVal;
  const [loggedIn] = loggedInVal;

  const renderBell = () => {
    if (loggedIn) {
      return (
        <span className="p-5">
          <Button color="danger" href="/inbox">
            <FontAwesomeIcon icon={faBell} onClick={null} />
            {" " + user.unread_messages_count}
          </Button>
        </span>
      );
    } else {
      return null;
    }
  };

  return <div>{renderBell()}</div>;
}
