import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { Redirect } from "react-router-dom/cjs/react-router-dom.min";
import { Button } from "reactstrap";
import Notification from "../../components/inbox/Notification";
import { UserContext } from "../../UserContext";

export default function Inbox() {
  const { loggedInVal, headersVal } = useContext(UserContext);
  const [loggedIn] = loggedInVal;
  const [headers] = headersVal;

  const [notificationList, setNotificationList] = useState();

  useEffect(() => {
    if (loggedIn) {
      axios.get("/inbox/", headers).then((res) => {
        setNotificationList(res.data);
      });
    } else {
      return <Redirect to="/404" />;
    }
  }, [loggedIn, headers]);

  const deleteAll = async () => {
    if (loggedIn) {
      await axios.post("/inbox/clear", {}, headers);
      window.location.reload();
    }
  };

  const readAll = async () => {
    if (loggedIn) {
      await axios.post("/inbox/read-all", {}, headers);
      window.location.reload();
    }
  };

  const showNotifications = () => {
    console.table(notificationList);
    if (notificationList.length < 1) {
      return <div className="text-center">Nothing to see here...</div>;
    }
    return notificationList.map((notification) => (
      <div>
        <Notification notification={notification} />
      </div>
    ));
  };

  return (
    <>
      <h3 className="text-center">Inbox</h3>
      {notificationList && notificationList.length > 0 ? (
        <div className="p-auto m-auto d-flex justify-content-center align-items-center">
          <span className="p-2">
            <Button size="lg" color="danger" onClick={() => deleteAll()}>
              Clear All Notifications
            </Button>
          </span>

          <span className="p-2">
            <Button size="lg" color="primary" onClick={() => readAll()}>
              Mark All As Read
            </Button>
          </span>
        </div>
      ) : null}

      {loggedIn && notificationList ? showNotifications() : null}
    </>
  );
}
