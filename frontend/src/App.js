import React, { useState, useMemo,  } from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import Home from "./components/Home";
import Comments from "./components/PostPage"
import Login from "./components/accounts/Login"
import ShowUser from "./components/ShowUser"
import {UserContext} from "./UserContext"

import Register from "./components/accounts/Register"
import NavigationBar from "./components/NavBar";

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const value = useMemo(()=>({user, setUser}), [user, setUser]);
  return (
    <BrowserRouter>
    
    <UserContext.Provider value={value}>
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
