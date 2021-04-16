import * as React from "react";
import {getCookie,setCookie} from "./Util";
import {Redirect} from 'react-router-dom';

interface State {

}

let address = "/quel";


export default class Info extends React.Component<Props, State> {
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
  
  download_questions = () => {
    fetch(
      address+"/pdf/"+this.state.username
      ).then(res => {
        return res.blob();
      })
      .then((blob)=>{
        const href = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = href;
        a.download = 'question.pdf';
        a.click();
      });
  }
  
  render() {
    if(getCookie("token") == "") {
      return <Redirect to="/login" />;
    }
    
    return <div style={{marginLeft: 30}}> <h1> {this.state.username} </h1> <br />
      <button onClick={this.download_questions}> Download PDF </button>
        
    </div>
    
  }
}
