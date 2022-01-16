import React from "react";
import ReactDOM from "react-dom";
import propType from "prop-types";
import className from "classnames";
import Login from "./login.js";
import Signup from "./signup.js";
import {Route,Switch} from "react-router-dom";

export default class Form extends React.Component{
  render(){
    return(
     <div className="form">
     <Switch>
     <Route exact path='/index.html' render={()=>{return <Login {...this.props}/>}}/>
     <Route exact path="/signup" render={()=>{return <Signup {...this.props}/>}}/>
     </Switch>
     </div>
      )
  }
}