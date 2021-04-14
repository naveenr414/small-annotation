import * as React from "react";
import {getCookie,setCookie} from "./Util";
import {Redirect} from 'react-router-dom';

interface State {

}

let address = "/quel";


export default class PacketSearch extends React.Component<Props, State> {
  state: State = {
    username: "",
  }
  get_user_info = () => {
    fetch(
      address+"/user/"+getCookie("token")
      ).then(res=>res.json())
      .then(res => {
        this.setState({username: res['username'],});
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
    
    return <div> <h1> {this.state.username} </h1> 
        Packet Search
    </div>
    
  }
}
