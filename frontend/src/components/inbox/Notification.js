import { Button, Container } from "reactstrap";
import axios from "axios";
import { useContext } from "react";
import { UserContext } from "../../UserContext";
import { useHistory } from "react-router";

export default function Notification(props) {
  const { text, date, is_read, post_id, sender } = props.notification;
  const this_notification = props.notification;

  const { loggedInVal, headersVal } = useContext(UserContext);
  const [loggedIn] = loggedInVal;
  const [headers] = headersVal;

  const history = useHistory();

  const markAsRead = async () => {
    if (is_read === false && loggedIn) {
      await axios.post(`/api/inbox/${this_notification.id}/read`, {}, headers);
    }
  };

  const goToPostOrUser = async () => {
    await markAsRead();
    // post_id is -1 if there is no post attached
    // takes you to the sender's profile instead
    if (post_id == -1) {
      history.push(`/user/${sender}`);
    } else {
      history.push(`/post/${post_id}`);
    }
    window.location.reload();
  };

  const deleteNotification = async () => {
    if (loggedIn) {
      await axios.post(
        `/api/inbox/${this_notification.id}/delete`,
        {},
        headers
      );
      window.location.reload();
    }
  };

  return (
    <Container>
      <div className="list-group-item bg-light justify-content-center preserve-line-breaks ">
        <div className={is_read ? null : "bg-warning"}>
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
