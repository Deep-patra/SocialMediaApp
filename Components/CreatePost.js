import React from "react";
import ReactDOM from "react-dom";
import propType from "prop-types";
import className from "classnames";
import Image from "./image.js";

/*Component to create post*/


export default class CreatePost extends React.Component{
  constructor(props){
    super(props);
    this.textArea=React.createRef();
    this.input=React.createRef();
  }
  state={
    files:[],
    imageData:[]
  }
  //triggering the file input element
  triggerInput=(e)=>{
    console.log('triggerinput called');
    this.input.current.click();
  }
  /*filePromise=(file)=>{
    return new Promise((resolve,reject)=>{
      const fileReader=new FileReader();
      fileReader.onerror=()=>{reject(fileReader.error)};
      fileReader.onloadend=(e)=>{resolve(e.target.result)};
      console.log("promise called");
      fileReader.readAsDataURL(file);
    })
  }*/
  //adding files in the img tag
  addFiles=(e)=>{
    try{
      let arr=[];
      let canvas=document.createElement('canvas');
      canvas.width=200;
      canvas.height=200;
      let ctx=canvas.getContext('2d');
    for(let file of e.target.files){
      
      //console.dir(this.state.files);
      let img=document.createElement('img');
      img.onload=()=>{
        //console.log('image loadded')
        ctx.drawImage(img,0,0,canvas.width,canvas.height);
        this.setState({imageData:this.state.imageData.concat(canvas.toDataURL('image/jpeg',1))});
        //console.log(canvas.toDataURL('image/jpeg',1));
      }
      img.src=URL.createObjectURL(file);
      arr.push(file);
     }
     this.setState({files:arr});
    }
    catch(error){console.log(error)}
  }
  post=(e)=>{
    try{
    if(this.textArea.current.value!='' || this.state.files.length>0){
      this.props.addPost({text:this.textArea.current.value,images:this.state.imageData});
      this.textArea.current.value='';
      this.input.current.files=null;
      this.setState({files:[],imageData:[]});
    }
    }catch(error){console.log(error);}
  }
  render(){
    return(
    <div className="createPost ripple">
    <div className="textarea">
    <textarea ref={this.textArea} placeholder="Write Something...."></textarea>
    <input type="file" ref={this.input} accept=".jpeg,.jpg,.png,.gif" onChange={this.addFiles} multiple/>
    <button className="camera" onClick={this.triggerInput}><i className="fa fa-2x fa-camera"></i></button>
    </div>
    <button className="postButton" onClick={this.post}>POST</button>
    <div className="preview">
    {this.state.files.map((file,index)=>{
      return(<Image file={file} key={index}/>)
    })}
    </div>
    </div>
    )
  }
}
