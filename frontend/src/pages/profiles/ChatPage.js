//TODO: add user conversations on the side
import React, { useState, useEffect, useContext } from "react";
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
import { UserContext } from "../../context/UserContext";
import WebSocketService from "../../services/WebSocketService";

function ChatRoom() {
  const { tokenVal } = useContext(UserContext);
  const [token] = tokenVal;
  const [chats, setChats] = useState([]);
  const [users, ] = useState([]);
  const [newchat, setNewchat] = useState({
    message: "",
  });
  const history = useHistory();
  const { userToContact } = useParams();
  const [WebSocketInstance, setWebSocketInstance] = useState(null);

  useEffect(() => {
    if (WebSocketInstance !== null && token !== null) {
      WebSocketInstance.connect();
      WebSocketInstance.addCallbacks(
        (messages) => {
          setChats(messages);
          console.log(messages["messages"]);
        },
        (message) => setChats((c) => [...c, message])
      );
    } else {
      const instance = WebSocketService.getInstance(
        `Token ${token}`,
        userToContact
      );
      setWebSocketInstance(instance);
    }
  }, [WebSocketInstance, userToContact, token]);

  useEffect(() => {
    if (WebSocketInstance != null) {
      WebSocketInstance.waitForSocketConnection(() =>
        WebSocketInstance.fetchMessages()
      );
    }
  }, [WebSocketInstance]);

  const submitMessage = (e) => {
    e.preventDefault();
    WebSocketInstance.newChatMessage(newchat.message);
    setNewchat({ roomname: "", message: "", date: "", type: "" });
  };

  const onChange = (e) => {
    e.persist();
    setNewchat({ ...newchat, [e.target.name]: e.target.value });
  };

  const exitChat = () => {
    history.push("/");
  };

  return (
    <div className="Container">
      <Container>
        <Row>
          <Col xs="4">
            <div>
              <Card className="UsersCard">
                <CardBody>
                  <CardSubtitle>
                    <Button
                      variant="primary"
                      type="button"
                      onClick={() => {
                        exitChat();
                      }}
                    >
                      Exit Chat
                    </Button>
                  </CardSubtitle>
                </CardBody>
              </Card>
              {users.map((item, idx) => (
                <Card key={idx} className="UsersCard">
                  <CardBody>
                    <CardSubtitle>{item.username}</CardSubtitle>
                  </CardBody>
                </Card>
              ))}
            </div>
          </Col>
          <Col xs="8">
            {chats.map((item, idx) => (
              <div key={idx} className="MessageBox">
                <div className="ChatMessage">
                  <div>
                    <span className="MsgName">{item.owner.username}</span>
                    <span className="MsgDate"> at {item.created_at}</span>
                    <p>{item.content}</p>
                  </div>
                </div>
              </div>
            ))}
            <footer className="StickyFooter">
              <Form className="MessageForm" onSubmit={submitMessage}>
                <InputGroup>
                  <Input
                    type="text"
                    name="message"
                    id="message"
                    placeholder="Enter message here"
                    value={newchat.message}
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

export default ChatRoom;
