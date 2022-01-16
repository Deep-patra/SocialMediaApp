import React from "react";
import ReactDOM from "react-dom";
import propType from "prop-types";
import className from "classnames";
import CommentBox from "./commentBox.js"
import Image from "./image.js";
import API from "./fetch.js";

class Text extends React.Component{
  render(){
    return(
      <p>{this.props.text}</p>
      )
  }
}

export default class Post extends React.Component{
  /*proptypes for post component*/
  static proptypes={
    post:propType.shape({
      postId:propType.string,
      text:propType.string,
      images:propType.array,
      author:propType.string,
      likeCount:propType.number,
      dislikeCount:propType.number,
      commentCount:propType.number
    })
  };
  //default proptypes
  static defaultProps={
    post:propType.shape({
      author:'',
      profilePic:'../images/avatar.jpg',
      text:'',
      images:[],
      likeCount:0,
      dislikeCount:0,
      commentCount:0
    })
  };
  state={
    likeClicked:false,
    commentClicked:false,
    dislikeClicked:false,
    showComments:false
  }
  getTime=()=>{
    console.log('get Time called');
    let d=new Date();
  //  console.log(`${performance.now()} ${d.getMinutes()} ${d.getDate()} ${d.getMonth()}`);
    return `${d.getHours()}:${d.getMinutes()}`;
  }
  
  //function for like button
  likeClick=(e)=>{
    
    if(this.state.dislikeClicked==true){
      this.setState({dislikeClicked:false});
    }
    if(this.state.likeClicked==true){
      this.setState({likeClicked:false});
      
      this.props.worker.postMessage({
        Action:'UNLIKE_POST',
        username:this.props.username,
        post:{
          postId:this.props.postId,
          author:this.props.author
        }
      });
    }
    else{
     this.setState({likeClicked:true});
  
     this.props.worker.postMessage({
       Action:'LIKE_POST',
       username:this.props.username,
       post:{
         postId:this.props.post.postId,
         author:this.props.post.author
       }
     }); 
    }
  }
  //function for comment button
  commentClick=(e)=>{
    e.stopPropagation();
    this.setState({
      commentClicked:!this.state.commentClicked,
      showComments:!this.state.showComments
    });
    if(this.state.showComments===true){
      this.getComments();
      //console.log('comment box will be showed');
    }
   // console.log('comment button clicked');
  }
  //function for dislike button
  dislikeClick=(e)=>{
    
    if(this.state.likeClicked==true){
      this.setState({likeClicked:false});
    }
    if(this.state.dislikeClicked==true){
      this.setState({dislikeClicked:false});
      
      this.props.worker.postMessage({
        Action:'UNDISLIKE_POST',
        username:this.props.username,
        post:{
          postId:this.props.postId,
          author:this.props.post.author
        }
      })
    }
    else{
      this.setState({dislikeClicked:true});
      console.log('dislike button clicked');
    
    this.props.worker.postMessage({
      Action:'DISLIKE_POST',
      username:this.props.username,
      post:{
        postId:this.props.post.postId,
        author:this.props.post.author
      }
    });
    }
  }
  //function to add Comment in the comments array in the state
  addComment=(value)=>{
    console.log('addcomment called');
    let comment={
      author:this.props.username,
      time:this.getTime(),
      text:value
    };
    this.setState({comments:this.state.comments.concat(comment),commentCount:this.state.commentCount+1});
    /*API.postComment(this.props.post.postId,comment)
    .then(res=>{
      if(res.status==201){
        console.log('comment posted!');
      }
      else{
        throw 'some error occured';
      }
    })
    .catch(error=>{
      console.log(error);
    })*/
    
    //Sending comment to the server through the websocket
    this.props.worker.postMessage({
      Action:'Add_Comment',
      username:this.props.username,
      postId:this.props.postId,
      comment:comment
    });
  }
  //
  //removing commentbox
  //
  removeCommentBox=(e)=>{
   // console.log('removeCommentBox called');
    this.setState({showComments:false,commentClicked:false});
  } 
  
  
  //getComments for the post
  getComments=()=>{
    API.getComments(this.props.post.postId)
    .then(res=>{
     // console.log(res.comments);
      if(res.status===201){
        this.setState({comments:res.comments});
      }
      else{
        console.log('comment can not open')
      }
    })
    .catch(error=>{console.log(error)});
  }
  
  
  
  render(){
    return(
      <div className="post">
      <div className="postUser">
      <div className="postUser-pic"><img src={this.props.post.profilePic}/></div>
      <p>{this.props.post.author}</p>
      </div>
      <div className="content">
      <div className="text-content">
      {(this.props.post.text!=null)?(<Text text={this.props.post.text}/>):null}
      </div>
      <div className="image-content">
      {this.props.post.images.length>0?
        this.props.post.images.map((image,index)=>{return(<img src={image} key={index}/>)}):null}
      </div>
      </div>
      <div className="buttonRow">
      <div>
      <button className="likeButton" onClick={this.likeClick}>
      <i className={className("fa-2x","fa-thumbs-up",{"fas":this.state.likeClicked,"far":!this.state.likeClicked})}></i>
      </button>
      <span className={className({"likeCount":this.state.likeClicked})}>{this.props.likeCount}</span>
      </div>
      <div>
      <button className="dislikeButton" onClick={this.dislikeClick}>
      <i className={className("fa-2x","fa-thumbs-down",{"fas red":this.state.dislikeClicked,"far":!this.state.dislikeClicked})}></i>
      </button>
      <span className={className({"dislikeCount":this.state.dislikeClicked})}>{this.props.dislikeCount}</span>
      </div>
      <div>
      <button className="commentButton" onClick={this.commentClick}>
      <i className={className("fa-2x","fa-comment-alt",{"fas":this.state.commentClicked,"far":!this.state.commentClicked})}></i>
      </button>
      <span>{this.state.commentCount}</span>
      </div>
      </div>
      <div>
      {this.state.showComments?(<CommentBox username={this.props.username} comments={this.state.comments} addComment={this.addComment} removeCommentBox={this.removeCommentBox}/>):null}
      </div>
      </div>
      )
  }
}
