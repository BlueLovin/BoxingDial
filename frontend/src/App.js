import React, { useState, useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import axios from "axios";
import { UserContext } from "./context/UserContext";
import NavigationBar from "./components/navbar/NavBar";
import Routes from "./Routes";
import { ModalContext } from "./context/ModalContext";
import UserListModal from "./components/modals/UserListModal";
import useUserListModalContext from "./hooks/useUserListModalContext";

export default function App() {
  const [user, setUser] = useState(); // set to undefined initially
  const [token, setToken] = useState();
  const [loggedIn, setLoggedIn] = useState(null);
  const [headers, setHeaders] = useState(null);
  const [inbox, setInbox] = useState(null);
  const [loading, setLoading] = useState(true);
  const { userModalContext } = useUserListModalContext();

  useEffect(() => {
    const getTokenAndSetHeaders = () => {
      let tokenValue = localStorage.getItem("token");
      setToken(tokenValue);

      if (tokenValue !== null && tokenValue !== undefined) {
        const _headers = {
          "content-type": "application/json",
          Authorization: `Token ${tokenValue}`,
        };

        document.cookie = `Authorization=${tokenValue} ;path=/ `;
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

  useEffect(() => {
    if (loggedIn && headers !== undefined) {
      axios.get("/inbox", headers).then((res) => {
        setInbox(res.data);
      });
    }
  }, [loggedIn, headers]);

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
            inboxVal: [inbox, setInbox],
          }}
        >
          <NavigationBar />

          {/* SWITCH AND ROUTES HERE */}
          <ModalContext.Provider value={userModalContext}>
            <Routes />
            <UserListModal />
          </ModalContext.Provider>
        </UserContext.Provider>
      </BrowserRouter>
    );
  } else {
    return <div>loading...</div>;
    // spinny/pretty loading module will go here.
  }
}
