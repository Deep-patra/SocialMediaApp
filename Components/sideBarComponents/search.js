import React from "react";
import ReactDOM from "react-dom";
import propType from "prop-types";
import className from "classnames";
import API from "../fetch.js";

class SearchItem extends React.Component{
  static proptypes={
    searchUser:propType.shape({
      username:propType.string,
      userId:propType.string,
      profilePic:propType.string
    })
  }
  state={
    requestSent:false
  }
  //method to sent request
  sendRequest=(e)=>{
    console.log('request send to ',this.props.searchUser.username);
    API.sendReq({username:this.props.searchUser.username,userId:this.props.searchUser.userId})
    .then(res=>{
      if(res.status==201){
        this.setState({requestSent:true});
      }
      else{throw "some error in sending request!";}
    })
    .catch(error=>{
      console.log(error);
    });
  }
  //method to cancel requset
  cancelReq=(e)=>{
    API.cancelReq({username:this.props.searchUser.username,userId:this.props.searchUser.userId})
    .then(res=>{
      if(res.status==201){
        this.setState({requestSent:false});
      }
      else{
        throw 'some error occured';
      }
    })
    .catch(error=>{console.log(error);})
  }
  render(){
    return(
      <div className="search-item">
        <div className="search-item-pic"><img src={this.props.searchUser.profilePic}/></div>
        <div>{this.props.searchUser.username}</div>
        {this.state.requestSent?(<div><button onClick={this.cancelReq}>Cancel</button></div>):
        (<div><button onClick={this.sendRequest}><i className="fas fa-user-plus"></i></button></div>)}
      </div>
    )
  }
}

export default class Search extends React.Component{
  constructor(props){
    super(props);
    this.search=React.createRef();
    this.worker=null;
  }
  state={
    value:'',
    searchItems:[],
    searchText:'No Match Found !'
  }
  
  //method to check for sending username values to server
  changeValue=async (e)=>{
    
      this.setState({value:e.target.value,searchText:`No user named "${e.target.value}" found!`});
      this.checkUsername(e.target.value).catch(error=>{console.log(error)})
  }
  
  //method to send the http request to search for user
  searchUser=(e)=>{
    console.log(this.state.value);
    
    //making a fetch request to the user
    let obj={username:this.state.value};
    API.search(obj)
    .then(res=>{
      if(res.status==201){
        this.setState({searchItems:res.searchItems});
      }
      else{
        throw 'some error occured';
      }
    })
    .catch(error=>{
      console.log(error);
      
    });
  }
  
  //method to remove value
  removeValue=(e)=>{
    //removing input values and search items
    this.setState({value:'',searchItems:[]});
  }
  
  //send socket message to the server for checking the username
  checkUsername=async (username)=>{
   await this.worker.postMessage({
      Action:'Check_Username',
      username:username
    });
  }
  
  
  componentDidMount(){
    
    //initializing the web worker
    this.worker=new Worker('./webWorkers/searchWebsocket.js');
    
    this.worker.onerror=()=>{
      console.log('error in search worker');
    }
     //posting message to the worker
    
    this.worker.onmessage=(e)=>{
      //checking for received object property
      let msg=e.data;
      switch(msg.Action){
        case 'Search_Items':{
          if(msg.hasOwnProperty('Search_Items')){
            this.setState({searchItems:msg.Search_Items});
          }
          break;
        }
        default:break;
      }
    }
  }
  componentWillUnmount(){

  //terminating the worker
    this.worker.terminate();
  }
  render(){
    return(
    <div className="search-comp">
    <div className="search-box">
      <div className="search-input">
        <i className="fas fa-search"></i>
        <input
          type="text" 
          ref={this.search} 
          value={this.state.value} 
          placeholder="Enter Username ..."
          onChange={this.changeValue}/>
        <button onClick={this.removeValue}><i className="fa fa-times"></i></button>
      </div>
      <button onClick={this.searchUser} className="search-button">Search</button>
    </div>
      {this.state.searchItems.length>0?(this.state.searchItems.map((item,index)=>{
        return(<SearchItem searchUser={item} key={index}/>)
      })):(<div className="alternate-text">{this.state.searchText}</div>)}
    </div>
    )
  }
}