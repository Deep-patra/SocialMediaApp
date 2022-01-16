import React from "react";
import ReactDOM from "react-dom";
import propType from "prop-types";
import className from "classnames";
import Form from "./form.js";



export default class Home extends React.Component{
  render(){
    return(
      <div className="home">
      <div className="homeLogo">
      <h1>REACT-APP</h1>
      </div>
      <div>GET STARTED...</div>
      <div className="formBox">
      <Form {...this.props}/>
      </div>
      </div>
      );
  }
}