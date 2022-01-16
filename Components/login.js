import React from "react";
import ReactDOM from "react-dom";
import propType from "prop-types";
import className from "classnames";
import API from "./fetch.js"
import {Link} from "react-router-dom";

export default class Login extends React.Component{
  state={
    name:"",
    password:"",
    passwordType:true,
    message:""
  }
  nameChange=(e)=>{
    this.setState({name:e.target.value});
  }
  passwordChange=(e)=>{
    this.setState({password:e.target.value});
  }
  changeType=(e)=>{
    this.setState({passwordType:!(this.state.passwordType)});
  }
  submit=(e)=>{
    console.log('submit');
    e.preventDefault();
    API.login({username:this.state.name,password:this.state.password})
    .then(res=>{
      if(res.status==201){
        this.props.authorizedUser();
        console.log('response is good');
      }
      else if(res.status==401){
        //console.log('password is incorrect');
        this.setState({message:'Username and password are incorrect!'});
      }
      else{
       //console.log('Username not found');
      }
    })
    .catch(err=>{console.error('error:',err)});
  }
  render(){
   return( <div>
    <div className="alert-text"><p>{this.state.message}</p></div>
    <div className="formField">
    <input type="text" placeholder="Name" value={this.state.name} onChange={this.nameChange}/>
    </div>
    <div className="formField">
    <input type={this.state.passwordType?"password":"text"} placeholder="Password" value={this.state.password} onChange={this.passwordChange}/>
    <button onClick={this.changeType}>
    <i className="fa fa-eye" aria-hidden="true"></i>
    </button>
    </div>
    <div className='formButton'>
    <button className="login" onClick={this.submit}>Login</button>
    </div>
    <div className="formText">
    <p>Don't have an account?<Link to="/signup">Signup</Link></p>
    </div>
    </div>)
  }
}