import React from "react";
import ReactDOM from "react-dom";
import propType from "prop-types";
import className from "classnames";

export default class Notify extends React.Component{
  static proptypes={
    text:propType.String,
    removeNotify:propType.func
  }
  constructor(props){
    super(props);
    this.notify=React.createRef();
  }
  componentDidMount(){
   window.setTimeout(()=>{this.notify.current.animate([
      {transform:'translateX(0px)'},
      {transform:'translateX(300px)'}
      ],
       {
        duration:300,
        fill:'forwards',
        easing:'ease-in-out'
       }
    );
   },5000);
   window.setTimeout(()=>{
     this.props.removeNotify();
   },5250)
  }
  render(){
    return(
      <div className="notify" ref={this.notify}>
        <div className="cross-button">
          <button onClick={this.props.removeNotify}><i className="fa fa-lg fa-times" aria-hidden="true"></i></button>
        </div>
        <div className="notify-text">
          {this.props.text}
        </div>
      </div>
    )
  }
}