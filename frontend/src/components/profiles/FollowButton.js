import axios from "axios";
import { useContext, useState } from "react";
import { Button } from "reactstrap";
import { UserContext } from "../../UserContext";

export default function FollowButton(props) {
  const { profile } = props;

  const [following, setFollowing] = useState(profile.following);

  const [followButtonPressed, setFollowButtonPressed] = useState(false);
  const { headersVal, userVal } = useContext(UserContext);
  const [user] = userVal;
  const [headers] = headersVal;

  const follow = async () => {
    let data = {
      follow: profile.id,
    };
    await axios
      .post(`/api/users/follow`, data, headers)
      .then(() => setFollowing(true));
  };

  const unfollow = async () => {
    let data = {
      unfollow: profile.id,
    };
    await axios
      .post(`/api/users/unfollow`, data, headers)
      .then(() => setFollowing(false));
  };

  const renderFollowButton = () => {
    if (user && user.username !== profile.username) {
      if (following === false) {
        return (
          <>
            <Button
              onClick={async () => {
                await follow();
                setFollowButtonPressed(!followButtonPressed);
              }}
            >
              Follow
            </Button>
          </>
        );
      } else if (following != null) {
        return (
          <>
            <Button
              onClick={async () => {
                await unfollow();
                setFollowButtonPressed(!followButtonPressed);
              }}
            >
              Unfollow
            </Button>
          </>
        );
      }
    } else if (!user){
      return (
        <Button
          onClick={() => alert("login to be able to follow other users!")}
        >Follow</Button>
      );
    }
    return null;
  };

  return <>{renderFollowButton()}</>;
}
