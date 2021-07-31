import { useContext } from "react";
import axios from "axios";
import { NavLink } from "react-router-dom";
import { UserContext } from "../../UserContext";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";

export default function ShowUser() {
  const { userVal, tokenVal } = useContext(UserContext);
  const [token, setToken] = tokenVal;
  const [user, setUser] = userVal;
  const history = useHistory();

  const Logout = async () => {
    setUser(null);
    axios
      .post(
        "api/token-auth/logout",
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
          Welcome, <a href={"/user/" + user.username}>{user.username}</a>
          {"! "}
          <NavLink onClick={() => Logout()} to="/">
            Logout
          </NavLink>
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
