import React from "react";
import ReactDOM from "react-dom";
import propType from "prop-types";
import className from "classnames";
import Image from "../image.js";


class Message extends React.Component{
  static defaultProps={
    message:{
      username:'',
      text:'',
      images:'./images/image-not-found.svg',
      time:`${(new Date()).getHours()}:${(new Date()).getMinutes()}`
    }
  }
  render(){
    return(
      <div className="message">
        <div className="message-pic">
          {this.props.username===this.props.message.username?(<img src={this.props.profilePic}/>):(<img src={this.props.friend.profilePic}/>)}
        </div>
        <div className="message-container">
          <div className="message-content">
          {(this.props.message.text!=null)?<div className="message-text"><p>{this.props.message.text}</p></div>:null}
          {(this.props.message.images.length>0?(<div className="message-image">{this.props.message.images.map((image,index)=>{<img src={image} key={index}/>})}</div>):null)}
          </div>
          <span className="message-time">{this.props.message.time}</span>
        </div>
      </div>
    )
  }
}

export default class Chat extends React.Component{
  constructor(props){
    super(props);
    this.file=React.createRef();
    this.worker=null;
  }
  state={
    messages:[],
    text:'',
    files:[],
    images:[]
  }
  changeValue=(e)=>{
    this.setState({text:e.target.value});
  }
  triggerInput=()=>{
    this.file.current.click();
  }
  //method to store selected files in the state
  storeFiles=(e)=>{ 
    let arr=[];
    let image=[];
    let canvas=document.createElement('canvas');
    canvas.width=500;
    canvas.height=500;
    let ctx=canvas.getContext('2d');
    try{
    for(const file of e.target.files){
      arr=arr.push(file);
      let img=new Image();
      img.onload=()=>{
        ctx.drawImage(img,0,0,500,500);
        image.push(canvas.toDataURL('image/jpeg',0.5));
        img.src=URL.revokeObjectURL(file);
      }
      img.src=URL.createObjectURL(file);
      }
      this.setState({files:this.state.files.concat(arr),images:this.state.images.concat(image)});
    }
    catch(error){console.log(error)}
  }
  
  
  //function to send message to the friend 
  sendMessage=(e)=>{
    try{
    if(this.state.text!=null || this.state.files.length>0){
      this.setState({
        messages:this.state.messages.concat({
        username:this.props.username,
        profilePic:this.props.profilePic,
        text:this.state.text||'',
        images:this.state.images||[]
      }),
      text:'',
      files:[],
      images:[]});
    }
    this.worker.postMessage({Action:'message',message:{
       from:{
         username:this.props.username,
         text:this.state.text||'',
         images:this.state.images||[]
       },
       to:{
         username:this.props.friend.username
       }
      }});
    }
    catch(err){
      console.log(err);
    }
  }
  
  
  
  componentDidMount(){
   /* API.getComments();*/
   this.setState({messages:this.state.messages.concat({
     username:this.props.friend.username,
     profilePic:this.props.friend.profilePic,
     text:'whatsup fucker',
     images:['./images/image-not-found.svg']
   })});
   
   //initializing the web worker
   this.worker=new Worker('./webWorkers/chatWebsocket.js');
   
   this.worker.onerror=()=>{
     console.log('error in chat worker');
   }
   
   
   this.worker.onmessage=(e)=>{
     if(e.data.hasOwnProperty('Action')){
       if(e.data.Action=='message'){
         let message=e.data.message.from;
         this.setState({
           username:message.username,
           text:message.text||'',
           images:message.images||[]
         });
       }
     }
   }
  }
  
  
  componentWillUnmount(){
    //terminating the web worker
    this.worker.terminate();
  }


  render(){
    return(
      <div className="chatBox">
        <div className="chat-container">
        <div className="chat-box-header">
          <div className="chat-box-profile-pic">
            <img src={this.props.friend.profilePic}/>
          </div>
          <div className="chat-username">
            <span>{this.props.friend.username}</span>
          </div>
        </div>
          {this.state.messages.length>0?(this.state.messages.map((message,index)=>{
            return(<Message message={message} key={index} {...this.props}/>)
          })):"No conversation has occured yet!"}
        </div>
        <div className="chat-input ripple">
          <div className="chat-preview">
            {(this.state.files.length>0)?(
              this.state.files.map((file,index)=>{
                return(<div><Image file={file} key={index}/></div>)
              })
            ):null}
          </div>
          <div className="chat-input-box">
          <div>
          <input type="text" placeholder="Send something.." value={this.state.text} onChange={this.changeValue}/>
          <input type="file" ref={this.file} onChange={this.storeFiles} accept=".jpg,.jpeg,.gif,.png" multiple/>
          <button onClick={this.triggerInput}><i className="fa fa-camera"></i></button>
          </div>
          <button onClick={this.sendMessage}><i className="fa fa-paper-plane" aria-hidden="true"></i></button>
          </div>
        </div>
      </div>
    )
  }
}