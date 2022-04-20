import { useCallback, useState } from "react";

export default function useUserListModalContext() {
  const [showUserModal, setShowUserModal] = useState(false);
  const [modalUserList, setModalUserList] = useState([]);
  const [userModalVerb, setUserModalVerb] = useState("");
  const toggleUserModal = useCallback(() => {
    setShowUserModal(!showUserModal);
  }, [showUserModal]);

  return {
    userModalContext: {
      toggleUserModal: toggleUserModal,
      userListVal: [modalUserList, setModalUserList],
      userModalVerbVal: [userModalVerb, setUserModalVerb],
      showModal: showUserModal,
    },
  };
}
