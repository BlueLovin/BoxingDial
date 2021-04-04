import React, { Component } from "react";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Input,
  Label,
} from "reactstrap";

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
        <ModalHeader toggle={toggle}>Post Item</ModalHeader>
        <ModalBody>
          <Form>
            <FormGroup>
              <Label for="post-fight">Fight</Label>
              <Input
                type="text"
                id="post-fight"
                name="fight"
                value={this.state.activeItem.fight}
                onChange={this.handleChange}
                placeholder="Enter Post Fight"
              />
            </FormGroup>
            <FormGroup>
              <Label for="post-content">content</Label>
              <Input
                type="text"
                id="post-content"
                name="content"
                value={this.state.activeItem.content}
                onChange={this.handleChange}
                placeholder="Enter Post content"
              />
            </FormGroup>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button
            color="success"
            onClick={() => onSave(this.state.activeItem)}
          >
            Save
          </Button>
        </ModalFooter>
      </Modal>
    );
  }
}
