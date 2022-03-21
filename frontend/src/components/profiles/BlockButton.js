import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { Button } from "reactstrap";
import { UserContext } from "../../UserContext";

export default function BlockButton(props) {
  const { profile } = props;

  const [isBlocked, setIsBlocked] = useState(profile.is_following);

  const { headersVal, userVal, loggedInVal } = useContext(UserContext);
  const [user] = userVal;
  const [headers] = headersVal;
  const [loggedIn] = loggedInVal;

  useEffect(() => {
    setIsBlocked(profile.blocked);
  }, [profile]);

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

  const renderFollowButton = () => {
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

  return <>{renderFollowButton()}</>;
}
