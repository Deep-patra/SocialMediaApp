import React from "react";
import ReactDOM from "react-dom";
import propType from "prop-types";
import className from "classnames";
import API from "./fetch.js";
import {Link} from "react-router-dom";

export default class Signup extends React.Component{
 constructor(props){
   super(props);
   this.box=React.createRef();
   this.pass=React.createRef();
   this.user=React.createRef();
   this.worker=null;
 }
  state={
    name:"",
    password:"",
    passwordType:true,
    confirmPass:"",
    text:"",
    usernameText:"",
    confirmPassText:""
  }
  checkPassword=(value)=>{
    switch(false){
      case(/[0-9]/).test(value):this.setState({text:"Your Password must contain a DIGIT"});break;
      case(/[A-Z]/).test(value):this.setState({text:"Your Password must contain a Capital letter"});break;
      case(/[a-z]/).test(value):this.setState({text:"Your Password must contain a lowercase letter"});break;
      case(/\W/).test(value):this.setState({text:"Your Password must contain a special character"});break;
      case(this.state.password.length>8):this.setState({text:"Your password must contain atleast 8 characters"});break;
      default:this.setState({text:""});break;
    }
    return true;
  }
  changeName=(e)=>{
    this.setState({name:e.target.value});
  //await this.worker.postMessage({username:this.user.current.value});
  }
  changePassword=(e)=>{
    this.setState({password:e.target.value});
    this.checkPassword(this.pass.current.value);
  }
  showPassword=(e)=>{
    this.setState({passwordType:!this.state.passwordType});
  }
  changeConfirmPass=(e)=>{
    this.setState({confirmPass:e.target.value});
    if(!(e.target.value==this.state.password)){
      this.setState({confirmPassText:'Password are not equal'});
    }
    else{
      this.setState({confirmPassText:""});
    }
  }
  //method to check username 
  checkUserName=(e)=>{
    this.worker.postMessage({username:e.target.value});
  }
  submit=(e)=>{
    e.preventDefault();
    console.log('signup clicked');
    if(this.state.name!="" && this.checkPassword(this.state.password) && this.state.password==this.state.confirmPass){
      //animation for signup
      this.box.current.animate([
        {boxShadow:'0 0 0 transparent'}
        ],
        {duration:300,
        fill:'forwards',
        easing:"linear"
        });
    
    
    API.signup({username:this.state.name,password:this.state.password})
    .then(res=>{
      if(res.status===201){
        this.props.authorizedUser();
        console.log('Authorized');
      }
      else if(res.status==402){
        this.setState({usernameText:'username already exist'});
      }
    })
    .catch(err=>{console.error('error:',err)});
    }
    else{
        console.log('some err in signup');
    }
  }
  check=(e)=>{
    if(!this.state.password==''){
    this.checkPassword(this.state.password);
    }
  }
  componentDidMount(){
    this.worker=new Worker('./webWorkers/signupWebsocket.js');
    
    
    this.worker.onerror=()=>{
      console.log('error occured in signup worker');
    }
    
    this.worker.onmessage=(e)=>{
      let msg=e.data;
      switch(msg.Action){
        case 'Usertext':
          this.setState({usernameText:msg.usertext});
          break;
        default:break;
      }
    }
  }
  componentWillUnmount(){
    this.worker.terminate();
  }
  render(){
    return(
      <div ref={this.box}>
      <div className="formField">
      <input type="text" placeholder="Username" ref={this.user} onChange={this.changeName} onBlur={this.checkUserName} value={this.state.name}/>
      </div>
      <div className="usernameText"><p>{this.state.usernameText}</p></div>
      <div className="formField">
      <input type={this.state.passwordType?"password":"text"} ref={this.pass} placeholder="Password" onChange={this.changePassword} value={this.state.password} onBlur={this.check}/>
      <button className='eye-icon' onClick={this.showPassword}><i className="fa fa-eye"></i></button>
      </div>
      <div className="passwordText"><p>{this.state.text}</p></div>
      <div className="formField">
      <input type="password" placeholder="Confirm Password" value={this.state.confirmPass} onChange={this.changeConfirmPass}/>
      </div>
      <div className="passwordText"><p>{this.state.confirmPassText}</p></div>
      <div className='formButton'><button className="signup" onClick={this.submit}>SignUp</button></div>
      </div>
      );
  }
}