import { useContext, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { Container, Row, Col } from "reactstrap";
import DMContainer from "../../components/chat/DMContainer";
import Conversations from "./Conversations";
import { UserContext } from "../../context/UserContext";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import useChat from "../../hooks/useChat";

export default function ChatRoom() {
  const { loggedInVal } = useContext(UserContext);
  const [loggedIn] = loggedInVal;
  const history = useHistory();
  const { userToContactUsername } = useParams();
  const chatAPI = useChat();
  const isMounted = useRef(false);
  const userSelected = userToContactUsername !== undefined;

  useEffect(() => {
    if (!isMounted.current) {
      chatAPI.initSocketConnection();
      isMounted.current = true;
    }
  }, [chatAPI]);

  useEffect(() => {
    if (!userSelected) {
      chatAPI.setSelectedUser({});
    }
  });

  useEffect(() => {
    return () => {
      chatAPI.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!loggedIn) {
    history.push("/login");
  }

  return (
    <div className="Container">
      <Container>
        <Row>
          <Col xs="4" className="users-container">
            <Conversations
              chatAPI={chatAPI}
              selectedUser={userToContactUsername}
            />
          </Col>
          {userSelected ? (
            <DMContainer
              chatAPI={chatAPI}
              selectedUserUsername={userToContactUsername}
            />
          ) : (
            <h3 className="text-center">Pick a Conversation</h3>
          )}
        </Row>
      </Container>
    </div>
  );
}
