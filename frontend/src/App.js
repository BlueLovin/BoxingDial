import React, { Component, useEffect, useState } from "react";
import { BrowserRouter, Link, Route, Switch } from "react-router-dom";
import Home from "./components/Home";
import Comments from "./components/PostPage"
import Login from "./components/accounts/Login"
import ShowUser from "./components/ShowUser"

import Register from "./components/accounts/Register"

function App() {

  return (
    
    <BrowserRouter>
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
    </BrowserRouter>
  );
}

export default App;
