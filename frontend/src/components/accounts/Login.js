import React, { useState, useContext, useEffect } from "react";
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
  const [error, setError] = useState(false);
  const history = useHistory();
  const { userVal, tokenVal } = useContext(UserContext);
  const [user, setUser] = userVal;
  const [token, setToken] = tokenVal;

  useEffect(() => {
    if (user) {
      history.goBack();
    }
  }, [history, user]);

  const fetchUser = async () => {
    // fetch user and set user state
    await axios
      .get("/api/token-auth/user", {
        headers: {
          Authorization: `Token ${token}`,
        },
      })
      .then((res) => setUser(res.data)) //success = set user with response
      .catch(() => setUser(null)); //failure = set user to null
    };

  // useEffect(()=>{
    
  //   fetchUser();
  // }, [token, setUser])

  const handleChange = (e) => {
    let { name, value } = e.target;

    const item = {
      ...activeItem,
      [name]: value.trim(),
    };

    setActiveItem(item);
  };

  const submitUser = async (item) => {
    // create user object
    await axios
      .post("/api/token-auth/login", item)
      .then((res) => {
        setToken(res.data.token);
        localStorage.removeItem("token");
        localStorage.setItem("token", res.data.token);
        if (error) {
          setError(false);
        }
        history.goBack();
        fetchUser();
      })
      .catch((res) => setError(true));

    setActiveItem({
      // RESET TEXT BOX
      username: "",
      password: "",
    });
  };

  return (
    <div className="mx-auto text-center container login-container">
      <div className="card card-body mt-5">
        <h2 className="font-weight-bold">Login</h2>
        <div className="form-group text-center">
          <br />
          <input
            type="text"
            className={error ? "form-control border-danger" : "form-control"}
            name="username"
            placeholder="Username"
            onChange={handleChange}
            onFocus={() => setError(false)}
            autoFocus={true}
            autoComplete="off"
            value={activeItem.username}
          />
        </div>
        <div className="form-group text-center">
          <input
            type="password"
            className={error ? "form-control border-danger" : "form-control"}
            name="password"
            placeholder="Password"
            onChange={handleChange}
            onFocus={() => setError(false)}
            value={activeItem.password}
          />
          {error ? (
            <>
              <br />
              <h6 className="text-danger">Invalid username or password</h6>
            </>
          ) : null}
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
