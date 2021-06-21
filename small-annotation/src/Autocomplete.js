import * as React from "react";
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import {toNormalString,toNiceString} from './Util';

  let address = "/quel";

export default class AutoComplete extends React.Component<Props, State> {
  
  state: State = {
    value: "",
    autocorrect: [], 
  }

  updateAutocorrect = (event: React.ChangeEvent<{}>, value: any) => {
    this.setState({
      value: value,

    },()=>{this.props.update_value(value)});
    let current_target = toNormalString(value).replace(/_$/,'');
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
  
  render = () => {
    return (<Autocomplete
            style={{ fontSize: 30, width: 400,display: 'inline-block',verticalAlign: 'middle' }}
            value={this.state.value}
            onInputChange={this.updateAutocorrect}  
            getOptionLabel={(option) => option}
            options={this.state.autocorrect}
            renderInput={(params) => <TextField {...params}
            />}
            openOnFocus={true}
          />);
  }
}