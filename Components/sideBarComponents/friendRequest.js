import React from "react";
import ReactDOM from "react-dom";
import propType from "prop-types";
import className from "classnames";
import API from "../fetch.js";


class SentReq extends React.Component{
  cancelReq=(e)=>{
    e.target.disabled=true;
    e.preventDefault();
    return this.props.cancelReq(this.props.friend);
  }
  render(){
    return(
      <div className="req-item">
        <div className="req-profilePic"><img src={this.props.friend.profilePic}/></div>
        <div className="req-name">
        <span>{this.props.friend.username}</span>
        <button className="req-cancel" onClick={this.cancelReq}>Cancel</button>
        </div>
      </div>
    )
  }
}


class AcceptReq extends React.Component{
  acceptReq=(e)=>{
    e.target.disabled=true;
    e.preventDefault();
    return this.props.acceptReq(this.props.friend);
  }
  render(){
    return(
      <div className="req-item">
        <div className="req-profilePic"><img src={this.props.friend.profilePic}/></div>
        <div className="req-name">
          <span>{this.props.friend.username}</span>
          <button className="req-accept" onClick={this.acceptReq}>Accept</button>
        </div>
      </div>
    )
  }
}


export default class FriendRequest extends React.Component{
  state={
    sent:[],
    received:[{username:'fucker',userId:'dshjdhd',profilePic:'jdd'}],
    sentClicked:true,
    receivedClicked:false
  }
  cancelReq=(friend)=>{
    console.log('cancel req called');
    
    /*sending fetch request to the server*/
    API.cancelReq({username:friend.username,userId:friend.userId})
    .then(res=>{
      if(res.status==201){
        //finding the user in the state
        this.state.sent.find((user,index,list)=>{
          if(user.username==friend.username){
            let arr=list.splice(index,1);
            this.setState({sent:arr});
          }
        });
      }
      else{
        throw res.message||'some error in the server';
      }
    })
    .catch(error=>{
      console.log(error)
      
    });
  }
  acceptReq=(friend)=>{
    console.log('accept request');
    
    /*sending fetch request to the server*/
    API.acceptReq({username:friend.username,userId:friend.userId})
    .then(res=>{
      if(res.status==201){
        //finding the user in the state
        this.state.received.find((user,index,list)=>{
          if(user.username==friend.username){
            let arr=list.splice(index,1);
            this.setState({received:arr});
          }
        })
      }
      else{
        throw res.message||'some error in server';
      }
    })
    .catch(error=>{console.log(error)});
  }
  //method to open the sent Request list
  openSentRequest=(e)=>{
    this.setState({sentClicked:!this.state.sentClicked,receivedClicked:false});
  }
  //method to open the Received List
  openReceivedRequest=()=>{
    this.setState({sentClicked:false,receivedClicked:!this.state.receivedClicked});
  }
  componentDidMount(){
    //fetch request to get Friend requests
    API.getRequests()
    .then(res=>{
      if(res.status==201){
        this.setState({sent:res.request.sent,received:res.request.received});
      }
      else{
        console.log(res.message);
      }
    })
    .catch(error=>{
      console.log(error);
    });
  }
 
  render(){
    return(
      <div className="friend-request">
        <div className="request-heading ripple">
          <h3>Friend Request</h3>
          <button onClick={this.openSentRequest}>Sent({this.state.sent.length})</button>
          <button onClick={this.openReceivedRequest}>Received({this.state.received.length})</button>
        </div>
        <div className="request-list">
          {this.state.sentClicked?(
          this.state.sent.length>0?(
          this.state.sent.map((friend,index)=>{
            return <SentReq friend={friend} key={index} cancelReq={this.cancelReq}/>
          })
          ):('No Friend Request sent yet!')
          ):(null)}
          
          {this.state.receivedClicked?(
          this.state.received.length>0?(
          this.state.received.map((friend,index)=>{
            return <AcceptReq friend={friend} key={index} acceptReq={this.acceptReq}/>
          })
          ):('No Friend Request Received yet!')
          ):(null)}
        </div>
      </div>
    )
  }
}