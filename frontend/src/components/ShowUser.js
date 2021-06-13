import { useEffect, useContext } from "react";
import axios from "axios";
import { NavbarBrand } from "reactstrap";
import { Link, NavLink } from "react-router-dom";
import { UserContext } from "../UserContext";

export default function ShowUser() {
  const { userVal, tokenVal } = useContext(UserContext);
  const [token, setToken] = tokenVal;
  const [user, setUser] = userVal;

  useEffect(() => {
    // update user
    renderUsername();
  // eslint-disable-next-line react-hooks/exhaustive-deps 
  }, []);

  const getToken = () => {
    setToken(localStorage.getItem("token"));
  };

  const Logout = async () => {
    setUser(null);

    getToken();

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
            Welcome, <Link to={"/user/" + user.id}>{user.username}</Link>!{" "}
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
