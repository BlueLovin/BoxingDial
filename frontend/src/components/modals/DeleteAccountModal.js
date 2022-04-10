import React from "react";
import { Button, Modal, ModalHeader, ModalBody } from "reactstrap";

const DeleteAccountModal = React.memo((props) => {
  let { toggle, onSave, password, setPassword, error } = props;

  const handleChange = (e) => setPassword(e.target.value.trim());
  
  return (
    <Modal isOpen={true} toggle={toggle} autoFocus={false}>
      <ModalHeader toggle={toggle}>Delete Account</ModalHeader>
      <ModalBody className="text-right p-3">
        <div className="d-flex justify-content-around align-items-center">
          <label>Type your password to confirm:</label>
          <input
            autoFocus={true}
            className="m-3"
            value={password}
            type="password"
            onChange={handleChange}
          />
        </div>
        <Button color="danger" onClick={() => onSave()}>
          DELETE
        </Button>
        <p className="text-center text-danger">{error}</p>
      </ModalBody>
    </Modal>
  );
});

export default DeleteAccountModal;
