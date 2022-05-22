import React, { useContext, useEffect } from "react";
import { Link } from "react-router-dom/cjs/react-router-dom.min";
import { Card, CardBody } from "reactstrap";
import { UserContext } from "../../context/UserContext";
import SmallUser from "../../components/profiles/SmallUser";

const Conversations = ({ chatAPI, selectedUser = "", fullPage = false }) => {
  const { userVal } = useContext(UserContext);

  const [user] = userVal;

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
    return output;
  };

  const getLastReceivedMessage = (conversation) => {
    if (conversation.last_received_message !== null) {
      const lastReceivedMessage = conversation.last_received_message;
      return `${lastReceivedMessage.owner.username}: ${lastReceivedMessage.content}`;
    }
    return "";
  };

  return (
    <div className="d-flex flex-row align-items-center">
      <div className="col-center w-100">
        {chatAPI.conversations &&
          Object.values(chatAPI.conversations).map((conversation) => {
            const conversationUser =
              getContactedUserFromConversation(conversation);
            const selected = conversationUser.username === selectedUser;
            return (
              <Card
                id={conversation.id}
                key={conversation.id}
                className="UsersCard"
              >
                <CardBody>
                  <Link to={`/chat/${conversationUser.username}`}>
                    <SmallUser
                      user={conversationUser}
                      selected={selected}
                      bioText={getLastReceivedMessage(conversation)}
                    />
                  </Link>
                </CardBody>
              </Card>
            );
          })}
      </div>
      {fullPage ? (
        <h3 className="users-container text-center w-100">
          select a conversation
        </h3>
      ) : null}
    </div>
  );
};
export default Conversations;
