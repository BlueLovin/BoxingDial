import React, { useState, useEffect } from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import axios from "axios";
import Home from "./pages/home/HomePage";
import Comments from "./pages/posts/PostPage";
import PopularPosts from "./components/posts/PopularPosts";
import Login from "./components/accounts/Login";
import UserProfile from "./pages/profiles/UserProfile";
import ShowUser from "./components/navbar/ShowUser";
import FightPage from "./pages/fights/FightPage";
import PopularFights from "./components/fights/PopularFights";
import RecentFights from "./components/fights/RecentFights";
import { UserContext } from "./UserContext";
import Register from "./components/accounts/Register";
import NavigationBar from "./components/navbar/NavBar";
import { NotFound } from "./NotFound404";

export default function App() {
  const [user, setUser] = useState(); // set to undefined initially
  const [token, setToken] = useState();
  const [loggedIn, setLoggedIn] = useState(null);
  const [headers, setHeaders] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getTokenAndSetHeaders = async () => {
      let tokenValue = localStorage.getItem("token");
      setToken(tokenValue);

      if (tokenValue !== null && tokenValue !== undefined) {
        const _headers = {
          "content-type": "application/json",
          Authorization: `Token ${tokenValue}`,
        };

        setHeaders({ headers: _headers });
      }
    };
    getTokenAndSetHeaders();
  }, []);

  useEffect(() => {
    const setLoggedInUser = async () => {
      if (token) {
        await axios
          .get("/api/token-auth/user", {
            headers: {
              Authorization: `Token ${token}`,
            },
          })
          .then((res) => {
            setUser(res.data);
            setLoggedIn(true);
          }) //success = set user
          .catch(() => {
            localStorage.removeItem("token");
            setToken(undefined);
            setUser(null);
            setLoggedIn(false);
          }); //failure = set user to null
      } else {
        setUser(null);
        setLoggedIn(false);
      }
    };

    if (token !== undefined) {
      setLoggedInUser();
    }
  }, [token]);

  // SET GLOBAL LOADING STATE
  useEffect(() => {
    if (loggedIn !== null && user !== undefined) {
      setLoading(false);
    }
  }, [loggedIn, user]);

  if (!loading) {
    return (
      <BrowserRouter>
        <UserContext.Provider
          value={{
            userVal: [user, setUser],
            tokenVal: [token, setToken],
            loggedInVal: [loggedIn, setLoggedIn],
            headersVal: [headers, setHeaders],
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
  } else {
    return <div>loading...</div>;
    // spinny/pretty loading module will go here.
  }
}
