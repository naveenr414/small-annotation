 import * as React from "react";
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import Typography from "@material-ui/core/Typography";

let address = "http://127.0.0.1:1234"

interface Props {
  text: string;
  add_entity: boolean;
  callback: any;
  num: number;
}

interface State {
  backgroundColor: string;
}

export default class Word extends React.Component<Props, State> {
  state: State = {
    backgroundColor: "white",
  }
 
 
  clicked = () => {
    
    if(this.props.add_entity) {
      this.setState({backgroundColor: 'red'});
      this.props.callback(this.props.num);
    }
  }
  
  componentDidUpdate = (prevProps) => {
    if(prevProps.add_entity == true && this.props.add_entity == false) {
     this.setState({backgroundColor: 'white'}); 
    }
  }
  
  mouse_enter = () => {
    if(this.props.add_entity && this.state.backgroundColor !== 'red') {
      this.setState({backgroundColor: 'yellow'});
    }
  }

  mouse_leave = () => {
    if(this.props.add_entity && this.state.backgroundColor !== 'red') {
      this.setState({backgroundColor: 'white'});
    }
  }
  
  render() {
    return (<span style={{backgroundColor: this.state.backgroundColor}} onMouseDown={this.clicked} onMouseUp={this.clicked}  onMouseEnter={this.mouse_enter} onMouseLeave={this.mouse_leave}> 
      {this.props.text}
  </span>
        );
  }
}
