import React, { useState, useEffect } from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import axios from "axios";
import Home from "./components/Home";
import Comments from "./components/posts/PostPage"
import Login from "./components/accounts/Login"
import UserProfile from "./components/accounts/UserProfile"
import ShowUser from "./components/ShowUser"
import FightPage from "./components/fights/FightPage"
import { UserContext } from "./UserContext"
import Register from "./components/accounts/Register"
import NavigationBar from "./components/NavBar";

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    setToken(localStorage.getItem('token'));
    const fetchUser = async () => {
    console.log(token);
    if (token !== '' && token) {
      await axios.get("/api/token-auth/user", {
        headers: {
          "Authorization": `Token ${token}`
        }
      }).then((res) => setUser(res.data))
        .catch(function (error) {
          console.log(error.response.status)
          console.log(error.response.data.error)
        });
    }
  };
  fetchUser();
  }, [token])

  //following function sends request to API server with token from 
  //user's browser storage. the server responds with the user associated
  //with that token or 404s if invalid token
  

  return (
    <BrowserRouter>
      <UserContext.Provider
        value={{
          userVal: [user, setUser],
          tokenVal: [token, setToken]
        }}>
          
        <NavigationBar />

        <Switch>
          <Route path="/" exact>
            <Home />
          </Route>

          <Route path="/post/:id" exact>
            <Comments />
          </Route>

          <Route path="/user/:userID" exact>
            <UserProfile />
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

          <Route path="/fight/:fightID" exact>
            <FightPage />
          </Route>
        </Switch>
      </UserContext.Provider>
    </BrowserRouter>
  );
}

export default App;
