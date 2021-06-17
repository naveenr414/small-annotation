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
import { Line } from "react-chartjs-2";


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
    entities: [],
    locations: {},
    year_freq: [],
    all_entities: false,
  }
  
  render_year_freq = () => {
    if(this.state.year_freq.length>0 && !this.state.loading) {
      let years = [];
      for(var i = 2005;i<=2017;i++) {
        years.push(i.toString());
      }
       let data = {
         labels: years,
         datasets: [
           {
            label: "Entity Frequency by Year",
            data: this.state.year_freq,
            fill: true,
            backgroundColor: "rgba(75,192,192,0.2)",
            borderColor: "rgba(75,192,192,1)",
           }
         ]
         };
       return <Line width={1500} height={200} data={data} />;
    }
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
          encodeURIComponent(current_target.replace(" ","_"))
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
  
  render_entities = () => {
    if(this.state.entities.length>0 && !this.state.loading) {
      
      let table = [];
      let i = 0;
      let top = this.state.entities.length;
      if(!this.state.all_entities) {
        top = 4;
      }
      while(i<top){ 
        let temp = [];
        let next = i+4;
        while(i<next) {
          if(i<this.state.entities.length) {
            let entity = this.state.entities[i];
            let elem = (<td style={{textAlign: 'left',marginRight: 60, paddingRight: 60}}> <a target="_blank" href={"https://wikipedia.org/wiki/"+entity.replaceAll(" ","_")}> {entity} </a> 
            <button onClick={()=>{this.setState({value: entity},()=>{this.get_results()})}}> Search </button> </td>);
            temp.push(elem);
          }
           i++;

        }
        
        table.push(<tr> {temp} </tr>);
      }
      
      return <div> Most common co-occurring entities <table>
      {table}
      </table> <br /> 
      <Button style={{'border': '1px solid black'}} onClick={()=>{this.setState({all_entities: !this.state.all_entities})}}>
        {this.state.all_entities? 'Show Less': 'Show More'} 
        </Button> 
      </div> 
    }
  }
  
  get_results = () => {
    this.setState({loading: true, start: 0,all_entities: false});
        fetch(
      address+"/entity/"+this.state.value.replaceAll(" ","_")+"_"+this.state.category_option+"_"+this.state.difficulty_option
      ).then(res=>res.json())
      .then(res => {
        this.setState({results: res['results'], entities: res['entities'],year_freq: res['year_freq'],loading: false, locations:res['locations'] });
        setCookie("entity","");
      })
  }
  
  render_questions = (start,end) => {
    let ret = [];
    let ids = [];
    for(var i = 0;i<this.state.results.length;i++) {
      ids.push(this.state.results[i].id);
    }
      function arrayRotate(arr, n) {
        let dup = arr.slice();
        for(var i = 0;i<n;i++) {
          dup.push(dup.shift());
        }
        return dup;
      }

    for(var i = start;i<end;i++) {
      if(i>=this.state.results.length) {
        return ret; 
      }
      let annotateButton = (<Button style={{marginRight: 30}} onClick={()=>{setCookie("questions",JSON.stringify(arrayRotate(ids,i))); setCookie("packet",""); setCookie("entity",this.state.value.replaceAll("_"," ")+"_"+this.state.category_option+"_"+this.state.difficulty_option); }} variant="contained"><a href="/selected"> Annotate Question</a></Button>);
      let answer = this.state.results[i]['answer'];
      let question_id = this.state.results[i]['id'];
      let loc = this.state.locations[question_id];
      let question_text = this.state.results[i]['question'];
      
      if(loc[0] == -1) {
        answer = (<span style={{backgroundColor: 'yellow'}}> {this.state.results[i]['answer']} </span>);
      } else {
        let begin = question_text.substring(0,loc[0]);
        let middle = question_text.substring(loc[0],loc[1]);
        let end = question_text.substring(loc[1]);
        question_text = (<span> <span> {begin} </span> <span style={{backgroundColor: 'yellow'}}> {middle} </span>  <span> {end} </span> </span>);
      }
      
      
      let question = (<div style={{marginRight: 300, marginBottom: 50}}> 
        <b> Question: </b> {question_text} <br /> <b> Answer: </b> {answer} <br /> <b> Tournament: </b> {this.state.results[i]['tournament']} {this.state.results[i]['year']} <br />
          {annotateButton} </div>);
      ret.push(question);        
    }
    
    return ret;
  }
  
  componentDidMount = () => {
    if(getCookie("entity")!="") {
      let e = getCookie("entity").split("_");
      this.setState({
        value: e[0],
        category_option: e[1],
        difficulty_option: e[2],
      },()=>{this.get_results()});
    }
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
      
      {this.render_questions(this.state.start,this.state.start+questions_per_page)}
<Button style={{'border': '1px solid black'}} onClick={this.decrement}>
                Previous 
          </Button> 
          <Button style={{'border': '1px solid black'}} onClick={this.increment}>
                Next 
          </Button> 
      </div>;
    }
  }
  
  render() {
    if(getCookie("token") == "") {
      return <Redirect to="/login" />;
    }
    
    setCookie("topic","");
    setCookie("random_difficulty_option","");
    setCookie("random_category","");

    return <div style={{marginLeft: 30, marginBottom: 30}}> 
    <h1> Search for an Entity  </h1>
          <div style={{marginBottom: 20}}> <Button variant="contained" ><a href="/user"> Main Menu </a> </Button>
          </div>
          
          <div style={{ display: 'inline-block'}}> 

        <div style={{fontSize: 20}}> 
          Search for a Wikipedia entity to see it's prevelance over time, co-occuring entities, and which questions reference that entity. <br />
          For example, to see what clues come up about Chinua Achebe, search for his name, and annotate questions about him or his books
        </div>

        <Autocomplete
          style={{ fontSize: 24, width: 400, marginBottom: 30, display: 'inline-block', verticalAlign: 'middle', marginRight: 10 }}
          value={this.state.value}
          onInputChange={this.updateAutocorrect}  
          getOptionLabel={(option) => option}
          options={this.state.autocorrect}
          renderInput={(params) => <TextField {...params} label="Entity" 
          style={{layout: 'inline'}}
          onChange={(event: any,value: any,reason: any) =>{if(reason === "select-option"  ) {
          this.setState({value: value},()=>{this.get_results()})}}}
          onKeyDown={({key})=>{if(key=='Enter'){this.get_results()}}} 
          />}
          openOnFocus={true}
        />
        
        <div style={{marginTop: 10, display: 'inline-block'}}> 
        
        Category: 
        
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
        
        Difficulty: 
        
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
        
        </div> 
        
        </div> 
        
        <br /> 
        
        {this.render_year_freq()}
        {this.render_entities()}
    {this.render_results()}
  
        
    </div>
    
  }
}
