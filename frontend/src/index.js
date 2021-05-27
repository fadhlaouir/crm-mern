import React from "react";
import ReactDOM from "react-dom";
import { Switch, Redirect, Route } from "react-router";
import { BrowserRouter, Link } from "react-router-dom";

import Login from "./Login";
import Register from "./Register";
import Items from "./components/Items";
import "./Login.css";
import Companies from "./components/Companies";
import { DefaultLayout } from "./layout/DefaultLayout";

ReactDOM.render(
  <BrowserRouter>
    <Switch>
      <Route exact path="/login" component={Login} />
      <Route exact path="/register" component={Register} />
      <Route path="/Items" component={Items} />
      <Route path="/companies" component={Companies} />
      <Route path="/" component={DefaultLayout} />
    </Switch>
  </BrowserRouter>,
  document.getElementById("root")
);
