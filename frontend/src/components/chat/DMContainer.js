import React, { useContext, useEffect, useState } from "react";
import ScrollToBottom from "react-scroll-to-bottom";
import SmallUser from "../../components/profiles/SmallUser";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom/cjs/react-router-dom.min";
import { UserContext } from "../../context/UserContext";
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
const DMContainer = React.memo(({ selectedUserUsername, chatAPI }) => {
  const { userVal } = useContext(UserContext);
  const [user] = userVal;
  const [loading, setLoading] = useState(true);
  const [userToContact, setUserToContact] = useState();
  const [newChatMessage, setNewChatMessage] = useState({
    content: "",
  });

  useEffect(() => {
    if (loading && userToContact !== undefined) {
      chatAPI
        .initSocketConnection()
        .then(() => chatAPI.initChatWithUser(userToContact))
        .then(() => setLoading(false));
    }
    // god, i am so sorry to do this but i can not find another way
    // to solve this... adding chatApi as a dependency leads to a
    // million different issues.
    //
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

  const submitMessage = (e) => {
    e.preventDefault();
    setNewChatMessage({ content: "" });
    if (newChatMessage.content.trim() === "") {
      return;
    }
    chatAPI.sendChat(newChatMessage.content);
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
        {chatAPI.chats.map((item, idx) => {
          const isOwner = item.owner.username === user.username;
          return (
            <div key={idx} className="MessageBox ">
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
});

export default DMContainer;
