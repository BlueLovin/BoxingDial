import React, { Component } from "react";
import { Button, Modal, ModalHeader, ModalBody } from "reactstrap";
import TextareaAutosize from "react-textarea-autosize";

export default class CustomModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeItem: this.props.activeItem,
    };
  }

  handleChange = (e) => {
    let { name, value } = e.target;

    if (e.target.type === "checkbox") {
      value = e.target.checked;
    }

    const activeItem = { ...this.state.activeItem, [name]: value };
    this.setState({ activeItem });
  };

  render() {
    const { toggle, onSave } = this.props;

    return (
      <Modal isOpen={true} toggle={toggle}>
        <ModalHeader toggle={toggle}>Create Post</ModalHeader>
        <TextareaAutosize
          id="content"
          className="m-2 bg-light rounded"
          name="content"
          maxLength={500}
          minRows={3}
          value={this.state.activeItem.content}
          onChange={this.handleChange}
          placeholder="Share your unbiased thoughts"
        />
        <ModalBody>
          <Button color="primary" onClick={() => onSave(this.state.activeItem)}>
            Post
          </Button>
        </ModalBody>
      </Modal>
    );
  }
}
