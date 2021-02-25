import * as React from "react";
import Typography from "@material-ui/core/Typography";

interface Props {}

interface State {
}

class Span extends React.Component<Props, State> {
  state: State = {
  }
  
  
  render() {
    return <div> 
      <h1 style={{textAlign: 'center'}}> Instructions </h1> 
      <ol>
        <li> Select and highlight span you wish to tag </li> 
        <li> Select annotate span </li> 
        <li> Click add entity </li>
        <li> Drag entity to box corresponding to new entity </li>
        <li> Click edit, and set the name for that entity. If no entity is present, then select the “No Entity” option. </li> 
      </ol>
    </div>
  }
}

export default Span
