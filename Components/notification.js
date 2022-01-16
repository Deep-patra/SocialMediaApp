import React from "react";
import ReactDOM from "react-dom";
import propType from "prop-types";
import className from "classnames";

class Item extends React.Component{
  static defaultProps={
    text:'text not found',
    time:`${(new Date()).getHours()}:${(new Date()).getMinutes()}`
  };
  render(){
    return(
      <div className="notification-item">
      <p>{this.props.text}</p>
      <span>{this.props.time}</span>
      </div>
    )
  }
}


export default class Notification extends React.Component{
  constructor(props){
    super(props);
    this.closeButton=React.createRef();
  }
  static proptypes={
    notification:propType.array,
    openNotification:propType.func
  };
  static defaultProps={
    notification:[]
  };
  closeNotification=(e)=>{
    this.props.openNotification();
  }
  render(){
    return(
      <div className="notification">
        <div className="notification-heading">
          <span>Notification</span>
          <button ref={this.closeButton}><i className="fa fa-times" aria-hidden="true"></i></button>
        </div>
        <div className="notification-list">
        {this.props.notification.length>0?(
        this.props.notification.map((item,index)=>{
          return <Item text={item.text} time={item.time} key={index}/>
        })
        ):(<div className="alternate-text">No notifications yet!</div>)}
        </div>
      </div>
    )
  }
}