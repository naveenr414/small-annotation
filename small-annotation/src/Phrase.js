import * as React from "react";
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import Typography from "@material-ui/core/Typography";

let address = "/api"

interface Props {
  id: int;
  left_context: string;
  content: string;
  right_context: string;
  update_info: any;
  annotation: string;
  is_nel: boolean;
  update_description: any;
}

interface State {
  annotation: string;
  is_nel: boolean;
  autocorrect: string;
  timeout: any;
  highlight_timeout: any;
}

export default class Phrase extends React.Component<Props, State> {
  state: State = {
    annotation: this.props.annotation,
    is_nel: this.props.is_nel,
    autocorrect: [],
    descriptions: [],
    timeout: -1,
    highlight_timeout:-1,
  }
 
 
  get_autocorrect = () => {
    if(this.state.annotation.length>3) {
      fetch(address+"/autocorrect/"+this.state.annotation.toLowerCase()).then((res) => res.json())
      .then((res) => {
        let l = [];
        
        let m = [];
        for(var i = 0;i<res.length;i++)
        {
          l.push(res[i][0]);
          m.push(res[i][1]);
        }
        this.setState({autocorrect: l,descriptions: m},()=>{this.props.update_description(l[0],this.get_description(l[0]))});
      });
    }
  }
  
  
  get_description = (value: string) => {
    for(var i = 0;i<this.state.descriptions.length;i++) {
      if(value!==null && this.state.autocorrect.length>i && this.state.autocorrect[i]!==null ** this.state.autocorrect[i] !== undefined && this.state.autocorrect[i].toLowerCase() == value.toLowerCase()) {
        return this.state.descriptions[i];
      }
    }
    
    return "";
  }
  
  updateAutocorrect = (event: React.ChangeEvent<{}>, value: any) => {

    clearTimeout(this.state.timeout);
    let s =  setTimeout(() => {
        this.get_autocorrect();
        this.props.update_info(this.props.id,this.state.annotation,this.state.is_nel); 
  }, 300);
  this.setState({timeout: s, annotation: value});
    

    
  }
  
  
  updateHighlight = (value: any) => {
    clearTimeout(this.state.highlight_timeout);
    let s =  setTimeout(() => {
    this.props.update_description(value,this.get_description(value))}, 300);
  this.setState({highlight_timeout: s});
    

    
  }
  
  render() {
    return (<div style={{textAlign: "left", fontSize: 20}}> 
 
      {this.props.left_context} <b> {this.props.content} </b> {this.props.right_context} &nbsp; 
      <input style={{height: 20}} label="Named Entity?" type="checkbox" 
        onChange={(event)=>{this.setState({is_nel:event.target.checked},()=>{this.props.update_info(this.props.id,this.state.annotation,this.state.is_nel)})}} checked={this.state.is_nel}/>  
      <Autocomplete
          style={{ fontSize: 24, width: "20%", paddingTop: 20 }}
          value={this.state.annotation}
          onInputChange={this.updateAutocorrect}  
          getOptionLabel={(option) => option}
          options={this.state.autocorrect}
          renderInput={(params) => <TextField {...params} label="Entity" 

          />}
                    onChange={(event: any,value: any,reason: any) =>{if(reason === "select-option") {
          this.setState({value: value});}}}
          onHighlightChange={(event: any, value: any, reason: any) => {if(value!=="" && value!==undefined) {this.updateHighlight(value);}}}

          openOnFocus={true}
          /> <br /> <br />
 </div>
        );
  }
}
