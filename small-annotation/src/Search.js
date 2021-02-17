import * as React from "react";
import Autocomplete from '@material-ui/lab/Autocomplete';
import Typography from "@material-ui/core/Typography";
import TextField from '@material-ui/core/TextField';
import {toNormalString,toNiceString} from "./Util";

interface Props {}

interface State {
  value: string;
  suggestions: string[]; 
  definitions: any;
  current_entity: string;
}

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
        
    let current_target = toNormalString(value);
    if (current_target !== "") {
      fetch(
        "/api/autocorrect/" +
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
        }

        this.setState({ suggestions, definitions, current_entity },function() {
          return 0;
        });
       
      });
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
      this.setState({current_entity: toNiceString(current_entity)});
    }
  }

  get_input = () => {   
    return (
      <div>
        <Typography style={{ fontSize: 24 }}>
          {" "}
          Entity Name:{" "}
        </Typography>
        
        
        <Autocomplete
          style={{ fontSize: 24 }}
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
        <div>  <br /> <br /> <br /> <br /> <br />
        {this.state.suggestions.length>0 && 
        <Typography style={{ fontSize: 24, marginTop: 9}}> 
          <b> {this.state.current_entity} </b>: {this.get_definition()}
        </Typography> 
          }
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