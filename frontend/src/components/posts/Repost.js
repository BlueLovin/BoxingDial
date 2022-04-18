import { Link } from "react-router-dom/cjs/react-router-dom.min";
import Post from "./Post";

export default function Repost(props) {
  const { repost, removeItem } = props;

  return (
    <>
      <p className="m-3">
        <Link to={`/user/${repost.reposter.username}`}>
          {repost.reposter.username}
        </Link>{" "}
        reposted:
      </p>
      <Post
        post={repost.post}
        removePostFromParentView={() => removeItem(repost)}
      />
    </>
  );
}
