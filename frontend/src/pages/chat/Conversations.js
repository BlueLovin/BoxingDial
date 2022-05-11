import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom/cjs/react-router-dom.min";
import { Card, CardBody } from "reactstrap";
import { UserContext } from "../../context/UserContext";
import SmallUser from "../../components/profiles/SmallUser";

const Conversations = React.memo(() => {
  const { headersVal, userVal } = useContext(UserContext);
  const [headers] = headersVal;
  const [user] = userVal;
  const [conversations, setConversations] = useState();
  useEffect(() => {
    const fetchConversations = () => {
      axios
        .get("/user/conversations", headers)
        .then((res) => setConversations(res.data));
    };
    fetchConversations();
  }, [headers]);

  const getContactedUserFromConversation = (conversation) => {
    const username = user.username;
    let output = {};

    if (conversation.users.length === 1) {
      return conversation.users[0];
    }

    conversation.users.forEach((_user) => {
      if (username !== _user.username) {
        output = _user;
      }
    });
    console.log(output);
    return output;
  };

  return (
    <>
      {conversations &&
        conversations.map((conversation, idx) => {
          const conversationUser = getContactedUserFromConversation(conversation);
          return (
            <Card key={idx} className="UsersCard">
              <CardBody>
                <Link to={`/chat/${conversationUser.username}`}>
                  <SmallUser user={conversationUser} bioText={conversation.last_received_message}/>
                </Link>
              </CardBody>
            </Card>
          );
        })}
    </>
  );
});

export default Conversations;
