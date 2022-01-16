import React from "react";
import ReactDOM from "react-dom";
import propType from "prop-types";
import className from "classnames";
import Home from "./Components/home.js"
import {BrowserRouter} from "react-router-dom";
import Main from "./Components/main.js";
import API from "./Components/fetch.js";


class App extends React.Component{
  state={
    authorized:false
  }
  authorizedUser=()=>{
    this.setState({authorized:!this.state.authorized});
  }
  conponentDidMount(){
    API.getAuth()
    .then(res=>{
      if(res.status==201){this.setState({authorized:true});}
      return;
    })
    .catch(error=>{console.log(error);})
  }
  render(){
    return(
      <BrowserRouter>
        {this.state.authorized?(<Main authorizedUser={this.authorizedUser}/>):(<Home authorizedUser={this.authorizedUser}/>)}
      </BrowserRouter>
      )
  }
}

ReactDOM.render(<App/>,document.getElementById('react-app'));