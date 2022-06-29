import { useContext } from "react";
import { UserContext } from "../../context/UserContext";

export default function ChatMessageBox({ message }) {
  const { userVal } = useContext(UserContext);
  const [user] = userVal;
  const isOwner = message.owner.username === user.username;

  return (
    <div className="MessageBox ">
      <div className="ChatMessage">
        <div className={isOwner ? "RightBubble" : "LeftBubble"}>
          <span className="MsgName">
            {!isOwner && (
              <img
                className="medium-avatar"
                src={message.owner.profile.avatar_url}
                alt="avatar"
              />
            )}
          </span>
          <span className="MsgDate">
            {" "}
            at {new Date(message.created_at).toUTCString()}
          </span>
          <p>{message.content}</p>
        </div>
      </div>
    </div>
  );
}
