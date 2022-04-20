import axios from "axios";
import { useContext } from "react";
import { UserContext } from "../../../context/UserContext";

export default function usePostLikes(postID) {
  const { headersVal, loggedInVal } = useContext(UserContext);
  const [loggedIn] = loggedInVal;
  const [headers] = headersVal;

  const getUsersWhoLiked = () => {
    if (loggedIn) {
      // fetch with auth headers if logged in
      return axios
        .get(`/posts/${postID}/likes`, headers)
        .then((res) => res.data.map((like) => like.user));
    } else {
      // fetch without authorization headers if logged out
      return axios
        .get(`/posts/${postID}/likes`)
        .then((res) => res.data.map((like) => like.user));
    }
  };

  return { getUsersWhoLiked };
}
