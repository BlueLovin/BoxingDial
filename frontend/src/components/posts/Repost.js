import useRepostStatus from "../../hooks/useRepostStatus";
import HighlightedContent from "./HighlightedContent";
import Post from "./Post";

export default function Repost(props) {
  const { repost, removeItem } = props;
  const statusString = useRepostStatus(repost);

  const renderStatusString = () => {
    if (repost.users_who_reposted.length > 4) {
      // TODO:
      // return "and 5 others reposted... and open a modal of the ppl who reposted
    }

    return (
      <p className="m-3">
        <HighlightedContent
          content={statusString}
          userList={repost.users_who_reposted}
        />
      </p>
    );
  };
  return (
    <>
      {renderStatusString()}
      <Post
        post={repost.post}
        removePostFromParentView={() => removeItem(repost)}
      />
    </>
  );
}
