import * as React from "react";
import {getCookie,setCookie} from "./Util";
import {Redirect} from 'react-router-dom';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import {Bar} from 'react-chartjs-2';
import Button from '@material-ui/core/Button';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import CircularProgress from '@material-ui/core/CircularProgress';


interface State {

}

let address = "/quel";

const categories = ['Any','Literature', 'Social Science', 'History', 'Science', 'Fine Arts', 'Trash', 'Religion', 'Philosophy', 'Geography', 'Mythology', 'Current Events'];


export default class Info extends React.Component<Props, State> {
  state: State = {
    username: "",
    category_option: "Any",
    categories: {},
    leaderboard: [],
    loading_text: "",
    leaderboard_loading: false,
  }
  
  get_top_categories = () => {
        fetch(
      address+"/topics/"+getCookie("token")
      ).then(res=>res.json())
      .then(res => {
        this.setState({categories: res,});
      })
  }
  
  get_user_info = () => {
    fetch(
      address+"/user/"+getCookie("token")
      ).then(res=>res.json())
      .then(res => {
        this.setState({username: res['username']},()=>{this.get_top_categories();});
      })
  }
  
  get_leaderboard = () => {
    this.setState({leaderboard_loading: true});
        fetch(
      address+"/leaderboard"
      ).then(res=>res.json())
      .then(res => {
        this.setState({leaderboard: res,leaderboard_loading: false});
      })
  }
  
  componentDidMount = ()=> {
    if(getCookie("token") !== "") {
      this.get_user_info();
      this.get_leaderboard();

    }
  }
  
  download_questions = () => {
    this.setState({loading_text: "Loading PDF"});
    fetch(
      address+"/pdf/"+getCookie("token")+"_"+this.state.category_option
      ).then(res => {
        return res.blob();
      })
      .then((blob)=>{
        this.setState({loading_text: ""});
        const href = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = href;
        a.download = 'question.pdf';
        a.click();
      });
  }
  
  render_chart = () => {
    let data = {labels: Object.keys(this.state.categories).concat(['']),
  datasets: [
    {
      label: 'Questions',
      backgroundColor: 'rgba(75,192,192,1)',
      borderColor: 'rgba(0,0,0,1)',
      borderWidth: 2,
      data: Object.values(this.state.categories).concat([0]),
    }
    ]};
    
    
    return      <Bar
          data={data}
          options={{
            title:{
              display:true,
              text:'Questions viewed by Category',
              fontSize:20
            },
            legend:{
              display:true,
              position:'right'
            }
          }}
        />
  }
  
  get_info = () => {
    if(this.state.leaderboard_loading) {
      return <CircularProgress />;
    }
    else {
      return <div> 
                {this.state.loading_text!=''?<CircularProgress />:''}

       <br /> 
       <b> Leaderboard </b>
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
      {this.render_chart()}
      </div>
    }
  }
  
  render() {
    if(getCookie("token") == "") {
      return <Redirect to="/login" />;
    }

 
    return <div style={{marginLeft: 30}}> <h1> {this.state.username} </h1> <br />
          <div style={{marginBottom: 50}}> <Button style={{marginLeft: 30}} variant="contained" ><a href="/user"> Back </a> </Button>
        <Button style={{marginLeft: 30}} variant="contained"><a href="/"> Random Question</a></Button> 
        <Button style={{marginLeft: 30}} variant="contained"><a href="/suggested"> Suggested Question</a></Button> </div>
   
   <br />
      <button onClick={this.download_questions}> Download PDF </button> 
                   <Select
          style={{marginLeft: 20, marginRight: 20}}
          labelId="demo-simple-select-label"
          value={this.state.category_option}
          onChange={(event)=>{this.setState({category_option:event.target.value})}}
        >
          {categories.map((option, index) => (
            <MenuItem
              value={option}
            >
              {option}
            </MenuItem>
          ))}
        </Select>

      <br /> <br />
        {this.get_info()}
   </div>
    
  }
}
