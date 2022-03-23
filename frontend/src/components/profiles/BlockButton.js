import axios from "axios";
import { useContext } from "react";
import { Button } from "reactstrap";
import { UserContext } from "../../UserContext";

// pass down the already-set "isBlocked" state. this is not calculated on mount here.
export default function BlockButton(props) {
  const { profile } = props;

  const [isBlocked, setIsBlocked] = props.isBlockedState;

  const { headersVal, userVal, loggedInVal } = useContext(UserContext);
  const [user] = userVal;
  const [headers] = headersVal;
  const [loggedIn] = loggedInVal;

  const block = () => {
    axios
      .put(`/api/user/block/${profile.id}/`, {}, headers)
      .then(() => setIsBlocked(true));
  };

  const unblock = () => {
    axios
      .put(`/api/user/unblock/${profile.id}/`, {}, headers)
      .then(() => setIsBlocked(false));
  };

  const renderBlockButton = () => {
    if (loggedIn) {
      if (user.username !== profile.username) {
        if (isBlocked === false) {
          return (
            <>
              <Button color="danger" onClick={() => block()}>
                Block
              </Button>
            </>
          );
        } else if (isBlocked != null) {
          return (
            <>
              <Button color="danger" onClick={() => unblock()}>
                Unblock
              </Button>
            </>
          );
        }
      }
    } else {
      return null;
    }
  };

  return <>{renderBlockButton()}</>;
}
