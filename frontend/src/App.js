import React, { useState, useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import axios from "axios";
import { UserContext } from "./UserContext";
import NavigationBar from "./components/navbar/NavBar";
import Routes from "./Routes";

export default function App() {
  const [user, setUser] = useState(); // set to undefined initially
  const [token, setToken] = useState();
  const [loggedIn, setLoggedIn] = useState(null);
  const [headers, setHeaders] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getTokenAndSetHeaders = () => {
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
    const setLoggedInUser = () => {
      if (token) {
        axios
          .get("/token-auth/user", {
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

          {/* SWITCH AND ROUTES HERE */}
          <Routes />
        </UserContext.Provider>
      </BrowserRouter>
    );
  } else {
    return <div>loading...</div>;
    // spinny/pretty loading module will go here.
  }
}
