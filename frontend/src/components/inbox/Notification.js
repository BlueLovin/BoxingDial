import { Button, Container } from "reactstrap";
import axios from "axios";
import { useContext, useState } from "react";
import { UserContext } from "../../context/UserContext";
import { useHistory } from "react-router";

export default function Notification(props) {
  const { text, date, is_read, post_id, comment_id, sender } =
    props.notification;
  const this_notification = props.notification;

  const { loggedInVal, headersVal } = useContext(UserContext);
  const [read, setRead] = useState(is_read);
  const [loggedIn] = loggedInVal;
  const [headers] = headersVal;

  const history = useHistory();

  const markAsRead = async () => {
    if (read === false && loggedIn) {
      await axios.post(`/inbox/${this_notification.id}/read`, {}, headers);
      setRead(true);
    }
  };

  const goToPostOrUser = async () => {
    await markAsRead();
    // post_id is -1 if there is no post attached
    // takes you to the sender's profile instead
    if (post_id === -1) {
      history.push(`/user/${sender}`);
    }
    // takes you to a post
    else {
      var url = `/post/${post_id}`;

      // if the comment id is not -1, it will take you to the
      // post page and highlight the comment
      if (comment_id !== -1) {
        url += `/${comment_id}`;
      }
      history.push(url);
    }
  };

  const deleteNotification = async () => {
    if (loggedIn) {
      await axios.post(`/inbox/${this_notification.id}/delete`, {}, headers);
      window.location.reload();
    }
  };

  return (
    <Container>
      <div className="list-group-item bg-light justify-content-center preserve-line-breaks ">
        <div className={read ? null : "bg-warning"} onClick={markAsRead}>
          <button className="btn btn-link" onClick={() => goToPostOrUser()}>
            {text}
          </button>
        </div>
        <div className="list-group-item p-auto m-auto d-flex justify-content-between align-items-center">
          <div>{`${new Date(date).toLocaleDateString()} ${new Date(
            date
          ).toLocaleTimeString()}`}</div>
          <Button color="danger" onClick={() => deleteNotification()}>
            Delete
          </Button>
        </div>
      </div>
      <hr />
    </Container>
  );
}
