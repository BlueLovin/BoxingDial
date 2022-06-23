import { useContext, useEffect } from "react";
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

  useEffect(() => {
    return () => {
      chatAPI.disconnect();
    };
  // its ok to do this here... or whatever
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatAPI.disconnect]);

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
          {userToContactUsername !== undefined ? (
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
