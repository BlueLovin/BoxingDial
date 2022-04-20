import { Link } from "react-router-dom";
import FollowButton from "./FollowButton";

export default function SmallUser({ user, toggleUserModal }) {
  return (
    <div className="small-user">
      <div className="image-cropper">
        <img className="avatar" src="/default_images/lion.jpg" alt="avatar" />
      </div>
      <div className="small-user-name">
        <Link to={`/user/${user.username}`} onClick={toggleUserModal}>
          {user.username}
        </Link>
        <br />
        <p>placeholder bio</p>
      </div>
      <div className="small-user-follow">
        <FollowButton profile={user} />
      </div>
    </div>
  );
}
