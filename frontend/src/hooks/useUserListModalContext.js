import { useState } from "react";

export default function useUserListModalContext() {
  const [showUserModal, setShowUserModal] = useState(false);
  const [modalUserList, setModalUserList] = useState([]);
  const [userModalVerb, setUserModalVerb] = useState("");
  const toggleUserModal = () => {
    setShowUserModal(!showUserModal);
    setModalUserList([]);
  };

  return {
    userModalContext: {
      toggleUserModal: toggleUserModal,
      userListVal: [modalUserList, setModalUserList],
      userModalVerbVal: [userModalVerb, setUserModalVerb],
      showModal: showUserModal,
    },
  };
}
