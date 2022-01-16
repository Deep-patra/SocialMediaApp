import React from "react";
import ReactDOM from "react-dom";
import propType from "prop-types";
import className from "classnames";
import PostList from "./postList.js";
import Sidebar from "./sidebar.js";
import FriendList from "./sideBarComponents/friends.js";
import Search from "./sideBarComponents/search.js";
import Settings from "./sideBarComponents/settings.js";
import FriendRequest from "./sideBarComponents/friendRequest.js";
import {Route,Switch} from "react-router-dom";
import Notify from "./notify.js";
import API from './fetch.js';
import Logout from './logout.js';
import Notification from "./notification.js";

export default class Main extends React.Component{
  constructor(props){
    super(props);
    this.worker=null;
    this.notifyButton=React.createRef();
  }
  
  state={
    username:'',
    userId:'',
    profilePic:'',
    posts:[{
      postId:'rudh',
      likeCount:10,
      dislikeCount:10,
      commentCount:10,
      author:'sexgod',
      text:'every one likes vagina!',
      images:[]
    }],
    friends:[
      {username:'deepppjshje',
       userId:'hbhkdke',
       profilePic:''
      }],
    notify:false,
    notification:[],
    notifyText:'',
    notificationOpen:false,
    newNotification:false,
    callReceived:null
  }
  
  //method to change profile picture
  changeProfilePic=(dataurl)=>{
    //console.log('changeProfilePic called',dataurl);
    API.changeProfilePic(dataurl)
    .then(res=>{
      if(res.status==201){
        this.setState({profilePic:dataurl});
        this.addNotifyText('Profile picture changed')
      }
      else{
        this.addNotifyText(res.message||'Cant change user profile picture');
      }
    })
    .catch(error=>{
      this.addNotifyText('Error! Please check your Internet Connection')
      console.log(error);
    });
  }
  
  
  //method to change username 
  changeUsername=(newName)=>{
    API.changeUsername(newName)
    .then(res=>{
      if(res.status==201){
        this.addNotifyText('Username changed');
      }
    })
    .catch(error=>{
      this.addNotifyText('Error! Please check your Internet Connection')
      console.log(error);
    });
  }
  
  
  //method to add post from Create post component 
  addPost=(postData)=>{
    let post={
      author:this.state.username,
      author_id:this.state.userId,
      author_pic:this.state.profilePic,
      text:postData.text||'',
      images:postData.images||[]
    }
    API.sendPost(post)
    .then(res=>{
      if(res.status==201){
        this.setState({posts:this.state.posts.concat(res.post)});
      }
      else{
        this.addNotifyText(res.message||'Some error occured while fetchibg Posts!')
      }
    })
    .catch(error=>{
      this.addNotifyText('Error! Please check your Internet Connection')
      console.log(error);
    });
  }
  
  
  //method to notify the user
  addNotifyText=(text)=>{
    return this.setState({notify:true,notifyText:text});
  }
  removeNotify=()=>{
   return this.setState({notify:false,notifyText:''});
  }
  
  
  //method to call posts form post component
  getPosts=()=>{
    API.getPosts()
    .then(res=>{
      if(res.status==201){
        res.posts.map(post=>{
          this.setState({posts:post});
        });
      }
      else{
        this.addNotifyText(res.message||'Error!');
      }
    })
    .catch(error=>{
      console.log(error);
      this.addNotifyText('Error!Please check your Internet Connection')
    });
  }
  
  
  //method to get Friends from the server
  getFriends=()=>{
    API.getFriends()
    .then(res=>{
      if(res.status==201){
        let arr=[];
        res.friends.map(friend=>{
          arr.push(friend);
        });
        this.setState({friends:arr});
      }
      else{
        this.addNotifyText(res.message||'Error!');
      }
    })
    .catch(error=>{
      this.addNotifyText('Error! Please check your Internet Connection')
      console.log(error);
    });
  }
   
  //method to open Notification box
  openNotification=(e)=>{
    console.log('open notification');
    if(this.state.newNotification==true){
    return  this.setState({newNotification:!this.state.newNotification,notificationOpen:!this.state.notificationOpen});
    }
    return this.setState({notificationOpen:!this.state.notificationOpen});
  }
  
