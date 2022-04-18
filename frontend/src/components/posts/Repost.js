import HighlightedContent from "./HighlightedContent";
import Post from "./Post";

export default function Repost(props) {
  const { repost, removeItem } = props;

  const statusString = () => {
    var _statusString = "";
    const numOfUsersWhoReposted = repost.users_who_reposted.length;
    if (numOfUsersWhoReposted === 1) {
      _statusString = `@${repost.reposter.username} reposted:`;
    }

    // build status string for each user that reposted
    if (numOfUsersWhoReposted > 1 && numOfUsersWhoReposted < 4) {
      for (var i = 0; i < numOfUsersWhoReposted; i++) {
        const isLastItem = i === numOfUsersWhoReposted - 1;
        const isFirstItem = i === 0;
        const username = repost.users_who_reposted[i].username;
        if (isLastItem) {
          _statusString = _statusString.concat(` and @${username} reposted:`);
        } else if (isFirstItem) {
          _statusString = _statusString.concat(`@${username}`);
        } else {
          _statusString = _statusString.concat(`, @${username}`);
        }
      }
    }

    if (numOfUsersWhoReposted > 4) {
      // TODO:
      // return "and 5 others reposted... and open a modal of the ppl who reposted
    }

    return (
      <p className="m-3">
        <HighlightedContent
          content={_statusString}
          userList={repost.users_who_reposted}
        />
      </p>
    );
  };
  return (
    <>
      {statusString()}
      <Post
        post={repost.post}
        removePostFromParentView={() => removeItem(repost)}
      />
    </>
  );
}
