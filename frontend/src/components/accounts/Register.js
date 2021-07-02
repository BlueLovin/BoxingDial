import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Button } from "reactstrap";
import { UserContext } from "../../UserContext";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";

export default function Register() {
  const [activeItem, setActiveItem] = useState({
    username: "",
    email: "",
    password: "",
  });
  const { userVal, tokenVal } = useContext(UserContext);
  const [error, setError] = useState(false);
  const [errorMessages, setErrorMessages] = useState([]);
  const [, setUser] = userVal;
  const [, setToken] = tokenVal;
  const history = useHistory();

  const handleChange = (e) => {
    // this.setState({ [e.target.name]: e.target.value });
    let { name, value } = e.target;

    const item = {
      ...activeItem,
      [name]: value,
    };

    setActiveItem(item);
  };

  const submitUser = async (item) => {
    await axios
      .post("/api/token-auth/register", item)
      .then((res) => {
        setError(false);
        setToken(res.data.token);
        localStorage.removeItem("token");
        localStorage.setItem("token", res.data.token);
        setUser(res.data.user);
        history.goBack();
      })
      .catch((err) => {
        setErrorMessages([]);
        let data = err.response.data;
        if (data.username[0] === "This field may not be blank") {
          setErrorMessages((oldArray) => [
            ...oldArray,
            "Username can not be blank",
          ]);
        }
        if (data.username[0] === "A user with that username already exists.") {
          setErrorMessages((oldArray) => [...oldArray, data.username[0]]);
        }

        if (data.password) {
          setErrorMessages((oldArray) => [
            ...oldArray,
            "Password can not be blank",
          ]);
        }

        if (data.email) {
          setErrorMessages((oldArray) => [
            ...oldArray,
            "Invalid e-mail address",
          ]);
        }

        setError(true);
      });

    setActiveItem({
      // RESET TEXT BOX
      username: "",
      email: "",
      password: "",
    });
  };

  const renderErrors = () => {
    if (error && errorMessages) {
      return errorMessages.map((error) => (
        <>
          <br />
          <h6 className="text-danger">{error}</h6>
        </>
      ));
    }
    return null;
  };

  return (
    <div className="container login-container">
      <div className="card card-body mt-5">
        <h2 className="text-center">Register</h2>
        <div className="form-group">
          <label>Username</label>
          <input
            type="text"
            className="form-control"
            name="username"
            onChange={handleChange}
            value={activeItem.username}
            required
          />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            className="form-control"
            name="email"
            onChange={handleChange}
            value={activeItem.email}
            required
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            className="form-control"
            name="password"
            onChange={handleChange}
            value={activeItem.password}
            required
          />
        </div>
        <div className="form-group">
          <label>Confirm Password</label>
          <input
            type="password"
            className="form-control"
            name="confirmationPassword"
            onChange={handleChange}
            required
          />
        </div>
        {error ? renderErrors() : null}
        <div className="form-group">
          <Button color="success" onClick={() => submitUser(activeItem)}>
            Register
          </Button>
        </div>
        <p>
          Already have an account?
          <Link to="/login"> Login</Link>
        </p>
      </div>
    </div>
  );
}
