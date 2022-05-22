import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Container, Row, Col } from "reactstrap";
import DMContainer from "../../components/chat/DMContainer";
import Conversations from "./Conversations";
import axios from "axios";
import { UserContext } from "../../context/UserContext";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";

export default function ChatRoom() {
  const { headersVal, loggedInVal } = useContext(UserContext);
  const [headers] = headersVal;
  const [loggedIn] = loggedInVal;
  const history = useHistory();
  const { userToContactUsername } = useParams();
  const [conversations, setConversations] = useState();
  const [lastMessageSentOrReceived, setLastMessageSentOrReceived] = useState();

  if (!loggedIn) {
    history.push("/login");
  }

  useEffect(() => {
    const fetchConversations = () => {
      axios
        .get("/user/conversations", headers)
        .then((res) => setConversations(res.data));
    };
    fetchConversations();
  }, [headers, lastMessageSentOrReceived]);

  return (
    <div className="Container">
      <Container>
        <Row>
          <Col xs="4" className="users-container">
            <Conversations
              conversations={conversations}
              selectedUser={userToContactUsername}
            />
          </Col>
          {userToContactUsername !== undefined ? (
            <DMContainer
              userToContactUsername={userToContactUsername}
              setLastMessageSentOrReceived={setLastMessageSentOrReceived}
            />
          ) : (
            <h3 className="text-center">Pick a Conversation</h3>
          )}
        </Row>
      </Container>
    </div>
  );
}
