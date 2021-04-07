import React from 'react';
import logo from './logo.svg';
import './App.css';
import Main from "./Main";
import Login from "./Login";
import Register from "./Register";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

function App() {
  
  return (
  <Router>
      <Switch>
        <Route path="/login">
          <Login />
        </Route>
        <Route path="/register">
          <Register />
        </Route>
        <Route path="/">
          <Main/>
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
