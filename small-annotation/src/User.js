import * as React from "react";
import {getCookie,setCookie} from "./Util";
import {Redirect} from 'react-router-dom';

interface State {
  username: string;
  edits: any;
}

let address = "/quel";

export default class User extends React.Component<Props, State> {
  state: State = {
    username: "",
    edits: [],
  }
  
  get_user_info = () => {
    fetch(
      address+"/user/"+getCookie("token")
      ).then(res=>res.json())
      .then(res => {
        this.setState({username: res['username'],
        edits: res['edits']});
      })
  }
  
  componentDidMount = ()=> {
    if(getCookie("token") !== "") {
      this.get_user_info();
    }
  }
  
  render() {
    if(getCookie("token") == "") {
      return <Redirect to="/login" />;
    }
    
    return <div> {this.state.username} {' '} {this.state.edits.length} </div>
    
  }
}
