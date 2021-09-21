import axios from "axios";
import React, { useEffect, useState } from "react";
import { Modal, ModalHeader, ModalBody } from "reactstrap";

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
      if(likeList.length !== 0){
        return likeList.map((like) => (
            <>
              {like.user.username}
            </>
        ));
      }
      return "nothing to see here. . . ";
      
  }

  return (
    <Modal isOpen={true} toggle={toggle} autoFocus={false}>
      <ModalHeader toggle={toggle}>Liked by</ModalHeader>
      <ModalBody className="text-right p-3">
          {renderLikes()}
          </ModalBody>
    </Modal>
  );
}
