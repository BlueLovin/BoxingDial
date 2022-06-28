import { Link } from "react-router-dom/cjs/react-router-dom.min";

export default function ItemAuthor({ user }) {
  return (
    <div className="d-flex align-items-center">
      <div className="image-cropper">
        <Link to={`/user/${user.username}`}>
          <img
            className="medium-avatar"
            src={user.profile.avatar_url}
            alt="avatar"
          />
        </Link>
      </div>

      <span>
        {user.profile && user.profile.screen_name}
        <Link to={`/user/${user.username}`}>
          <div>@{user.username}</div>
        </Link>
      </span>
    </div>
  );
}
