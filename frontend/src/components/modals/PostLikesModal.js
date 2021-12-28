import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { Modal, ModalHeader, ModalBody } from "reactstrap";
import SmallUser from "../profiles/SmallUser";
import { UserContext } from "../../UserContext";

export default function PostLikesModal(props) {
  let { toggle, postID } = props;
  const [likeList, setLikeList] = useState([]);
  const { headersVal, loggedInVal } = useContext(UserContext);
  const [headers] = headersVal;
  const [loggedIn] = loggedInVal;

  useEffect(() => {
    const fetchLikes = () => {
      if (loggedIn) {
        // fetch with auth headers if logged in
        axios.get(`/api/posts/${postID}/likes`, headers).then((res) => {
          setLikeList(res.data);
        });
      } else {
        // fetch without authorization headers if logged out
        axios.get(`/api/posts/${postID}/likes`).then((res) => {
          setLikeList(res.data);
        });
      }
    };
    fetchLikes();
  }, [postID, headers, loggedIn]);

  const renderLikes = () => {
    if (likeList.length !== 0) {
      return likeList.map((like) => <SmallUser user={like.user} />);
    }
    return "nothing to see here. . . ";
  };

  return (
    <Modal isOpen={true} toggle={toggle} autoFocus={false}>
      <ModalHeader toggle={toggle}>Liked by</ModalHeader>
      <ModalBody>{renderLikes()}</ModalBody>
    </Modal>
  );
}
