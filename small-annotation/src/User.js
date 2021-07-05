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
    advanced_year: "Any",
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
    fetch(
      address+"/random_question/"+this.state.category_option+"_"+this.state.random_difficulty_option
      ).then(res=>res.json())
      .then(res => {
        setCookie("questions",JSON.stringify(res));
        setCookie("main","true");
        this.setState({});
      });
    
  }
  
  explore_random_tournament = () => {
    setCookie("tournament_option",this.state.tournament_option);
    setCookie("year_option",this.state.year_option);
    setCookie("difficulty_option",this.state.difficulty_option);
    this.setState({});
  }
  
  advanced_search = () => {
    if(this.state.advanced_value!="") {
      setCookie("topic",this.state.advanced_value);
      setCookie("tournament_option",this.state.advanced_tourament);
      setCookie("year_option",this.state.advanced_year);
      setCookie("difficulty_option", this.state.advanced_difficulty);
      setCookie("category_option",this.state.advanced_category);
      this.setState({});
    }
  }
  
  render() {
    if(getCookie("token") == "") {
      return <Redirect to="/login" />;
    }
        
    if(getCookie("topic")!="" && (getCookie("year_option")==="Any" || getCookie("year_option") == "")) {
      return <Redirect to="/entitysearch" />
    } else if(getCookie("year_option")!=="Any" && getCookie("year_option")!=="") {
      return <Redirect to="/packetsearch" />
    } else if(getCookie("questions") !== "") {
      return <Redirect to="/selected" /> 
    }

    
    return (<div> 
    
    <div style={{marginTop: 20, marginLeft: 50, marginBottom: 30, fontSize: 30}}> 
      <header> <span> 
        <a href="/"  style={{fontSize: 60, color: "black", textDecoration: 'none'}}> QUEL </a> </span> <span style={{fontSize: 16}}> Entity and topic exploration made easy 
      </span> <span style={{float: 'right',marginTop: 20, marginRight: 50, fontSize: 24}}> <a href="/info"> Personal Stats </a> </span> </header>
      
      <div style={{marginBottom: "2%"}}> Allowing Quizbowl players to explore 
        <span style={{color: 'blue', fontSize: 40}}> {this.state.random_topic} </span> 
      </div> 
      
      <div> What would you like to explore? </div>
      
      <div style={{marginBottom: "2%"}}> <span style={{marginRight: 20}}> I would like to explore </span>
        <AutoComplete update_value={(value)=>{this.setState({value})}} on_enter={this.explore_topic} />      
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
        Explore 

        <Dropdown update_value={(difficulty_option)=>{this.setState({difficulty_option:difficulty_option, tournament_option: undefinedOrEmpty(tournaments[difficulty_option][this.state.year_option])})}} default_value={"High School"} options={difficulties} /> 
        questions from 
        
        <Dropdown update_value={(year_option)=>{this.setState({year_option})}} default_value={"2015"} options={Object.keys(tournaments[this.state.difficulty_option])} /> 
        <Dropdown update_value={(tournament_option)=>{this.setState({tournament_option})}} default_value={"Maryland Fall"} options={undefinedOrEmpty(tournaments[this.state.difficulty_option][this.state.year_option])} />      
       
        <Button style={{marginLeft: 20}} onClick={this.explore_random_tournament} variant="contained" color="primary"> Go! </Button>        
      </div>

      <div style={{color: 'blue', cursor: 'pointer', textDecoration: 'underline'}} onClick={()=>{this.setState({advanced_search: !this.state.advanced_search})}}> Advanced Search </div>
      
      {this.state.advanced_search && 
        <div>
          Topic (blank for any topic): <AutoComplete on_enter={this.advanced_search} update_value={(advanced_value)=>{this.setState({advanced_value})}} />    
          <br />
          Difficulty: <Dropdown update_value={(advanced_difficulty)=>{this.setState({advanced_difficulty})}} default_value={"High School"} options={difficulties} />  <br />
          Category: <Dropdown update_value={(advanced_category)=>{this.setState({advanced_category})}} default_value={"Literature"} options={categories} /> 
                         
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
