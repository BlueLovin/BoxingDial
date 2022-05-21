//TODO: add user conversations on the side
import React, { useContext, useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardSubtitle,
  Button,
  Form,
  InputGroup,
  Input,
  InputGroupAddon,
} from "reactstrap";
import useChat from "../../hooks/useChat";
import Conversations from "./Conversations";
import "../../css/chat.css";
import { UserContext } from "../../context/UserContext";
import ScrollToBottom from "react-scroll-to-bottom";
import SmallUser from "../../components/profiles/SmallUser";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom/cjs/react-router-dom.min";
export default function ChatRoom() {
  const [newChatMessage, setNewChatMessage] = useState({
    content: "",
  });
  const { userVal } = useContext(UserContext);
  const [user] = userVal;
  const history = useHistory();
  const { userToContactUsername } = useParams();
  const { newChat, initChatWithUser, chats, contactingUser } = useChat(
    userToContactUsername
  );

  useEffect(() => {
    initChatWithUser(userToContactUsername);
  }, [initChatWithUser, userToContactUsername]);

  const onChange = (e) => {
    e.persist();
    setNewChatMessage({ ...newChatMessage, [e.target.name]: e.target.value });
  };

  const submitMessage = (e) => {
    e.preventDefault();
    newChat(newChatMessage.content);
    setNewChatMessage({ roomname: "", content: "", date: "", type: "" });
  };

  const exitChat = () => {
    history.push("/");
  };

  return (
    <div className="Container">
      <Container>
        <Row>
          <Col xs="4" className="users-container">
            <Conversations />
          </Col>
          <Col xs="8" className="dm-wrapper">
            <div className="m-2 d-flex ">
              <div className="dm-back-button">
                <Link to="/chat">
                  <FontAwesomeIcon className="m-4" icon={faArrowLeft} />
                </Link>
              </div>
              {contactingUser !== undefined ? (
                <SmallUser user={contactingUser} />
              ) : (
                "loading"
              )}
            </div>
            <ScrollToBottom className="dm-container">
              {chats.map((item, idx) => (
                <div key={idx} className="MessageBox">
                  <div className="ChatMessage">
                    <div
                      className={
                        item.owner.username === user.username
                          ? "RightBubble"
                          : "LeftBubble"
                      }
                    >
                      <span className="MsgName">{item.owner.username}</span>
                      <span className="MsgDate"> at {item.created_at}</span>
                      <p>{item.content}</p>
                    </div>
                  </div>
                </div>
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
        </Row>
      </Container>
    </div>
  );
}
