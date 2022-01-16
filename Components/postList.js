import React from "react";
import ReactDOM from "react-dom";
import propType from "prop-types";
import Post from "./post.js";
import CreatePost from "./CreatePost.js"

export default class PostList extends React.Component {
 
  static proptypes={
    getFriends:propType.func,
    addPost:propType.func
  }
  
  componentDidMount(){
    this.props.getPosts();
  }
  
  render(){
    return (
      <div className="postlist">
      <CreatePost addPost={this.props.addPost}/>
      {this.props.posts.length<1?<h3>No post yet,add some friends to share post</h3>:null}
        {this.props.posts.map((value,index)=>{
          return(<Post key={index} post={value} worker={this.props.worker}/>)
        })}
        </div>
    )
  }
}