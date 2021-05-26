import * as React from "react";
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

interface Props {
  merge_entities: any;
  entity_names: any;
}

interface State {
  merge_one: number;
  merge_two: number;

}

export default class Merge extends React.Component<Props, State> {
  
  state: State = {
    merge_one: 1,
    merge_two: 1,
  }
  
  change_item = (item_num,value) => {
    if(item_num == 1) {
      this.setState({merge_one: value});
    } else {
      this.setState({merge_two: value});
    }
  }
  
  submit = () => {
    this.props.merge_entities(this.state.merge_one,this.state.merge_two);
    this.props.close_merge();
  }
  
  render_select = (choice) => {
    let options = [];
    for(var i = 0;i<this.props.entity_names.length;i++) {
      console.log(i);
      if(i!=0) {
        options.push(<MenuItem value={i}> {i}: {this.props.entity_names[i].replaceAll("_"," ")} </MenuItem>);
      }
    }
    
    let num = this.state.merge_one;
    if(choice == 2) { 
      num = this.state.merge_two;
    }
    
    return <Select style={{marginRight: 20, marginLeft: 20}} value={num} onChange={(event)=>{this.change_item(choice,event.target.value)}}> {options} </Select>
  }
  
  render = () => {
    return <div> Merge {this.render_select(1)} into {this.render_select(2)} <button onClick={this.submit}> Merge </button> </div>
  }
 
}