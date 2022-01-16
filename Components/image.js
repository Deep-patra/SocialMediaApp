import React from "react";
import ReactDOM from "react-dom";
import propType from "prop-types";
import className from "classnames";

export default class Image extends React.Component{
  constructor(props){
    super(props);
    this.image=React.createRef();
  }
  componentDidMount(){
    this.image.current.src=URL.createObjectURL(this.props.file);
    this.image.current.onload=(e)=>{URL.revokeObjectURL(e.target.src)}
  }
  render(){
    return(
      <img ref={this.image}/>
      )
  }
}