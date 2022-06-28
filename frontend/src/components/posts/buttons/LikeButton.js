import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-solid-svg-icons";
import { UserContext } from "../../../context/UserContext";

import axios from "axios";
import { ModalContext } from "../../../context/ModalContext";
import usePostLikes from "../hooks/usePostLikes";

export default function LikeButton(props) {
  const [post] = useState(props.post);
  const [likeCount, setLikeCount] = useState(post.like_count);
  const [buttonClass, setButtonClass] = useState("btn-sm btn-primary");
  const { fullPostPage } = props;
  const { userVal, headersVal } = useContext(UserContext);
  const { toggleUserModal, userListVal, userModalVerbVal } =
    useContext(ModalContext);
  const [, setModalUserList] = userListVal;
  const [, setUserModalVerb] = userModalVerbVal;
  const [user] = userVal;
  const [headers] = headersVal;
  const postLikes = usePostLikes(post.id);

  useEffect(() => {
    if (post.liked) {
      setButtonClass("btn-sm btn-danger");
    } else {
      setButtonClass("btn-sm btn-primary");
    }
  }, [post]);

  const showModal = () => {
    postLikes.getUsersWhoLiked().then((userList) => setModalUserList(userList));
    setUserModalVerb("Liked");
    toggleUserModal();
  };
  const likePost = (_post) => {
    if (!user) {
      alert("login to be able to like posts!");
      return;
    }
    axios.post(`/posts/${_post.id}/like`, {}, headers).then((res) => {
      const result = res.data["result"];
      // LIKE
      if (result === "liked") {
        // increment like count if server responds "liked"
        setLikeCount(likeCount + 1);
        setButtonClass("btn-sm btn-danger");
      }
      // UNLIKE
      if (result === "unliked") {
        // vice versa with "unliked"
        setLikeCount(likeCount - 1);
        setButtonClass("btn-sm btn-primary");
      }
    });
  };

  if (fullPostPage) {
    return (
      <p>
        <button className={buttonClass} onClick={() => likePost(post)}>
          <FontAwesomeIcon icon={faHeart} />
        </button>{" "}
        <Link onClick={showModal} to="#">
          {likeCount === 1 ? `${likeCount} like` : `${likeCount} likes`}
        </Link>
      </p>
    );
  } else {
    return (
      <p>
        <button className={buttonClass} onClick={() => likePost(post)}>
          <FontAwesomeIcon icon={faHeart} />
          {" " + likeCount}
        </button>
      </p>
    );
  }
}
