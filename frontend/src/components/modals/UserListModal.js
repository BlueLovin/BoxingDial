import { useContext } from "react";
import { Modal, ModalHeader, ModalBody } from "reactstrap";
import SmallUser from "../profiles/SmallUser";
import { ModalContext } from "../../context/ModalContext";

export default function UserListModal() {
  const { toggleUserModal, userListVal, userModalVerbVal, showModal } =
    useContext(ModalContext);
  const [modalUserList] = userListVal;
  const [userModalVerb] = userModalVerbVal;
  const renderReposts = () => {
    if (modalUserList.length !== 0) {
      return modalUserList.map((user) => (
        <SmallUser user={user} toggleUserModal={toggleUserModal} />
      ));
    }
    return "nothing to see here. . . ";
  };

  return (
    <Modal isOpen={showModal} toggle={toggleUserModal} autoFocus={false}>
      <ModalHeader toggle={toggleUserModal}>{userModalVerb} by</ModalHeader>
      <ModalBody>{renderReposts()}</ModalBody>
    </Modal>
  );
}
