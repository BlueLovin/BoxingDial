import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../../UserContext";

export default function RepostButton(props) {
  const [post] = useState(props.post);
  const [isReposted, setIsReposted] = useState(props.post.is_reposted);
  const [buttonClass, setButtonClass] = useState("btn-sm btn-primary");
  const { headersVal } = useContext(UserContext);
  const [headers] = headersVal;

  useEffect(() => {
    console.log(post);
    if (isReposted) {
      setButtonClass("btn-sm btn-success");
    } else {
      setButtonClass("btn-sm btn-primary");
    }
  }, [post, isReposted]);

  const repost = () => {
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
      Repost
    </button>
  );
}
