import { useContext } from "react";
import axios from "axios";
import { UserContext } from "../../context/UserContext";
import { Link, useHistory } from "react-router-dom/cjs/react-router-dom.min";
import { faHandPeace } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "reactstrap";

export default function ShowUser() {
  const { userVal, tokenVal, loggedInVal, headersVal } =
    useContext(UserContext);
  const [, setToken] = tokenVal;
  const [user, setUser] = userVal;
  const [loggedIn] = loggedInVal;
  const [headers] = headersVal;
  const history = useHistory();

  const Logout = () => {
    setUser(null);
    axios
      .post("/token-auth/logout", {}, headers)
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

  if (loggedIn && user) {
    return (
      <div className="text-center">
        <span>
          {"Welcome, "}
          <Link to={`/user/${user.username}`}>{user.username}</Link>
          {"! "}
          <br />
          <Button onClick={() => Logout()} to="/">
            <FontAwesomeIcon icon={faHandPeace} />
            {" Logout "}
          </Button>
        </span>
      </div>
    );
  } else {
    return (
      <div>
        <a href="/login/">Login</a>
      </div>
    );
  }
}