  //method to send notification about video-chat call
  sendVideoCallOffer=(data)=>{
    //sending message to web workers
    this.worker.postMessage({data});
  }
    
  componentDidMount(){
    
    //adding event listener to the notification button
    this.notifyButton.current.addEventListener('click',this.openNotification,false);
    
    API.getUserData()
      .then(res => {
        if (res.status==201) {
          this.setState({
            username: res.username,
            profilePic: res.profilePic,
            userId: res.userId
          });
          console.log(this.state.username,this.state.userId);
        }
        else{
          this.addNotifyText('Some error in the server!')
        }
      })
      .catch(error => {
        this.addNotifyText('Error! Please check your internet connection')
        console.log(error);
        
      });
    
    console.log('initializing worker');
    this.worker=new Worker('./webWorkers/mainWebsocket.js');
    
    this.worker.onerror=(e)=>{
      console.log('an error has occured while initialzing worker');
    }
    
    /****incoming message from websocket*****/
    this.worker.onmessage=(e)=>{
      let msg=e.data.message;
      switch(msg.Action){
        case 'LIKE_POST':{
            const postId=msg.post.postId;
            const len=this.state.postId.length;
            const posts=this.state.posts;
            for(let i=0;i<len;i++){
              if(posts[i].postId==postId){
                ++this.state.posts[i].likeCount;
                break;
              }
            }
          break;
        }
        case 'DISLIKE_POST':{
            const postId = msg.post.postId;
            const len = this.state.postId.length;
            const posts = this.state.posts;
            for (let i = 0; i < len; i++) {
              if (posts[i].postId == postId) {
                ++this.state.posts[i].dislikeCount;
                break;
              }
            }
          break;
        }
        case 'Add_Comment':{
          
          
          break;
        }
        case 'Notification':
            const notif=msg.notification;
            this.setState({
              newNotification:true,
              notification:this.state.notification.concat(notif)
              
            }); 
              
            if(msg.hasOwnProperty('callReceived')){
                this.setState({callReceived:msg.callReceived});
              }
            
          break;
        default:
          break;
      }
    }
    
  }
  componentWillUnmount(){
    //terminating the web worker
    this.worker.terminate();
    this.notifyButton.current.removeEventListener('click',this.openNotification,false);
  }
  render(){
    return(
      <div className="grid">
        <header className="header">
          <span className="header-logo">
            <img src='./images/React-icon.svg'/>
            <h1 className="mainLogo">REACT-APP</h1>
          </span>
          <div ref={this.notifyButton} className={className("notification-button",{"animate-bell":this.state.newNotification})}>
            <i className={className("far fa-2x fa-bell",{"fas":this.state.notificationOpen,"shake-bell":this.state.newNotification})} aria-hidden="true">
            </i>
            {this.state.notificationOpen?(<Notification notification={this.state.notification} openNotification={this.openNotification}/>):null}
          </div>
        </header>
        <Sidebar profilePic={this.state.profilePic} username={this.state.username}/>
        <main>
          {this.state.notify?(<Notify text={this.state.notifyText} removeNotify={this.removeNotify}/>):null}
          <Switch>
            <Route path="/main" render={()=>(
              <PostList
                worker={this.worker} 
                author={this.state.username} 
                posts={this.state.posts} 
                addPost={this.addPost} 
                getPosts={this.getPosts} 
                notify={this.addNotifyText}
                />)}/>
            <Route path="/friends" render={()=>(
              <FriendList
                friendList={this.state.friends}
                username={this.state.username}
                profilePic={this.state.profilePic}
                getFriends={this.getFriends}
                notify={this.addNotifyText}
                sendVideoCallOffer={this.sendVideoCallOffer}
                callReceived={this.state.callReceived}
                />
                )}/>
            <Route path="/search" render={()=>(
              <Search/>
              )}/>
            <Route path="/settings" render={()=>(
              <Settings 
              changePfp={this.changeProfilePic} 
              changeUsername={this.changeUsername} 
              notify={this.addNotifyText}
              />)}/>
            <Route path='/logout' render={()=>(
              <Logout authorizedUser={this.props.authorizedUser}
              />)}/>
            <Route path="/friend-request" render={()=>(<FriendRequest/>)}/>
          </Switch>
        </main>
      </div>
      )
  }
}