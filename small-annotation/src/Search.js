import * as React from "react";
import Autocomplete from '@material-ui/lab/Autocomplete';
import Typography from "@material-ui/core/Typography";
import TextField from '@material-ui/core/TextField';
import {toNormalString,toNiceString} from "./Util";

interface Props {update_entity_name: any, entity_number: number}

let timeout_number = -1;
let search_timeout = -1;
let tantivy_timeout = -1;

interface State {
  value: string;
  suggestions: string[]; 
  definitions: any;
  current_entity: string;
}

let address = "/quel";

export default class Search extends React.Component<Props, State> {
  state: State = {
    value: "",
    suggestions: [],
    definitions: {},
    current_entity: "",
  }
  
  update_suggestions = (event: React.ChangeEvent<{}>, value: any) => {   
    this.setState({
      value: value,
    });
    
    if(!(event.nativeEvent instanceof InputEvent)) {
      return;
    }
    
    let current_target = toNormalString(value);
    if (current_target !== "") {
      clearTimeout(search_timeout);
      clearTimeout(tantivy_timeout);
      fetch(
        address+"/autocorrect/" +
          current_target.replace(" ","_")
      )
      .then((res) => res.json())
      .then((res) => {
        let suggestions = [];
        let definitions = {}
        
        for(var i = 0;i<res.length;i++) {
          if (res[i][1]!="") {
            definitions[toNiceString(res[i][0])] = res[i][1];
          }
          suggestions.push(toNiceString(res[i][0]));
        }
        
        let current_entity = "";
        if(definitions!=={}) {
          current_entity = suggestions[0];
          clearTimeout(timeout_number);
          timeout_number = setTimeout(()=>{this.props.update_entity_name( toNiceString(current_entity),this.props.entity_number)},250);
        }

        this.setState({ suggestions, definitions, current_entity },function() {
          return 0;
        });     
      });
      
      tantivy_timeout = setTimeout(()=>{
        if(current_target !== "" && this.state.suggestions.length<8) { 
          fetch(
            "/api/?q="+current_target.replaceAll("_","+")+"&nhits=5"
          )
          .then((res) => res.json())
          .then((res) => { 
res = res['hits']      
          let suggestions = [];
          let definitions = this.state.definitions;
          let num_trials = Math.min(res.length,(8-this.state.suggestions.length));
          for(var i = 0;i<num_trials;i++) {
            if (res[i]['doc']['summary']!="") {
              definitions[toNiceString(res[i]['doc']['name'][0])] = res[i]['doc']['summary'];
            }
            suggestions.push(toNiceString(res[i]['doc']['name'][0]));
          }
          
          if(res.length>0) {
            let current_entity = "";
            if(this.state.current_entity == null ||  this.state.current_entity === "") {
              current_entity = suggestions[0];
              console.log("Updating current_entity with "+current_entity+ " when current entity is "+this.state.current_entity );
              clearTimeout(timeout_number);
              timeout_number = setTimeout(()=>{this.props.update_entity_name( toNiceString(current_entity),this.props.entity_number)},10);
            }
            this.setState({ suggestions: suggestions.concat(this.state.suggestions), definitions, current_entity },function() {
              return 0;
            }); 
          }
          });
      }
    },50);
      
    }
    else {
       this.setState({ suggestions: [],definitions: [] });
    }
  };
  
  
  get_definition = () => {
    if(this.state.current_entity in this.state.definitions){ 
      return this.state.definitions[this.state.current_entity];
    }
    return "";
  }
  
  on_highlight_change = (event: any, current_entity: any, reason: an) => {
    if(current_entity!="") {
      console.log("Setting current entity "+current_entity);
      this.setState({current_entity: toNiceString(current_entity)});
      clearTimeout(timeout_number);
      timeout_number = setTimeout(()=>{this.props.update_entity_name( toNiceString(current_entity),this.props.entity_number)},250);
    }
  }

  get_input = () => {   
    return (
      <div>
        <Typography style={{ fontSize: 24 }}>
          {" "}
          Entity Name:{" "}
        </Typography>
        <div style={{height: 100, marginBottom: 200}}>
        <Typography style={{ fontSize: 24, marginTop: 9}}> 
          <b> {this.state.current_entity} </b>{this.state.suggestions.length>0?':':''} {this.get_definition()}
        </Typography> </div>
          
        <br />
        <Autocomplete
          style={{ fontSize: 24, marginBottom: 50 }}
          value={this.state.value}
          getOptionLabel={(option) => option}
          options={this.state.suggestions}
          renderInput={(params) => <TextField {...params} label="Entity" onKeyDown={this.checkKeyPress} 
          />}
          onInputChange={this.update_suggestions}  
          onChange={(event: any,value: any,reason: any) =>{if(reason === "select-option"  ) {
          this.setState({value: value})}}}
          onHighlightChange={this.on_highlight_change}
          openOnFocus={true}
        />
        <div> 

          </div>
      </div>
    );
    
  };

  
  render() {
    return (
      <div>
        {this.get_input()}
      </div>
    );
  }
}