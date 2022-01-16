import React from "react";
import ReactDOM from "react-dom";
import propType from "prop-types";
import className from "classnames";
import API from "../fetch.js";


class ProfilePic extends React.Component{
  constructor(props){
    super(props);
    this.file=React.createRef();
    this.canvas=React.createRef();
  }
  //method to show the preview of the image
  showImage=(e)=>{
    try{
    for(const file of e.target.files){
      let img=new Image();
      let ctx=this.canvas.current.getContext('2d');
      img.onload=()=>{
          ctx.drawImage(img,0,0,400,400);
        }
      img.src=URL.createObjectURL(file);
      }
    }
    catch(error){console.log(error);}
  }
  //method to trigger input
  triggerInput=(e)=>{
    this.file.current.click();
  }
  //method for setting as a profile picture
  setProfilePic=(e)=>{
    let image='';
    image=this.canvas.current.toDataURL('image/jpeg',0.5);
    console.log('set profile picture called');
    console.log(image);
    if(image!=''){
    this.props.changePfp(image);
    }
  }
  render(){
    return(
      <div className="profile-pic">
        <input type="file" accept=".jpg,.jpeg,.png,.gif" ref={this.file} onChange={this.showImage}/>
        <button onClick={this.triggerInput}><i className="fas fa-camera" aria-hidden="true"></i>Choose a Picture</button>
        <button onClick={this.setProfilePic}><i className="fa fa-check" aria-hidden="true"></i>Set as a Profile picture</button>
        <div className="canvas-elem">
        <canvas width="400px" height="400px" ref={this.canvas}></canvas>
        </div>
      </div>
    )
  }
}

class UserNameInput extends React.Component{
  constructor(props){
    super(props);
    this.input=React.createRef();
  }
  checkUsername=(e)=>{
    console.log('checkUsername called');
  }
  setName=(e)=>{
    if(this.input.current.value!=''){this.props.changeUsername(this.input.current.value);}
    else{console.log('username is empty');}
  }
  render(){
    return(
      <div className="username-input">
        <input type="text" placeholder="Enter new username" ref={this.input} onChange={this.checkUsername}/>
        <button onClick={this.setName}>Set</button>
      </div>
    )
  }
}


export default class Settings extends React.Component{
  state={
    profileComp:false,
    usernameComp:false
  }
  showProfileComp=()=>{
    this.setState({profileComp:!this.state.profileComp,usernameComp:false});
  }
  showUserComp=()=>{
    this.setState({profileComp:false,usernameComp:!this.state.usernameComp});
  }
  render(){
    return(
      <div className="settings">
      <div className="settings-item ripple"><p>Settings</p></div>
      <div className="settings-item ripple">
        <button onClick={this.showProfileComp}>Change Profile Picture</button>
        {this.state.profileComp?(<ProfilePic {...this.props}/>):null}
      </div>
      <div className="settings-item ripple">
        <button onClick={this.showUserComp}>Change Username</button>
        {this.state.usernameComp?(<UserNameInput {...this.props}/>):null}
      </div>
      </div>
    )
  }
}