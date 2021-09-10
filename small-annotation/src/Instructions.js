import * as React from "react";
import Typography from "@material-ui/core/Typography";
import exampleImage from './images/example.png';

interface Props {}

interface State {
}

class Span extends React.Component<Props, State> {
  state: State = {
  }
  
  
  render() {
    return <div> 
      <div style={{textAlign: 'center'}}> <h1> Welcome to Quel! </h1>  <br /> The goal of the app is to study questions through annotation and explore trends in entities. <br /> We detail how to use the app below. </div>
      
      <h2> Studying Questions </h2> 
      Our goal is to annotate all text spans that refer to proper nouns. As an example: 
      <img src={exampleImage} /> <br />
      To annotate, use the following steps: 
      <ol>
        <li> Select and highlight span you wish to tag </li> 
        <li> Select Create Span </li> 
        <li> After you have selected all spans, create entities for each span </li>
        <li> To do this, click Create New Entity Cluster, and drag the appropriate spans </li>
        <li> Drag entity to box corresponding to new entity </li>
        <li> Then set the cluster name, by clicking on edit entity name, searching for the entity, and then clicking save. If no entity is present, then select the “No Entity” option (or "No Entity Literature"/"No Entity Author" if it's a work of literature/an author) within the save window. </li> 
      </ol>
      
      Annotate everything that refers to a proper noun, selecting the longest applicable span of text when multiple are possible, and annotating possesives. 
      More detailed guidelines are available <a target="_blank" href="https://docs.google.com/document/d/1r9iDFMYvu9qn-Du3ytmfE65kGItk9dfiz-RcUKZH0mE/edit?usp=sharing"> here </a>, and a video example is available <a target="_blank" href="https://drive.google.com/file/d/1-AC5NeDfkL8GCLydvzD2bQF8VP0SU6HI/view?usp=sharing">here </a>
      To go to another question, press the random button to get a random question, and the suggested question to have our algorithms suggest a question for you to annotate. 
      

      <h2> Exploring trends in entities </h2> 
      We have three exploration tools which you can access from the Main Menu page. 
      <br />
      <b> Entity Search </b> - Use this tool to find out the prevelance of entities over time, co-occuring entities, and which tournaments an entity occurs in.  <br />
      <b> Tournament Search </b> - Find the most popular entities in a tournament and which questions in a tournament reference an entity. <br /> 
      <b> User stats </b> - View personal statistics, including number of questions annotated, and category/subcategory distribution.  

      <h5> Shortcuts </h5> 
      <ol> 
        <li> To edit a span, click on the span, and then use the left-right keys to move the right endpoint, and the ,-. keys to move the left endpoint </li> 
        <li> To select which entity a selected span belongs to, use the number/letter keys to assign to the matching box. For example, if a span belongs to entity 3, then press 3. </li> 
      </ol>
      

    </div>
  }
}

export default Span
