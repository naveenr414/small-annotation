import * as React from "react";
import {getCookie,setCookie} from "./Util";
import {Redirect} from 'react-router-dom';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import CircularProgress from '@material-ui/core/CircularProgress';
import {toNormalString,toNiceString} from "./Util";
import Autocomplete from '@material-ui/lab/Autocomplete';


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
    loading: false,
    value: "",
    autocorrect: [],
  }
  
updateAutocorrect = (event: React.ChangeEvent<{}>, value: any) => {
    this.setState({
      value: value,
    });


        
    
    let current_target = toNormalString(value);
    let tagged_word = current_target; 
   
    if (current_target !== "") {
      
      fetch(
        address+"/autocorrect/" +
          current_target
      )
        .then((res) => res.json())
        .then((res) => {
          
          let suggestions = res;
            for(var i = 0;i<suggestions.length;i++) {
              suggestions[i] = toNiceString(suggestions[i][0]+" ");
            }
            
          if(suggestions.length<5 && current_target.length>0) {
            let target_string = "";
            let split_string = current_target.replace(/_$/,'').split("_");
            for(var i = 0;i<split_string.length;i++) {
              target_string+="%2B"+split_string[i];
              if(i+1<split_string.length) {
                target_string+="%20";
              }
            }
            target_string+="&nhits=5";
            fetch("/api/?q="+target_string).then((res2)=>res2.json()).then((res2)=>{
              for(var i = 0;i<5-suggestions.length;i++) {
                if(i<res2["hits"].length) {
                  let name = res2["hits"][i].doc.clean_name;
                  if(!suggestions.includes(name)){
                    suggestions.push(name);
                  }
                  
                }
              }
                            
              for(var i = 0;i<suggestions.length;i++) {
                suggestions[i] = toNiceString(suggestions[i]+" ");
              }
              
              suggestions = Array.from(new Set(suggestions));
              this.setState({ autocorrect: suggestions },function() {
                return 0;
              });
            });
          }
          else {

            
            if(suggestions.length == 0) {
              suggestions = ["No Entity Found"]
            }
            else {
              suggestions.push("No Entity Found");
            }
            this.setState({ autocorrect: suggestions },function() {
              return 0;
            });
          }
          

          
          
        });
    }
    else {
      
       this.setState({ autocorrect: [] });
    }
    

  };
  
  get_results = () => {
    this.setState({loading: true});
        fetch(
      address+"/entity/"+this.state.value.replaceAll(" ","_")+"_"+this.state.category_option+"_"+this.state.difficulty_option
      ).then(res=>res.json())
      .then(res => {
        this.setState({results: res, loading: false});
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
    if (this.state.loading) {
      return  <CircularProgress />

    }
    else if(this.state.results.length == 0) {
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


    return <div style={{marginLeft: 30}}> 
    <h1> Search Entity  </h1>
<br />
          <div style={{marginBottom: 50}}> <Button style={{marginLeft: 30}} variant="contained" ><a href="/user"> Main Menu </a> </Button>
        <Button style={{marginLeft: 30}} variant="contained"><a href="/"> Random Question</a></Button> 
        <Button style={{marginLeft: 30}} variant="contained"><a href="/suggested"> Suggested Question</a></Button> </div>
    <br />
    <b> Entity: </b> 



        <Autocomplete
          style={{ fontSize: 24 }}
          value={this.state.value}
          onInputChange={this.updateAutocorrect}  
          getOptionLabel={(option) => option}
          options={this.state.autocorrect}
          renderInput={(params) => <TextField {...params} label="Entity" 
          />}
          openOnFocus={true}
        />
        <Select id="hello"
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
