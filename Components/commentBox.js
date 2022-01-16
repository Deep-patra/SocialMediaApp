import React from "react";
import ReactDOM from "react-dom";
import propType from "prop-types";
import className from "classnames";

class Comment extends React.Component{
  render(){
    return(
      <div className="comment">
      <div className="commentUserDate">
      <span className="commentUser">{this.props.comment.author}</span>
      <span className="commentTime">{this.props.comment.time}</span>
      </div>
      <div className="commentText">{this.props.comment.text}</div>
      </div>
      )
  }
}

export default class CommentBox extends React.Component{
  constructor(props){
    super(props);
    this.box=React.createRef();
  }
    state={
      userComment:''
    }
    addComment=(value)=>{
      this.props.addComment(value);
    }
    // function for input element in the comment box
    inputValue=(e)=>{
      console.log('inputValue called',e.target.value);
      if (e.target.value != '') {
        this.setState({userComment:e.target.value });
      }
    }
    postComment=(e)=>{
      console.log('post comment called');
      //try{
      if (this.state.userComment != (null || '')) {
        this.setState({userComment:''});
        this.addComment(this.state.userComment);
      }
      
    /*}
      catch(error){
        console.log(error);
      }*/
      return;
    }
    //method to aninate the commentBox on unmounting
    animateUnmounting = () => {
      this.box.current.animate(
                  [
          { transform: 'translateX(0px)', opacity: '1' },
          { transform: 'translateX(-300px)', opacity: '0' }
                  ],
        {
          duration: 200,
          easing: 'linear',
          fill: 'forwards'
        }
      );
    }
    //function to remove commentBox
    removeBox=(e)=>{
      try{
        console.log('remove box called');
      if(!(e.composedPath().includes(this.box.current))){
          this.animateUnmounting();
          window.setTimeout(()=>{this.props.removeCommentBox()},200);
      }
      return;
      }catch(error){console.log(error)}
    }
    componentDidMount(){
      window.addEventListener('click',this.removeBox,false);
    }
    componentWillUnmount(){
      console.log('componentwill unmount called');
      window.removeEventListener('click',this.removeBox,false);
    }
  render(){
    return(
      <div className="commentBox" ref={this.box}>
      <div className="commentInput">
      <input type="text" placeholder="write a Comment.." value={this.state.userComment} onChange={this.inputValue} />
      <button className="commentPostButton" onClick={this.postComment}>POST</button>
      </div>
      <div className="commentList">
      {this.props.comments.length<1?<div>No comments yet!</div>:null}
      {this.props.comments.map((comment,index)=>{
        return(<Comment key={index} comment={comment}/>)
      })}
      </div>
      </div>
      )
  }
}