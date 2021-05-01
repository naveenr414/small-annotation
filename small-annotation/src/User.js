import * as React from "react";
import {getCookie,setCookie} from "./Util";
import {Redirect} from 'react-router-dom';
import Button from '@material-ui/core/Button';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

interface State {
  username: string;
  edits: any;
  option: string;
  option_open: boolean;
}

let address = "/quel";

const categories = ['Any','Literature', 'Social Science', 'History', 'Science', 'Fine Arts', 'Trash', 'Religion', 'Philosophy', 'Geography', 'Mythology', 'Current Events'];
const difficulties = ['Any','Middle School','High School','College','Open'];


export default class User extends React.Component<Props, State> {
  state: State = {
    username: "",
    edits: [],
    category_option: 'Any',
    difficulty_option: 'Any',
    option_open: false,
    button_clicked: "",
  }
  
  logout = () => {
    setCookie("token","");
    this.setState({username: ""});
  }
  
  get_user_info = () => {
    fetch(
      address+"/user/"+getCookie("token")
      ).then(res=>res.json())
      .then(res => {
        this.setState({username: res['username'],
        edits: res['edits']});
        
        fetch(address+"/category/"+getCookie("token")).then(res=>res.json()).then(res => {
          let temp = res.split("_");
          this.setState({category_option: temp[0],difficulty_option: temp[1]});
        });
        
      })
    
  }
  
  componentDidMount = ()=> {
    if(getCookie("token") !== "") {
      this.get_user_info();
    }
    setCookie("packet","");
    setCookie("entity","");
  }
  
  update_options = () => {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", address+"/user_preferences");
    xhr.send(JSON.stringify(
      {username: getCookie("token"),
      category: this.state.category_option,
      difficulty: this.state.difficulty_option,}));
  }
  
  render() {
    if(getCookie("token") == "") {
      return <Redirect to="/login" />;
    }

        
    return <div> <h2 style={{marginLeft: 50, marginTop: 30}}> User: {this.state.username} </h2> <br />
    
    <div style={{marginLeft: 50}}> 
          
          
      <div style={{marginBottom: 50}}> 

        <Button style={{marginRight: 20}} variant="contained"><a href="/"> Random Question </a> </Button> 
        
        Category: 
        <Select
          style={{marginLeft: 20, marginRight: 20}}
          labelId="demo-simple-select-label"
          value={this.state.category_option}
          onChange={(event)=>{this.setState({category_option:event.target.value, subcategory_option: "Any"},()=>{this.update_options()})}}
        >
          {categories.map((option, index) => (
            <MenuItem
              value={option}
            >
              {option}
            </MenuItem>
          ))}
        </Select>
        
        Difficulty: 
        <Select
          style={{marginLeft: 20, marginRight: 20}}
          labelId="demo-simple-select-label"
          value={this.state.difficulty_option}
          onChange={(event)=>{this.setState({difficulty_option:event.target.value},()=>{this.update_options()}) }}

        >
          {difficulties.map((option, index) => (
            <MenuItem
              value={option}
            >
              {option}
            </MenuItem>
          ))}
        </Select> 

      <Button style={{marginLeft: 30, marginRight: 30}} variant="contained"><a href="/suggested"> Suggested Question</a></Button> 
      <Button style={{marginLeft: 30, marginRight: 30}} variant="contained"><a href="/last"> Most Recent Question</a></Button> 
      </div> 
      <Button style={{marginBottom: 50}} variant="contained" ><a href="/entitysearch"> Search for Entity </a> </Button> <br />
      <Button style={{marginBottom: 50}} variant="contained" ><a href="/packetsearch"> Search by Tournament </a> </Button> <br />
      <Button style={{marginBottom: 50}} variant="contained"><a href="/info"> User stats + Leaderboard </a> </Button> <br />
      <Button style={{marginBottom: 50}} variant="contained" onClick={this.logout}><a href="#"> Logout </a> </Button> 

      </div> 
    
    </div>
    
  }
}
