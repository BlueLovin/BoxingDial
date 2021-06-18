import React, { useState } from "react";
import { Button, Modal, ModalHeader, ModalBody } from "reactstrap";
import TextareaAutosize from "react-textarea-autosize";

export default function PostModal(props) {
  const { toggle, onSave } = props;
  const [activeItem, setActiveItem] = useState(props.activeItem);
  const handleChange = (e) => {
    let { name, value } = e.target;

    const item = { ...activeItem, [name]: value };
    setActiveItem(item);
  };

  return (
    <Modal isOpen={true} toggle={toggle}>
      <ModalHeader toggle={toggle}>Create Post</ModalHeader>
      <TextareaAutosize
        id="content"
        className="m-3 bg-light rounded p-2"
        name="content"
        maxLength={500}
        minRows={3}
        value={activeItem.content}
        onChange={handleChange}
        placeholder="Share your unbiased thoughts"
        autoFocus
      />
      <ModalBody className="text-right p-3">
        <Button color="primary" onClick={() => onSave(activeItem)}>
          Post
        </Button>
      </ModalBody>
    </Modal>
  );
}
