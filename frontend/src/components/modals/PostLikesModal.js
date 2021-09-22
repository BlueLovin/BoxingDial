import axios from "axios";
import React, { useEffect, useState } from "react";
import { Modal, ModalHeader, ModalBody } from "reactstrap";
import SmallUser from "../profiles/SmallUser";

export default function PostLikesModal(props) {
  let { toggle, postID } = props;
  const [likeList, setLikeList] = useState([]);

  useEffect(() => {
    const fetchLikes = () => {
      axios.get(`/api/posts/${postID}/likes`).then((res) => {
        setLikeList(res.data);
      });
    };
    fetchLikes();
  }, [postID]);

  const renderLikes = () => {
    if (likeList.length !== 0) {
      return likeList.map((like) => (
        <SmallUser user={like.user}/>
      ));
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
