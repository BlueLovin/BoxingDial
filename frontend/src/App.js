import React, { useState, useEffect } from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import axios from "axios";
import Home from "./components/Home";
import Comments from "./components/PostPage"
import Login from "./components/accounts/Login"
import ShowUser from "./components/ShowUser"
import { UserContext } from "./UserContext"

import Register from "./components/accounts/Register"
import NavigationBar from "./components/NavBar";

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(async () => {
    setToken(localStorage.getItem('token'));
    await fetchUser();
  }, [token])

  const fetchUser = async () => {
    console.log(token);
    if (token !== '' && token) {
      await axios.get("api/token-auth/user", {
        headers: {
          "Authorization": `Token ${token}`
        }
      }).then((res) => setUser(res.data))
      .catch(function (error) {
        console.log(error.response.status)
        console.log(error.response.data.error) 
      });
    }
  }
  
  return (
    <BrowserRouter>
      <UserContext.Provider value={{ userVal: [user, setUser], tokenVal: [token, setToken] }}>
        <NavigationBar />
        <Switch>
          <Route path="/" exact>
            <Home />
          </Route>

          <Route path="/post/:id" exact>
            <Comments />
          </Route>

          <Route path="/register" exact>
            <Register />
          </Route>

          <Route path="/login" exact>
            <Login />
          </Route>

          <Route path="/user" exact>
            <ShowUser />
          </Route>
        </Switch>
      </UserContext.Provider>
    </BrowserRouter>
  );
}

export default App;
