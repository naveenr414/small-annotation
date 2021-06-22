import * as React from "react";
import {getCookie,setCookie, undefinedOrEmpty} from "./Util";
import {Redirect} from 'react-router-dom';
import Button from '@material-ui/core/Button';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { Input } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import {toNormalString,toNiceString, categories, tournaments, difficulties,random_topics} from "./Util";
import AutoComplete from './Autocomplete';
import Dropdown from './Dropdown';

interface State {
}

let address = "/quel";

export default class User extends React.Component<Props, State> {
  state: State = {
    random_topic: "",
    advanced_value: "",
    value: "",
    advanced_search: false,
    category_option: categories[1],
    random_difficulty_option: 'High School',
    difficulty_option: 'High School',
    year_option: 2015,
    tournament_option: 'Maryland Fall',
    button_clicked: "",
    advanced_difficulty: 'High School',
    advanced_year: 2015,
    advanced_category: 'Literature',
    advanced_tournament: 'Maryland Fall',
  }
  
  logout = () => {
    setCookie("token","");
  }
  
  componentDidMount = ()=> {
    setCookie("packet","");
    setCookie("entity","");
    
    let random_topic = random_topics[Math.floor(Math.random()*random_topics.length)];
    this.setState({random_topic});
  }
  
  explore_topic = () => {
    if(this.state.value!="") {
      setCookie("topic",this.state.value);
      this.setState({});
    }
  }
  
  explore_random_category = () => {
    setCookie("random_category",this.state.random_category);
    setCookie("random_difficulty_option",this.state.random_difficulty_option);
    this.setState({});
  }
  
  explore_random_tournament = () => {
    setCookie("tournament_option",this.state.tournament_option);
    setCookie("year_option",this.state.year_option);
    setCookie("difficulty_option",this.state.difficulty_option);
    this.setState({});
  }
  
  advanced_search = () => {
    
  }
  
  render() {
    if(getCookie("token") == "") {
      return <Redirect to="/login" />;
    }
    
    if(getCookie("topic")!="") {
      return <Redirect to="/entitysearch" />
    }
    else if(getCookie("random_difficulty_option")!=="") {
      //return <Redirect to="/entitysearch" />
    }
    else if(getCookie("tournament_option")!=="") {
      return <Redirect to="/packetsearch" />
    }
    
    return (<div> 
    
    <div style={{marginTop: 20, marginLeft: 50, marginBottom: 30, fontSize: 30}}> 
      <header> <span> 
        <a href="/"  style={{fontSize: 60, color: "black", textDecoration: 'none'}}> QUEL </a> </span> <span style={{fontSize: 16}}> Entity and topic exploration made easy 
      </span> </header>
      
      <div style={{marginBottom: "2%"}}> Allowing Quizbowl players to explore 
        <span style={{color: 'blue', fontSize: 40}}> {this.state.random_topic} </span> 
      </div> 
      
      <div> What would you like to explore? </div>
      
      <div style={{marginBottom: "2%"}}> I would like to explore 
        <AutoComplete update_value={(value)=>{this.setState({value})}} />      
        <Button style={{marginLeft: 20}} onClick={this.explore_topic} variant="contained" color="primary"> Go! </Button>
      </div>
      
      <div style={{marginBottom: "1%"}}> 
        Not sure what to explore? <br />
        Try a random 
        <Dropdown update_value={(category_option)=>{this.setState({category_option})}} default_value={"Literature"} options={categories} />        
        question at 
        <Dropdown update_value={(random_difficulty_option)=>{this.setState({random_difficulty_option})}} default_value={"High School"} options={difficulties} /> 
        difficulty 
        <Button style={{marginLeft: 20}} onClick={this.explore_random_category} variant="contained" color="primary"> Go! </Button> <br /> 
        Or a random question at

        <Dropdown update_value={(difficulty_option)=>{this.setState({difficulty_option:difficulty_option, tournament_option: undefinedOrEmpty(tournaments[difficulty_option][this.state.year_option])})}} default_value={"High School"} options={difficulties} /> 
        difficulty from
        
        <Dropdown update_value={(year_option)=>{this.setState({year_option})}} default_value={"2015"} options={Object.keys(tournaments[this.state.difficulty_option])} /> 
        <Dropdown update_value={(tournament_option)=>{this.setState({tournament_option})}} default_value={"Maryland Fall"} options={undefinedOrEmpty(tournaments[this.state.difficulty_option][this.state.year_option])} />      
       
        <Button style={{marginLeft: 20}} onClick={this.explore_random_tournament} variant="contained" color="primary"> Go! </Button>        
      </div>

      <div style={{color: 'blue', cursor: 'pointer', textDecoration: 'underline'}} onClick={()=>{this.setState({advanced_search: !this.state.advanced_search})}}> Advanced Search </div>
      
      {this.state.advanced_search && 
        <div>
          Topic (blank for any topic): <AutoComplete update_value={(advanced_value)=>{this.setState({advanced_value})}} />    
          <br />
          Difficulty: <Dropdown update_value={(advanced_difficulty)=>{this.setState({advanced_difficulty})}} default_value={"High School"} options={difficulties} />  <br />
          Category: <Dropdown update_value={(advanced_category)=>{this.setState({advanced_category})}} default_value={"Literature"} options={categories} />  <br />
              
         Tournament: 
         <Dropdown update_value={(advanced_year)=>{this.setState({advanced_year})}} default_value={2015} options={Object.keys(tournaments[this.state.advanced_difficulty])} />
         <Dropdown update_value={(advanced_tournament)=>{this.setState({advanced_tournament})}} default_value={"Maryland Fall"} options={undefinedOrEmpty(tournaments[this.state.advanced_difficulty][this.state.advanced_year])} />
           
          <Button style={{marginLeft: 20}} onClick={this.advanced_search} variant="contained" color="primary"> Go! </Button>
        </div>
      }
      <div style={{textAlign: 'center', fontSize: 48}}> 
        Explore questions and <a target="_blank" href="https://docs.google.com/document/d/1ndk13ZvBAezTlb_z1QofvJg8qmlOCRvgm3fY9ExcBaA/edit?usp=sharing"> Win Prizes! </a> 
      </div>
      </div> 
    
    </div>);
    
  }
}
