import React, { useContext, useEffect, useState } from "react";
import ScrollToBottom from "react-scroll-to-bottom";
import SmallUser from "../../components/profiles/SmallUser";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom/cjs/react-router-dom.min";
import { UserContext } from "../../context/UserContext";
import useChat from "../../hooks/useChat";
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
export default function DMContainer({
  userToContactUsername,
  setLastMessageSentOrReceived,
}) {
  const { userVal } = useContext(UserContext);
  const [user] = userVal;
  const [loading, setLoading] = useState(true);
  const [newChatMessage, setNewChatMessage] = useState({
    content: "",
  });
  const { newChat, initChatWithUser, chats, contactingUser } = useChat(
    userToContactUsername
  );

  useEffect(() => {
    if (initChatWithUser !== undefined) {
      initChatWithUser(userToContactUsername).then(() => setLoading(false));
    }
  }, [initChatWithUser, userToContactUsername]);

  useEffect(() => setLoading(true), [userToContactUsername]);
  useEffect(() => {
    setLastMessageSentOrReceived(chats);
  }, [chats, setLastMessageSentOrReceived]);
  
  const onChange = (e) => {
    e.persist();
    setNewChatMessage({ ...newChatMessage, [e.target.name]: e.target.value });
  };

  const submitMessage = (e) => {
    e.preventDefault();
    setNewChatMessage({ content: "" });
    if (newChatMessage.content.trim() === "") {
      return;
    }
    newChat(newChatMessage.content);
  };

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
        {contactingUser !== undefined ? (
          <SmallUser user={contactingUser} bioText="" showBackground={false} />
        ) : (
          <Spinner />
        )}
      </div>
      <ScrollToBottom className="dm-container">
        {chats.map((item, idx) => {
          const isOwner = item.owner.username === user.username;
          return (
            <div key={idx} className="MessageBox ">
              {/* {!isOwner && (
                <img
                  className="medium-avatar"
                  src={item.owner.profile.avatar_url}
                  alt="avatar"
                />
              )} */}
              <div className="ChatMessage">
                <div className={isOwner ? "RightBubble" : "LeftBubble"}>
                  <span className="MsgName">
                    {!isOwner && (
                      <img
                        className="medium-avatar"
                        src={item.owner.profile.avatar_url}
                        alt="avatar"
                      />
                    )}
                  </span>
                  <span className="MsgDate"> at {item.created_at}</span>
                  <p>{item.content}</p>
                </div>
              </div>
            </div>
          );
        })}
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
}
