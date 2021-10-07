import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { Button } from "reactstrap";
import { UserContext } from "../../UserContext";

export default function FollowButton(props) {
  const { profile } = props;

  const [isFollowing, setIsFollowing] = useState(profile.is_following);
  const [followButtonPressed, setFollowButtonPressed] = useState(false);
  const { headersVal, userVal } = useContext(UserContext);
  const [user] = userVal;
  const [headers] = headersVal;

  useEffect(()=>{
    setIsFollowing(profile.is_following);
  }, [profile]);

  const follow = async () => {
    let data = {
      follow: profile.id,
    };
    await axios
      .post(`/api/users/follow`, data, headers)
      .then(() => setIsFollowing(true));
  };

  const unfollow = async () => {
    let data = {
      unfollow: profile.id,
    };
    await axios
      .post(`/api/users/unfollow`, data, headers)
      .then(() => setIsFollowing(false));
  };

  const renderFollowButton = () => {
    if (user.username !== profile.username) {
      if (isFollowing === false) {
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
      } else if (isFollowing != null) {
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
    } else if(user === null) {
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
