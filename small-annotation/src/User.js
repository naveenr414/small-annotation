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

const categories = ['Literature', 'Social Science', 'History', 'Science', 'Fine Arts', 'Trash', 'Religion', 'Philosophy', 'Geography', 'Mythology', 'Current Events'];
const subcategories = {'Fine Arts': ['Any', 'Music', 'Art', 'Other', 'Audiovisual', 'Visual', 'Auditory'], 'Literature': ['Any', 'American', 'European', 'World', 'Other', 'British', 'Europe', 'Classic', 'Classical'], 'Mythology': ['Any'], 'Social Science': ['Any', 'Anthropology', 'Philosophy', 'Religion/Mythology', 'Geography', 'Economics', 'Psychology'], 'Current Events': ['Any'], 'Trash': ['Any', 'Other', 'Pop Culture'], 'Philosophy': ['Any'], 'Religion': ['Any'], 'Geography': ['Any'], 'History': ['Any', 'American', 'European', 'World', 'Ancient', 'Other', 'Europe', 'Classic', 'British', 'Classical'], 'Science': ['Any', 'Biology', 'Chemistry', 'Math', 'Physics', 'Astronomy', 'Earth Science', 'Other', 'Computer Science']};


export default class User extends React.Component<Props, State> {
  state: State = {
    username: "",
    edits: [],
    category_option: 'Literature',
    subcategory_option: 'Any',
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
          if(res.includes("_")) {
            let temp = res.split("_");
            this.setState({category_option: temp[0],subcategory_option: temp[1]});
          }
          else {
            this.setState({category_option: res, subcategory_option: "Any"});
          }
        });
        
      })
    
  }
  
  componentDidMount = ()=> {
    if(getCookie("token") !== "") {
      this.get_user_info();
    }
  }
  
  update_options = () => {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", address+"/user_preferences");
    xhr.send(JSON.stringify(
      {username: getCookie("token"),
      category: this.state.category_option,
      subcategory: this.state.subcategory_option,}));
  }
  
  render() {
    if(getCookie("token") == "") {
      return <Redirect to="/login" />;
    }

        
    return <div> <h2 style={{marginLeft: 50, marginTop: 30}}> User: {this.state.username} </h2> <br />
    
    <div style={{marginLeft: 50}}> 
      <Button style={{marginBottom: 50}} variant="contained"><a href="/"> Random Question </a> </Button> <br />
      <div style={{marginBottom: 50}}> 
        <Button variant="contained"><a href="/suggested"> Suggested Question</a></Button> 
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
        <Select
          style={{marginLeft: 20, marginRight: 20}}
          labelId="demo-simple-select-label"
          value={this.state.subcategory_option}
          onChange={(event)=>{this.setState({subcategory_option:event.target.value},()=>{this.update_options()}) }}

        >
          {subcategories[this.state.category_option].map((option, index) => (
            <MenuItem
              value={option}
            >
              {option}
            </MenuItem>
          ))}
        </Select>

      </div> 
      <Button style={{marginBottom: 50}} variant="contained" ><a href="/entitysearch"> Search for Entity </a> </Button> <br />
      <Button style={{marginBottom: 50}} variant="contained" ><a href="/packetsearch"> Search by Tournament </a> </Button> <br />
      <Button style={{marginBottom: 50}} variant="contained"><a href="/info"> User stats </a> </Button> <br />
      <Button style={{marginBottom: 50}} variant="contained" onClick={this.logout}><a href="#"> Logout </a> </Button> 

      </div> 
    
    </div>
    
  }
}
