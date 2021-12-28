import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { Button } from "reactstrap";
import { UserContext } from "../../UserContext";

export default function FollowButton(props) {
  const { profile } = props;

  const [isFollowing, setIsFollowing] = useState(profile.is_following);

  const { headersVal, userVal, loggedInVal } = useContext(UserContext);
  const [user] = userVal;
  const [headers] = headersVal;
  const [loggedIn] = loggedInVal;

  useEffect(() => {
    setIsFollowing(profile.is_following);
  }, [profile]);

  const follow = () => {
    let data = {
      follow: profile.id,
    };
    axios
      .post(`/api/users/follow`, data, headers)
      .then(() => setIsFollowing(true));
  };

  const unfollow = () => {
    let data = {
      unfollow: profile.id,
    };
    axios
      .post(`/api/users/unfollow`, data, headers)
      .then(() => setIsFollowing(false));
  };

  const renderFollowButton = () => {
    if (loggedIn) {
      if (user.username !== profile.username) {
        if (isFollowing === false) {
          return (
            <>
              <Button
                onClick={() => {
                  follow();
                }}
              >
                Follow
              </Button>
            </>
          );
        } else if (isFollowing != null) {
          return (
            <>
              <Button
                onClick={() => {
                  unfollow();
                }}
              >
                Unfollow
              </Button>
            </>
          );
        }
      }
    } else {
      return (
        <Button
          onClick={() => alert("login to be able to follow other users!")}
        >
          Follow
        </Button>
      );
    }
  };

  return <>{renderFollowButton()}</>;
}
