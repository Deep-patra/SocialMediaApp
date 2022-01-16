import React from "react";
import ReactDOM from "react-dom";
import propType from "prop-types";
import className from "classnames";
import Chat from "./chat.js";
import VideoChat from "./videoChat.js";
import {Link,Route,Switch} from "react-router-dom";

class Friend extends React.Component{

  chatButtonClicked=()=>{
    this.props.setClickedUser(this.props.friend);
  }

  /*componentWillUnmount(){
    this.elem.current.removeEventListener('mouseleave',this.flip,false);
  }*/
  render(){
   return(
  <div className="friend-item">
    <div className="friend-profile-pic">
    <img src={this.props.friend.profilePic}/>
    </div>
    <div className="items">
    <div className="friend-username">
      <span>{this.props.friend.username}</span>
    </div>
    <div className="friend-buttons">
      <span onClick={this.chatButtonClicked}><Link to={`/friends/chat/${this.props.friend.username}`}><i className="far fa-comments"></i></Link></span>
      <span onClick={this.chatButtonClicked}><Link to={`/friends/video_chat/${this.props.friend.username}`}><i className="fas fa-video"></i></Link></span>
    </div>
    </div>
  </div>
    )
  }
}

class Friends extends React.Component{
  render(){
    return(<div className="friends">
      <div className="friend-heading ripple"><h3>Friends</h3></div>
      <div className="friendList">
      {this.props.friendList.map((friend,index)=>{
        return(<Friend friend={friend} key={index} {...this.props}/>)
      })}
      </div>
    </div>
    )
  }
}
export default class FriendList extends React.Component{
  state={
    clickedUser:null
  }
  setClickedUser=(user)=>{
    this.setState({
      clickedUser:user
    });
    console.log('Received:',user);
  }
 /* chatButtonClicked=(e)=>{
    this.setState({chatButton:true});
  }*/
  UNSAFE_componentWillMount(){
    this.props.getFriends();
  }
  render(){
    return(
      <Switch>
      <Route path="/friends" exact render={()=>(<Friends {...this.props} setClickedUser={this.setClickedUser}/>)}/>
      <Route path="/friends/chat" render={()=>(<Chat {...this.props} friend={this.state.clickedUser}/>)}/>
      <Route path="/friends/video-chat" render={()=>(<VideoChat {...this.props} friend={this.state.clickedUser} sendVideoChatOffer={this.props.sendVideoChatOffer}/>)}/>
      </Switch>
    )
  }
}