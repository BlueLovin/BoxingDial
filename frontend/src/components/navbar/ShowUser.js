import { useContext } from "react";
import axios from "axios";
import { NavbarBrand } from "reactstrap";
import { NavLink } from "react-router-dom";
import { UserContext } from "../../UserContext";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";

export default function ShowUser() {
  const { userVal, tokenVal } = useContext(UserContext);
  const [token] = tokenVal;
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
      .then(
        history.push("/") // go to home page
      )
      .catch(function (error) {
        console.log(error.response.status); // 401
        console.log(error.response.data.error);
      });
    localStorage.removeItem("token");
  };

  const renderUsername = () => {
    if (user) {
      return (
        <div>
          <NavbarBrand>
            Welcome, <a href={"/user/" + user.username}>{user.username}</a>!
          </NavbarBrand>
          <NavLink onClick={() => Logout()} to="/">
            Logout
          </NavLink>
        </div>
      );
    } else {
      return (
        <div>
          <NavLink to="/login/">Login</NavLink>
        </div>
      );
    }
  };

  return <div className="text-center">{renderUsername()}</div>;
}
