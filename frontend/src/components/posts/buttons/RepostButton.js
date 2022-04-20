import { faRetweet } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ModalContext } from "../../../context/ModalContext";
import { UserContext } from "../../../context/UserContext";
import usePostReposts from "../hooks/usePostReposts";

export default function RepostButton(props) {
  const [post] = useState(props.post);
  const { fullPostPage } = props;
  const { toggleUserModal, userListVal, userModalVerbVal } =
    useContext(ModalContext);
  const [, setModalUserList] = userListVal;
  const [, setUserModalVerb] = userModalVerbVal;
  const [repostCount, setRepostCount] = useState(props.post.repost_count);
  const [isReposted, setIsReposted] = useState(props.post.is_reposted);
  const [buttonClass, setButtonClass] = useState("btn-sm btn-primary");
  const { headersVal, userVal } = useContext(UserContext);
  const [headers] = headersVal;
  const [user] = userVal;
  const reposts = usePostReposts(post.id);

  useEffect(() => {
    if (isReposted) {
      setButtonClass("btn-sm btn-success");
    } else {
      setButtonClass("btn-sm btn-primary");
    }
  }, [post, isReposted, setUserModalVerb]);

  const showModal = () => {
    setUserModalVerb("Reposted");
    reposts
      .getUsersWhoReposted()
      .then((userList) => setModalUserList(userList));
    toggleUserModal();
  };

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
          <Link onClick={showModal} to="#">
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
