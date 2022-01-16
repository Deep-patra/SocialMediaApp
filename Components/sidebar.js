import React from "react";
import ReactDOM from "react-dom";
import propType from "prop-types";
import className from "classnames";
import {Link} from "react-router-dom";


export default class sidebar extends React.Component{
  render(){
    return(
    <div className="sidebar ripple">
    <div className="profilePic">
    <img src={this.props.profilePic||'./images/avatar.jpg'}/>
    </div>
    <h3 className="sidebar-username"><p>{this.props.username}</p></h3>
    <div className="Home">
    <i className="fa fa-home" aria-hidden="true"></i>
    <Link to="/main">Home</Link>
    </div>
    <div>
    <i className="fa fa-cog" aria-hidden="true"></i>
    <Link to="/settings">Settings</Link>
    </div>
    <div>
    <i className="fas fa-user-friends" aria-hidden="true"></i>
    <Link to="/friends">Friends</Link>
    </div>
    <div>
    <i className="fas fa-user-plus" aria-hidden="true"></i>
    <Link to="/friend-request">Friend Requests</Link>
    </div>
    <div className="search">
    <i className="fa fa-search" aria-hidden="true"></i>
    <Link to="/search">Search</Link>
    </div>
    <div className="logout">
    <i className="fa fa-sign-out-alt" aria-hidden="true"></i>
    <Link to="/logout">Log Out</Link>
    </div>
    </div>
    )
  }
}