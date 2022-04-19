import { FeedComment } from "../comments/FeedComment";
import Post from "../posts/Post";
import Repost from "../posts/Repost";

export default function FeedItem(props) {
  const { item, removeItem } = props;
  const type = item.feed_type;

  switch (type) {
    case "comment":
      return (
        <FeedComment
          key={item.id}
          comment={item}
          removeCommentFromParentList={() => removeItem(item)}
        />
      );
    case "post":
      return (
        <Post
          key={item.id}
          post={item}
          removePostFromParentList={() => removeItem(item)}
        />
      );
    case "repost":
      return (
        <Repost
          repost={item}
          key={item.id}
          removeItem={() => removeItem(item)}
        />
      );
    default:
      return null;
  }
}
