import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../../UserContext";

export default function RepostButton(props) {
  const [post] = useState(props.post);
  const [isReposted, setIsReposted] = useState(props.post.is_reposted);
  const [buttonClass, setButtonClass] = useState("btn-sm btn-primary");
  const { headersVal, userVal } = useContext(UserContext);
  const [headers] = headersVal;
  const [user] = userVal;

  useEffect(() => {
    if (isReposted) {
      setButtonClass("btn-sm btn-success");
    } else {
      setButtonClass("btn-sm btn-primary");
    }
  }, [post, isReposted]);

  const repost = () => {
    if (!user) {
      alert("must be logged in to repost a post.");
      return;
    }

    if (isReposted) {
      axios
        .delete(`/posts/${post.id}/repost`, headers)
        .then(() => setIsReposted(false));
    } else {
      axios
        .post(`/posts/${post.id}/repost`, {}, headers)
        .then(() => setIsReposted(true));
    }
  };

  return (
    <button className={buttonClass} onClick={repost}>
      {isReposted ? "Reposted" : "Repost"}
    </button>
  );
}
