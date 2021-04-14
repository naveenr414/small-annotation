import React from 'react';
import logo from './logo.svg';
import './App.css';
import Main from "./Main";
import Login from "./Login";
import Register from "./Register";
import User from "./User";
import Info from "./Info";
import EntitySearch from "./EntitySearch";
import PacketSearch from "./PacketSearch";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

function App() {
  
  return (
  <Router>
      <Switch>
        <Route path="/login">
          <Login />
        </Route>
        <Route path="/user"> 
          <User />
        </Route> 
        <Route path="/info"> 
          <Info />
        </Route> 
        <Route path="/packetsearch"> 
          <PacketSearch />
        </Route> 
        <Route path="/entitysearch"> 
          <EntitySearch />
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
