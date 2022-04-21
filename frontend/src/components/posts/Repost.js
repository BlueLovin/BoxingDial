import React, { useContext } from "react";
import { ModalContext } from "../../context/ModalContext";
import { Link } from "react-router-dom";
import useRepostStatus from "../../hooks/useRepostStatus";
import HighlightedContent from "./HighlightedContent";
import Post from "./Post";
import usePostReposts from "./hooks/usePostReposts";

export const Repost = React.memo((props) => {
  const { repost, removeItem } = props;
  const { toggleUserModal, userListVal, userModalVerbVal } =
    useContext(ModalContext);
  const [, setModalUserList] = userListVal;
  const [, setUserModalVerb] = userModalVerbVal;
  const statusString = useRepostStatus(repost);
  const reposts = usePostReposts(repost.post.id);

  const showModal = () => {
    reposts
      .getUsersWhoReposted()
      .then((userList) => setModalUserList(userList));
    setUserModalVerb("Reposted");
    toggleUserModal();
  };

  const renderStatusString = () => {
    if (repost.users_who_reposted.length > 2) {
      return (
        <p className="m-3">
          <Link onClick={showModal} to="#">{`${
            repost.users_who_reposted[0].username
          } and ${repost.users_who_reposted.length - 1} others reposted`}</Link>
        </p>
      );
    }

    return (
      <p className="m-3">
        <HighlightedContent
          content={statusString}
          userList={repost.users_who_reposted}
        />
      </p>
    );
  };
  return (
    <>
      {renderStatusString()}
      <Post post={repost.post} removePostFromParentList={removeItem} />
    </>
  );
});
export default Repost;
