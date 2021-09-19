import { useContext } from "react";
import axios from "axios";
import { UserContext } from "../../UserContext";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import { faHandPeace } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "reactstrap";

export default function ShowUser() {
  const { userVal, tokenVal } = useContext(UserContext);
  const [token, setToken] = tokenVal;
  const [user, setUser] = userVal;
  const history = useHistory();


  const Logout = async () => {
    setUser(null);
    axios
      .post(
        "/api/token-auth/logout",
        {},
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      )
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

  const renderUsername = () => {
    if (user) {
      return (
        <span>
          {"Welcome, "}<a href={`/user/${user.username}`}>{user.username}</a>
          {"! "}
          <br/>
          <Button onClick={() => Logout()} to="/">
          <FontAwesomeIcon icon={faHandPeace}/>
            {" Logout "}
          </Button>
        </span>
      );
    } else {
      return (
        <div>
          <a href="/login/">Login</a>
        </div>
      );
    }
  };

  return <div className="text-center">{renderUsername()}</div>;
}
