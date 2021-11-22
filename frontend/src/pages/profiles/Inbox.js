import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { Redirect } from "react-router-dom/cjs/react-router-dom.min";
import Notification from "../../components/inbox/Notification";
import { UserContext } from "../../UserContext";

export default function Inbox(){
  const {loggedInVal, headersVal} = useContext(UserContext);
  const [loggedIn] = loggedInVal;
  const [headers] = headersVal;

  const [notificationList, setNotificationList] = useState();
  
  useEffect(() => {
    if(loggedIn){
      axios.get("/api/inbox", headers)
      .then((res) => {
        setNotificationList(res.data);
        console.log(res.data);
      });
    }
    else{
      return <Redirect to='/404' />
    }
  }, [loggedIn, headers]);

  


  const showNotifications = () => {
    console.table(notificationList)
    return notificationList.map((notification) => (
      <div>
        <Notification notification={notification}/>
      </div>
    ));
  }

  return(
      <>
        <h3 className="text-center">Inbox</h3>
        {loggedIn && notificationList ? showNotifications() : null}
      </>
  );
}