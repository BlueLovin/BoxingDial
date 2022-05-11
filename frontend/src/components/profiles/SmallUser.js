import { Link } from "react-router-dom";
import FollowButton from "./FollowButton";

export default function SmallUser({ user, bioText, toggleUserModal }) {
  if(bioText === undefined){
    bioText = user.profile.bio;
  }

  return (
    <div className="small-user">
      <div className="image-cropper">
        <img className="medium-avatar" src={user.profile.avatar_url} alt="avatar" />
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
