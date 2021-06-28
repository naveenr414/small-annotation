import * as React from "react";
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

export default class Dropdown extends React.Component<Props,State> {
  state: State = {
    value: this.props.default_value,
  }
  
  render = () => {
    return (<Select
          style={{marginLeft: 20, marginRight: 20, fontSize: this.props.fontSize==undefined?36:this.props.fontSize}}
          labelId="demo-simple-select-label"
          value={this.state.value}
          onChange={(event)=>{this.setState({value:event.target.value},()=>{this.props.update_value(this.state.value)})}}
          >
            {this.props.options!=undefined && this.props.options.map((option, index) => (
              <MenuItem
                value={option}
              >
                {option}
              </MenuItem>
            ))}
          </Select>);
  }
}