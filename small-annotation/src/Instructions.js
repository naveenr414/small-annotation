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
      
      <h2> Basic Steps </h2> 
      <ol>
        <li> Select and highlight span you wish to tag </li> 
        <li> Select Create Span </li> 
        <li> After you have selected all spans, create entities for each span </li>
        <li> To do this, click Create New Entity Cluster, and drag the appropriate spans </li>
        <li> Drag entity to box corresponding to new entity </li>
        <li> Then set the cluster name, by clicking on edit entity name, searching for the entity, and then clicking save. If no entity is present, then select the “No Entity” option (or "No Entity Literature"/"No Entity Author" if it's a work of literature/an author) within the save window. </li> 
      </ol>
      
      <h2> Shortcuts </h2> 
      <ol> 
        <li> To edit a span, click on the span, and then use the a-d keys to move the left endpoint, and the s-w keys to move the right endpoint </li> 
        <li> To select which entity a selected span belongs to, use the number keys to assign to the matching box. For example, if a span belongs to entity 3, then press 3. </li> 
      </ol>
      
      <h2> Exploration tools </h2> 
      We have three exploration tools which you can access from the Main Menu page. 
      <br />
      <b> Entity Search </b> - Find which questions a particular entity is mentioned in <br />
      <b> Tournament Search </b> - Find which entities appear in a tournament, and which questioins in a tournament contain some entity. <br /> 
      <b> User stats </b> - View user statistics, including #questions annotated, and which topics these questions came from 
      
    </div>
  }
}

export default Span
