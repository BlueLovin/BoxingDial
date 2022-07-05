import React, { useCallback, useEffect, useState } from "react";
import ScrollToBottom from "react-scroll-to-bottom";
import SmallUser from "../../components/profiles/SmallUser";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom/cjs/react-router-dom.min";
import "../../css/chat.css";
import {
  Col,
  Button,
  Form,
  InputGroup,
  Input,
  InputGroupAddon,
  Spinner,
} from "reactstrap";
import ChatMessageBox from "./ChatMessageBox";
const DMContainer = React.memo(({ selectedUserUsername, chatAPI }) => {
  const [loading, setLoading] = useState(true);
  const [userToContact, setUserToContact] = useState();
  const [newChatMessage, setNewChatMessage] = useState({
    content: "",
  });

  useEffect(() => {
    if (userToContact !== undefined) {
      chatAPI.initChatWithUser(userToContact).then(() => {
        setLoading(false);
      });
    }

    // please forgive me for this...
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, userToContact]);

  useEffect(() => {
    setUserToContact(selectedUserUsername);
  }, [selectedUserUsername]);

  useEffect(() => setLoading(true), [selectedUserUsername]);

  const onChange = (e) => {
    e.persist();
    setNewChatMessage({ ...newChatMessage, [e.target.name]: e.target.value });
  };

  const submitMessage = useCallback((e) => {
    e.preventDefault();
    setNewChatMessage({ content: "" });
    if (newChatMessage.content.replaceAll(" ", "") === "") {
      return;
    }
    chatAPI.sendChat(newChatMessage.content);
  }, [chatAPI, newChatMessage.content]);

  if (loading) {
    return <Spinner />;
  }

  return (
    <Col xs="8" className="dm-wrapper">
      <div className="m-2 d-flex ">
        <div className="dm-back-button">
          <Link to="/chat">
            <FontAwesomeIcon className="m-4" icon={faArrowLeft} />
          </Link>
        </div>
        {chatAPI.selectedUser !== undefined ? (
          <SmallUser
            user={chatAPI.selectedUser}
            bioText=""
            showBackground={false}
          />
        ) : (
          <Spinner />
        )}
      </div>
      <ScrollToBottom className="dm-container">
        {chatAPI.chats.map((message, idx) => (
          <ChatMessageBox message={message} id={idx} key={idx}/>
        ))}
      </ScrollToBottom>
      <footer className="p-2">
        <Form className="MessageForm" onSubmit={submitMessage}>
          <InputGroup>
            <Input
              type="text"
              name="content"
              id="content"
              placeholder="Enter message here"
              value={newChatMessage.content}
              onChange={onChange}
            />
            <InputGroupAddon addonType="append">
              <Button variant="primary" type="submit">
                Send
              </Button>
            </InputGroupAddon>
          </InputGroup>
        </Form>
      </footer>
    </Col>
  );
});

export default DMContainer;
