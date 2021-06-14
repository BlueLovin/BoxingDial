import { useContext } from "react";
import axios from "axios";
import { NavbarBrand } from "reactstrap";
import { Link, NavLink } from "react-router-dom";
import { UserContext } from "../../UserContext";

export default function ShowUser() {
  const { userVal, tokenVal } = useContext(UserContext);
  const [token] = tokenVal;
  const [user, setUser] = userVal;

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
        window.location.reload() // reload page
      )
      .catch(function (error) {
        console.log(error.response.status); // 401
        console.log(error.response.data.error); //Please Authenticate or whatever returned from server
      });
    localStorage.removeItem("token");
  };

  const renderUsername = () => {
    if (user) {
      return (
        <div>
          <NavbarBrand>
            Welcome, <Link to={"/user/" + user.id}>{user.username}</Link>!
          </NavbarBrand>
          <NavLink onClick={() => Logout()} to="/">
            Logout
          </NavLink>
        </div>
      );
    } else {
      return (
        <div>
          <NavLink to="/login">Login</NavLink>
        </div>
      );
    }
  };

  return <div className="text-center">{renderUsername()}</div>;
}
