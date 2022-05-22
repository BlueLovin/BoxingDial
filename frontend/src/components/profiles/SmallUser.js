import { Link } from "react-router-dom";
import FollowButton from "./FollowButton";

export default function SmallUser({
  user,
  bioText,
  toggleUserModal,
  selected = false,
  showBackground = true,
}) {
  if (bioText === undefined) {
    bioText = user.profile.bio;
  }

  let cssClass = "small-user";
  if (selected) {
    cssClass = "small-user-selected";
  } else if (!showBackground) {
    cssClass = "small-user-no-background";
  }

  return (
    <div className={cssClass}>
      <div className="image-cropper">
        <img
          className="medium-avatar"
          src={user.profile.avatar_url}
          alt="avatar"
        />
      </div>
      <div className="small-user-name">
        <Link to={`/user/${user.username}`} onClick={toggleUserModal}>
          {user.username}
        </Link>
        <br />
        <p>{bioText}</p>
      </div>
      <div className="small-user-follow">
        <FollowButton profile={user} />
      </div>
    </div>
  );
}
