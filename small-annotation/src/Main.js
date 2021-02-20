import * as React from "react";
import Dragbox from "./Dragbox";
import Search from "./Search";
import Grid from "@material-ui/core/Grid";
import Switch from '@material-ui/core/Switch';
import {Editor, RichUtils,EditorState, ContentState} from 'draft-js';
import 'draft-js/dist/Draft.css';
import {DraggableArea,DraggableAreasGroup} from 'react-draggable-tags';
import {all_but_first,getSelectionCharacterOffsetsWithin} from './Util';

let address = "/api";
const group = new DraggableAreasGroup();

const customStyleMap = {
  redBackground: {
  	backgroundColor: 'red'
  },
  underlined: {
    textDecoration: 'underline',
    fontSize: 26
  },
};


interface Props {}

interface State {
  questions: any;
  answers: any;
  current_question: number;
  noun_phrases: string[];
  annotations: any;
  checked: any;
  current_entity: string;
  description: string;
  name: string;
  start: number;
  end: number;
  saved: boolean;
  editorState: any;
  entity_list: any;
}

export default class Main extends React.Component<Props, State> {
  state: State = {
    questions: [],
    answers: [],
    current_question: 0,
    noun_phrases: [],
    annotations: {},
    checked: {},
    current_entity: "",
    description: "",
    name: "",
    add_entity: false,
    start: -1, 
    end: -1,
    saved: true,
    editorState: EditorState.createEmpty(),
    entity_list: [],
  }
      
  componentDidMount = () => {
    let name = prompt("What's your name").toLowerCase();
    this.setState({name},()=>{    this.get_questions();
    this.get_noun_phrases();});
    this.create_new_entity();
  }
  
  get_questions = () => {
    fetch(
      address+"/questions"
      )
      .then((res) => res.json())
      .then((res) => this.setState({questions:res['questions'],answers:res['answers'],editorState: EditorState.createWithContent(ContentState.createFromText(res['questions'][this.state.current_question]))}));
  }
  
  get_noun_phrases = () => {
    fetch(
      address+"/noun_phrases/"+this.state.current_question.toString()+"_"+this.state.name
      )
      .then((res) => res.json())
      .then((res) => this.setState({noun_phrases:res,annotations:res['formatted_annotations'],checked: res['formatted_checked']},()=>{this.setState({noun_phrases: this.state.noun_phrases})}));
  }
  
  componentDidUpdate = (prevProps, prevState) => {
    if(prevState.current_question != this.state.current_question) {
      this.get_noun_phrases();
    }
  }

  update_entity_tags = (tags,number) => {
    let entity_list = this.state.entity_list.slice();
    entity_list[number] = tags;
    this.setState({entity_list});
  }
  
  create_new_entity = () => {
    let entity_list = this.state.entity_list.slice();
    entity_list.push([]);
    this.setState({entity_list});
  }
  
  create_tag = () => {
    let range = getSelectionCharacterOffsetsWithin(document.getElementById("main_text"));
    let start = range.start-1;
    let end = range.end-1;
    if(start-end == 0) {
      alert("No selection selected");
    }
    else {   
      let real_start = 0;
      let real_end = 10;
      let start_word_num = 0;
      let end_word_num = 1;
      
      for(var i = 0;i<this.state.noun_phrases.indices.length;i++) {
        if(this.state.noun_phrases.indices[i]<=start) {
          real_start = this.state.noun_phrases.indices[i];
          start_word_num = i;
        }
      }
      
      for(var i = this.state.noun_phrases.indices.length-1;i>=0;i--) {
        if(this.state.noun_phrases.indices[i]>end && i!=0) {
          real_end = this.state.noun_phrases.indices[i-1]+this.state.noun_phrases.words[i-1].length;
          end_word_num = i-1;
        }
      }
      
      const entity_list = this.state.entity_list.slice();
      entity_list[0].push({'start':start_word_num,'end':end_word_num,'content':this.state.questions[this.state.current_question].substring(real_start,real_end)});
      this.setState({entity_list});
    }
  }
 
  render_draggables = () => {
    let all_draggables = [];
    for(var i = 0;i<this.state.entity_list.length;i++) {
      all_draggables.push(<Dragbox entity_number={i} drag_group={group} update_tags={this.update_entity_tags} current_tags={this.state.entity_list[i]} />);
    }
    return all_draggables;
  }
  
  
  updateDescription = (current_entity, description) => {
    this.setState({current_entity,description});
  }
  
