import React from "react";
import ReactDOM from "react-dom";
import propType from "prop-types";
import className from "classnames";
import API from "./fetch.js"


export default class Logout extends React.Component{
  logout=(e)=>{
    try{
    API.logout()
    .then(res=>{
      if(res.status==201)return this.props.authorizedUser();
    }).catch(error=>{console.log(error);})
    }
    catch(error){
      console.log(error);
    }
  }
  render(){
    return(
      <div>
        <p>Are you sure you want to log out?</p>
        <button onClick={this.logout}>Yes</button>
      </div>
    )
  }
}