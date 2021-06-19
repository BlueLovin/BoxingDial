import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Button } from "reactstrap";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import { UserContext } from "../../UserContext";

export default function Login() {
  const [activeItem, setActiveItem] = useState({
    username: "",
    password: "",
  });
  const history = useHistory();
  const { userVal, tokenVal } = useContext(UserContext);
  const [, setUser] = userVal;
  const [, setToken] = tokenVal;

  const handleChange = (e) => {
    let { name, value } = e.target;

    const item = {
      ...activeItem,
      [name]: value.trim(),
    };

    setActiveItem(item);
  };

  const submitUser = async (item) => {
    await axios // create
      .post("/api/token-auth/login", item)
      .then((res) => {
        localStorage.setItem("token", res.data.token);
        setUser(res.data.user);
      })
      .catch((res) => alert(res));

    setActiveItem({
      // RESET TEXT BOX
      username: "",
      password: "",
    });
    setToken(localStorage.getItem("token"));

    history.push("/");
  };

  return (
    <div className="mx-auto text-center container login-container">
      <div className="card card-body mt-5">
        <h2 className="font-weight-bold">Login</h2>
        <div className="form-group text-center">
          <br />
          <input
            type="text"
            className="form-control"
            name="username"
            placeholder="Username"
            onChange={handleChange}
            value={activeItem.username}
          />
        </div>
        <div className="form-group text-center">
          <input
            type="password"
            className="form-control"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            value={activeItem.password}
          />
        </div>
        <div className="form-group text-center">
          <Button color="success" onClick={() => submitUser(activeItem)}>
            Login
          </Button>
        </div>
        <p>
          Don't have an account?
          <Link to="/register"> Register</Link>
        </p>
      </div>
    </div>
  );
}