  _handleChange = (editorState) => {
    this.setState({ editorState });
  }
    
  applyCustomStyles = (nameOfCustomStyle) => {

  }

    
  submit = () => {
    let annotations = [];
    if(!('nouns' in this.state.noun_phrases)) {
      return;
    }
    
    for(var i = 0;i<this.state.noun_phrases['nouns']['text'].length;i++) {
      if(i in this.state.annotations) {
        annotations.push([this.state.noun_phrases['nouns']['spans'][i][0],this.state.noun_phrases['nouns']['spans'][i][1],this.state.annotations[i],this.state.checked[i]]);
      }
    }
      var xhr = new XMLHttpRequest();
      xhr.open("POST", address+"/submit");
      xhr.send(
        JSON.stringify({
      question_num: this.state.current_question,
      person_name: this.state.name,
      annotations: annotations,
    })
  );
  
    this.setState({saved: true});
  } 
  
  reload = (new_num) => {
    this.setState({current_question: new_num,editorState: EditorState.createWithContent(ContentState.createFromText(this.state.questions[new_num])),entity_list: [[]]},()=>{this.get_noun_phrases()});
  }
  
  increment_question = () => {
    let new_num = (this.state.current_question+1)%this.state.questions.length;
    this.reload(new_num);
  }
  
  decrement_question = () => {
    let new_num = (this.state.current_question-1+this.state.questions.length)%this.state.questions.length;
    this.reload(new_num);
  }
  

  get_styles = () => {
    let text = this.state.questions[this.state.current_question];
    
    // Calculate the span colors
    let spans = [];
    let colors = ["blue","red","green"];
    for(var i = 1;i<this.state.entity_list.length;i++) {
      for(var j = 0;j<this.state.entity_list[i].length;j++) {
        let current_tag = this.state.entity_list[i][j];
        let current_color = colors[(i-1)%colors.length];
        let start_character = this.state.noun_phrases.indices[current_tag.start];
        let end_character = this.state.noun_phrases.indices[current_tag.end]+this.state.noun_phrases.words[current_tag.end].length;
        spans.push([start_character,end_character,current_color]);
      }
    }
    
    spans = spans.sort();
    
    let parts = []
    
    let num = 0;
    let current_span = 0;
    while(num<text.length) {
      if(current_span == spans.length) {
        parts.push([num,text.length,'white']);
        num = text.length;
      }
      else if(num<spans[current_span][0]) {
        parts.push([num,spans[current_span][0],'white']);
        num = spans[current_span][0];
      }
      else {
        parts.push(spans[current_span]);
        num = spans[current_span][1];
        current_span+=1;
      }
    }

    console.log("Parts "+parts);
       
    var highlights = parts.map(fields => <span key={fields[0]} style={{backgroundColor:fields[2]}}>{text.substring(fields[0], fields[1])}</span>);
    return highlights;
  }
  
  render() {
    if(this.state.noun_phrases.length == 0) {
      return <h1> Loading </h1> 
    }
    else {
      return <div> 
            <Grid container spacing={3}>

            <Grid item xs={8}> 
              <div> 
                <button onClick={this.decrement_question}> Previous </button>
                <button onClick={this.increment_question}> Next </button>
              </div>
              <div>  
              {this.state.current_question+1}
              <div id="main_text"> {this.get_styles()} </div>
              </div>
              
              <button style={{fontSize: 24}}  onClick={this.create_tag} > Create Tag </button>
              {this.render_draggables()[0]}

            </Grid>
            
            <Grid item xs={4}>
              <button style={{fontSize: 24, marginTop: 50}}  onClick={this.create_new_entity} > 
                  Create New Entity </button>

              {all_but_first(this.render_draggables())}  

              <div style={{top: 0,   position: 'sticky', padding: 100, fontSize: 24}}> 
                <div style={{color: this.state.saved?'green':'red', fontSize: 24}}> 
                  {this.state.saved?'Saved':'Not Saved'} 
                </div>
                <b> {this.state.current_entity} </b> 
                <br />
                {this.state.description}
            </div>
            </Grid>
            </Grid>
            </div>
   }
  }
}
