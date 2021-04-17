 import * as React from "react";
import {getCookie,setCookie} from "./Util";
import {Redirect} from 'react-router-dom';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';


interface State {

}

let address = "/quel";
const categories = ['Any','Literature', 'Social Science', 'History', 'Science', 'Fine Arts', 'Trash', 'Religion', 'Philosophy', 'Geography', 'Mythology', 'Current Events'];
const difficulties = ['Any','Middle School','High School','College','Open'];

let questions_per_page = 5;

export default class EntitySearch extends React.Component<Props, State> {
  state: State = {
    username: "",
    category_option: "Any",
    difficulty_option: "Any",
    search_entity: "",
    results: [],
    start:0,
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
  
  get_results = () => {
        fetch(
      address+"/entity/"+this.state.search_entity.replaceAll(" ","_")+"_"+this.state.category_option+"_"+this.state.difficulty_option
      ).then(res=>res.json())
      .then(res => {
        this.setState({results: res});
      })
  }
  
  render_questions = (start,end) => {
    let ret = [];
    for(var i = start;i<end;i++) {
      if(i>=this.state.results.length) {
        return ret; 
      }
      ret.push(<div style={{width: 500, marginBottom: 50}}> <b> Question: </b> {this.state.results[i]['question']} <br /> <b> Answer: </b> {this.state.results[i]['answer']} <br /> <b> Tournament: </b> {this.state.results[i]['tournament']} </div>);
                
    }
    
    return ret;
  }
  
  decrement = () => {
    if(this.state.start-questions_per_page>=0){
      this.setState({start: this.state.start-questions_per_page});
    }
  }
  
  increment = () => {
    if(this.state.start+questions_per_page<=this.state.results.length ){ 
      this.setState({start: this.state.start+questions_per_page});
    }
  }
  
  render_results = () => {
    if(this.state.results.length == 0) {
      return <div> No results found </div> 
    }
    else {
      return <div> 
        <div> Showing {this.state.start+1}-{Math.min(this.state.start+questions_per_page,this.state.results.length)} of {this.state.results.length} </div>  
          <Button style={{'border': '1px solid black'}} onClick={this.decrement}>
                Previous 
          </Button> 
          <Button style={{'border': '1px solid black'}} onClick={this.increment}>
                Next 
          </Button> 
      
      {this.render_questions(this.state.start,this.state.start+questions_per_page)} </div>;
    }
  }
  
  render() {
    if(getCookie("token") == "") {
      return <Redirect to="/login" />;
    }
    
    return <div style={{marginLeft: 30}}> <h1> Search Entity  </h1>
<br />
    <b> Entity: </b>  <TextField id="standard-basic" onChange={(event)=>{this.setState({search_entity: event.target.value})}} /> Category:  
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
        <Select
          style={{marginLeft: 20, marginRight: 20}}
          labelId="demo-simple-select-label"
          value={this.state.difficulty_option}
          onChange={(event)=>{this.setState({difficulty_option:event.target.value})}}

        >
          {difficulties.map((option, index) => (
            <MenuItem
              value={option}
            >
              {option}
            </MenuItem>
          ))}
        </Select>
        <Button style={{'border': '1px solid black'}} onClick={this.get_results}>
          Search 
        </Button> 
        
        <br /> 
        

    {this.render_results()}
  
        
    </div>
    
  }
}
