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
        <li> Select Create Span </li> 
        <li> After you have selected all spans, create entities for each span </li>
        <li> To do this, click Create New Entity Cluster, and drag the appropriate spans </li>
        <li> Drag entity to box corresponding to new entity </li>
        <li> Then set the cluster name, by clicking on edit entity name, searching for the entity, and then clicking save. If no entity is present, then select the “No Entity” option within the save window. </li> 
      </ol>
    </div>
  }
}

export default Span
