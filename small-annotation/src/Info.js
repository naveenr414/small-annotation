import * as React from "react";
import {getCookie,setCookie} from "./Util";
import {Redirect} from 'react-router-dom';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

interface State {

}

let address = "/quel";


export default class Info extends React.Component<Props, State> {
  state: State = {
    username: "",
    leaderboard: [],
  }
  
  get_user_info = () => {
    fetch(
      address+"/user/"+getCookie("token")
      ).then(res=>res.json())
      .then(res => {
        this.setState({username: res['username'],});
      })
  }
  
  get_leaderboard = () => {
        fetch(
      address+"/leaderboard"
      ).then(res=>res.json())
      .then(res => {
        this.setState({leaderboard: res});
      })
  }
  
  componentDidMount = ()=> {
    if(getCookie("token") !== "") {
      this.get_user_info();
      this.get_leaderboard();
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
      <Table aria-label="simple table" style={{width: 500}}>
        <TableHead>
          <TableRow>
            <TableCell><b>Username</b></TableCell>
            <TableCell align="right"><b>Mentions annotated</b></TableCell>
            <TableCell align="right"><b>Questions annotated</b></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {this.state.leaderboard.map((row) => (
            <TableRow key={row[0]}>
              <TableCell component="th" scope="row">
                {row[0]}
              </TableCell>
              <TableCell align="right">{row[1]}</TableCell>
              <TableCell align="right">{row[2]}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

     
    </div>
    
  }
}
