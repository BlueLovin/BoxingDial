import { faRetweet } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../../../UserContext";

export default function RepostButton(props) {
  const [post] = useState(props.post);
  const { toggleModal, fullPostPage } = props;
  const [repostCount, setRepostCount] = useState(props.post.repost_count);
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
        .then(() => setIsReposted(false))
        .then(() => setRepostCount((c) => c - 1));
    } else {
      axios
        .post(`/posts/${post.id}/repost`, {}, headers)
        .then(() => setIsReposted(true))
        .then(() => setRepostCount((c) => c + 1));
    }
  };

  return (
    <>
      <p>
        <button className={buttonClass} onClick={repost}>
          <FontAwesomeIcon icon={faRetweet} />
          {` ${repostCount}`}
        </button>{" "}
        {fullPostPage && (
          <Link onClick={toggleModal} to="#">
            {repostCount > 1
              ? `${repostCount} reposts`
              : `${repostCount} repost`}
            
          </Link>
        )}
      </p>
      <p></p>
    </>
  );
}
