import React, { useState, useEffect } from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import axios from "axios";
import Home from "./components/HomePage";
import Comments from "./components/posts/PostPage";
import PopularPosts from "./components/posts/PopularPosts";
import Login from "./components/accounts/Login";
import UserProfile from "./components/accounts/UserProfile";
import ShowUser from "./components/navbar/ShowUser";
import FightPage from "./components/fights/FightPage";
import PopularFights from "./components/fights/PopularFights";
import RecentFights from "./components/fights/RecentFights";
import { UserContext } from "./UserContext";
import Register from "./components/accounts/Register";
import NavigationBar from "./components/navbar/NavBar";
import { NotFound } from "./NotFound404";

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    setToken(localStorage.getItem("token"));

    //following function sends request to API server with token from
    //user's browser storage. the server responds with the user associated
    //with that token or 404s if invalid token
    const fetchUser = async () => {
      if (token !== "" && token) {
        await axios
          .get("/api/token-auth/user", {
            headers: {
              Authorization: `Token ${token}`,
            },
          })
          .then((res) => setUser(res.data)) //success = set user with response
          .catch(() => setUser(null)); //failure = set user to null
      }
    };
    fetchUser();
  }, [token]);

  return (
    <BrowserRouter>
      <UserContext.Provider
        value={{
          userVal: [user, setUser],
          tokenVal: [token, setToken],
        }}
      >
        <NavigationBar />

        <Switch>
          <Route path="/" exact>
            <Home />
          </Route>

          <Route path="/post/:id" exact>
            <Comments />
          </Route>

          <Route path="/posts/popular" exact>
            <PopularPosts />
          </Route>

          <Route path="/user/:username" exact>
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

          <Route path="/fights/popular" exact>
            <PopularFights />
          </Route>

          <Route path="/fights/recent" exact>
            <RecentFights />
          </Route>

          <Route component={NotFound} />
        </Switch>
      </UserContext.Provider>
    </BrowserRouter>
  );
}

export default App;
