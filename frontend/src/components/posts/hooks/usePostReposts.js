import axios from "axios";
import { useContext } from "react";
import { UserContext } from "../../../context/UserContext";

export default function usePostReposts(postID) {
  const { headersVal, loggedInVal } = useContext(UserContext);
  const [loggedIn] = loggedInVal;
  const [headers] = headersVal;

  const getUsersWhoReposted = () => {
    if (loggedIn) {
      // fetch with auth headers if logged in
      return axios
        .get(`/posts/${postID}/reposts`, headers)
        .then((res) => res.data.map((_repost) => _repost.reposter));
    } else {
      // fetch without authorization headers if logged out
      return axios
        .get(`/posts/${postID}/reposts`)
        .then((res) => res.data.map((_repost) => _repost.reposter));
    }
  };

  return { getUsersWhoReposted };
}
