import { useContext } from "react";
import axios from "axios";
import { UserContext } from "../../UserContext";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "reactstrap";

export default function ShowInboxBell() {
  const { userVal, tokenVal, loggedInVal, headersVal } =
    useContext(UserContext);
  const [, setToken] = tokenVal;
  const [user, setUser] = userVal;
  const [loggedIn] = loggedInVal;
  const [headers] = headersVal;
  const history = useHistory();

  const Logout = async () => {
    setUser(null);
    axios
      .post("/api/token-auth/logout", {}, headers)
      .then(() => {
        localStorage.removeItem("token");
        setToken(undefined);
        history.push("/"); // go to home page
        window.location.reload();
      })
      .catch((err) => {
        console.log(err.response.status); // 401
        console.log(err.response.data.error);
      });
    localStorage.removeItem("token");
  };

  const renderBell = () => {
    if (loggedIn) {
      return (
        <span className="p-5">
          <Button  to="/">
            <FontAwesomeIcon icon={faBell} onClick={() => Logout()} />
          </Button>
        </span>
      );
    } else {
      return null;
    }
  };

  return <div className="text-center">{renderBell()}</div>;
}
