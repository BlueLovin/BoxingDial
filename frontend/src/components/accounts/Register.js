import React, { useContext, useState, useEffect } from "react";
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
    confirmation_password: "",
  });
  const { userVal, tokenVal, loggedInVal } = useContext(UserContext);
  const [error, setError] = useState(false);
  const [errorMessages, setErrorMessages] = useState([]);
  const [, setUser] = userVal;
  const [, setToken] = tokenVal;
  const [loggedIn] = loggedInVal;

  const history = useHistory();

  useEffect(() => {
    if (loggedIn) {
      history.push("/");
      window.location.reload();
    }
  }, [history, loggedIn]);

  const handleChange = (e) => {
    let { name, value } = e.target;

    setActiveItem((oldItem) => ({ ...oldItem, [name]: value }));
  };

  const submitUser = (item) => {
    setError(false);

    // password and confirmation password must match
    if (item.confirmation_password !== item.password) {
      setError(true);
      setErrorMessages(["Passwords do not match"]);
      return;
    }

    axios
      .post("/token-auth/register", item)
      .then((res) => {
        setError(false);
        setUser(res.data.user);
        setToken(res.data.token);
        localStorage.setItem("token", res.data.token);
      })
      .catch((err) => {
        setErrorMessages([]);
        let data = err.response.data;
        if (data.username) {
          setErrorMessages((oldArray) => [
            ...oldArray,
            "username: " + data.username[0],
          ]);
        } else if (data.password) {
          setErrorMessages((oldArray) => [...oldArray, "Invalid password"]);
        } else if (data.email) {
          setErrorMessages((oldArray) => [
            ...oldArray,
            "Invalid e-mail address",
          ]);
        } else if (data.errors) {
          setErrorMessages((oldArray) => oldArray.concat(data.errors));
        } else {
          setErrorMessages(["Unknown error has occured."]);
        }
        setError(true);
      });
  };

  const renderErrors = () => {
    if (error && errorMessages) {
      return errorMessages.map((_error, i) => (
        <div key={i}>
          <h6 className="text-danger">{_error}</h6>
          <hr />
        </div>
      ));
    }
    return null;
  };

  return (
    <div className="container login-container">
      <div className="card card-body mt-5">
        <h2 className="text-center">Register</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submitUser(activeItem);
          }}
        >
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              className="form-control"
              name="username"
              onChange={handleChange}
              value={activeItem.username}
              autoFocus={true}
              autoComplete="off"
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
              name="confirmation_password"
              onChange={handleChange}
              value={activeItem.confirmation_password}
              required
            />
          </div>
          {error ? renderErrors() : null}
          <div className="form-group">
            <Button color="success" type="submit">
              Register
            </Button>
          </div>
        </form>

        <p>
          Already have an account?
          <Link to="/login"> Login</Link>
        </p>
      </div>
    </div>
  );
}
