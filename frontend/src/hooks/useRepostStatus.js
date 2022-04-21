export default function useRepostStatus(repost) {
  var statusString = "";

  const numOfUsersWhoReposted = repost.users_who_reposted.length;
  
  if (numOfUsersWhoReposted <= 1) {
    statusString = `@${repost.reposter.username} reposted:`;
  }

  // build status string for each user that reposted
  if (numOfUsersWhoReposted > 1 && numOfUsersWhoReposted < 3) {
    for (var i = 0; i < numOfUsersWhoReposted; i++) {
      const isLastItem = i === numOfUsersWhoReposted - 1;
      const isFirstItem = i === 0;
      const username = repost.users_who_reposted[i].username;

      if (isLastItem) {
        statusString = statusString.concat(` and @${username} reposted:`);
      } else if (isFirstItem) {
        statusString = statusString.concat(`@${username}`);
      } else {
        statusString = statusString.concat(`, @${username}`);
      }
    }
  }
  return statusString;
}
