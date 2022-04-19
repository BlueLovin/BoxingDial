import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { Modal, ModalHeader, ModalBody } from "reactstrap";
import SmallUser from "../profiles/SmallUser";
import { UserContext } from "../../UserContext";

export default function RepostsModal(props) {
  let { toggle, postID } = props;
  const [repostList, setRepostList] = useState([]);
  const { headersVal, loggedInVal } = useContext(UserContext);
  const [headers] = headersVal;
  const [loggedIn] = loggedInVal;

  useEffect(() => {
    const fetchReposts = () => {
      if (loggedIn) {
        // fetch with auth headers if logged in
        axios
          .get(`/posts/${postID}/reposts`, headers)
          .then((res) => setRepostList(res.data));
      } else {
        // fetch without authorization headers if logged out
        axios
          .get(`/posts/${postID}/reposts`)
          .then((res) => setRepostList(res.data));
      }
    };
    fetchReposts();
  }, [postID, headers, loggedIn]);

  const renderReposts = () => {
    if (repostList.length !== 0) {
      return repostList.map((repost) => <SmallUser user={repost.reposter} />);
    }
    return "nothing to see here. . . ";
  };

  return (
    <Modal isOpen={true} toggle={toggle} autoFocus={false}>
      <ModalHeader toggle={toggle}>Reposted by</ModalHeader>
      <ModalBody>{renderReposts()}</ModalBody>
    </Modal>
  );
}
