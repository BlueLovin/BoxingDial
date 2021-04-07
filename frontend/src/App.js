import React, { Component, useEffect, useState } from "react";
import { BrowserRouter, Link, Route, Switch } from "react-router-dom";
import Home from "./components/Home";
import Comments from "./components/PostPage"

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
      </Switch>
    </BrowserRouter>
  );
}

export default App;
