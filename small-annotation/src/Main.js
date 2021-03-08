import * as React from "react";
import Dragbox from "./Dragbox";
import Search from "./Search";
import Span from "./Span";
import Grid from "@material-ui/core/Grid";
import Switch from '@material-ui/core/Switch';
import 'draft-js/dist/Draft.css';
import {all_but_first,getSelectionCharacterOffsetsWithin,span_length,intersects} from './Util';
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Instructions from './Instructions';
import 'bootstrap/dist/css/bootstrap.min.css';
import Divider from '@material-ui/core/Divider';

let address = "/quel";

interface Props {}

interface State {
  questions: any;
  answers: any;
  current_question: number;
  words: string[];
  indices: any;
  annotations: any;
  checked: any;
  current_entity: string;
  description: string;
  name: string;
  start: number;
  end: number;
  saved: boolean;
  entity_list: any;
  entity_names: any;
  bolded_span: any;
  loaded_question: any;
}

let colors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'];

export default class Main extends React.Component<Props, State> {
  state: State = {
    questions: [],
    answers: [],
    current_question: 0,
    current_entity: "",
    description: "",
    name: "",
    words: [],
    indices: [],
    start: -1, 
    end: -1,
    saved: true,
    entity_list: [[]],
    entity_names: [""],
    show_instructions: false,
    bolded_span: [],
    loaded_question: 0,
  }
      
  componentDidMount = () => {
    let name = prompt("What's your name").toLowerCase();
    this.setState({name},()=>{    this.get_questions();
    this.get_noun_phrases(0);});
  }
  
  get_questions = () => {
    fetch(
      address+"/questions"
      )
      .then((res) => res.json())
      .then((res) => this.setState({questions:res['questions'],answers:res['answers']}));
  }
  
  get_noun_phrases = (question_num) => {
    fetch(
      address+"/noun_phrases/"+question_num+"_"+this.state.name
      )
      .then((res) => res.json())
      .then((res) => this.setState({current_question: question_num,loaded_question: res['loaded_question'], words: res['words'], indices: res['indices'],entity_names: JSON.parse(res['entity_names']), entity_list: JSON.parse(res['entity_list']),bolded_span: []},()=>{this.setState({words: this.state.words})}));
  }
  
  
  word_to_character = (span) => {
    let start = span[0];
    let end = span[1];
    let real_start = this.state.indices[start];
    let real_end = this.state.indices[end]+this.state.words[end].length
    return [real_start,real_end];
  }

  add_bolded = (bolded_span) => {
    this.setState({bolded_span: this.word_to_character(bolded_span)});
  }
  
  remove_bolded = (bolded_span) => {
    bolded_span = this.word_to_character(bolded_span);
    if(this.state.bolded_span[0] == bolded_span[0] 
    && this.state.bolded_span[1] == bolded_span[1]) {
      this.setState({bolded_span: []});
    }
  }
  
  update_spans = (span,number) => {
    let entity_list = this.state.entity_list.slice();
    for(var i = 0;i<entity_list.length;i++) {
      entity_list[i] = entity_list[i].slice().filter(item => item['start']!==span['start'] || item['end'] !== span['end']);
    }
    entity_list[number].push(span);
    this.setState({entity_list,saved: false,bolded_span: []});
  }
  
  delete_span = (span) => {
    let entity_list = this.state.entity_list.slice();
    for(var i = 0;i<entity_list.length;i++) {
      entity_list[i] = entity_list[i].slice().filter(item => item['start']!==span['start'] || item['end'] !== span['end']);
    }    
    this.setState({entity_list,saved: false, bolded_span: []});
  }
  
  update_entity_tags = (tags,number) => {
    let entity_list = this.state.entity_list.slice();
    entity_list[number] = tags;
    entity_list[1] = [];
    this.setState({entity_list,saved:false});
  }
  
  update_entity_name = (entity,number) => {
    let entity_names = this.state.entity_names;
    entity_names[number] = entity;
    this.setState({entity_names});
  }
  
  show_entity_names = () => {
    let names = [];
    for(var i = 2;i<this.state.entity_names.length;i++){
      if(this.state.entity_names[i]!="") {
        names.push(<li style={{textAlign: 'left'}}> {this.state.entity_names[i]} </li>);
      }
      else {
        names.push(<li style={{textAlign: 'left'}}> No Name </li>);
      }
    }
    return names;
  }
  
  create_new_entity = () => {
    let entity_list = this.state.entity_list.slice();
    let entity_names = this.state.entity_names.slice();
    entity_list.push([]);
    entity_names.push("");
    this.setState({entity_list,entity_names, saved: false});
  }
  
  create_tag = () => {
    let range = 0;
    try{
    range = getSelectionCharacterOffsetsWithin(document.getElementById("main_text"));
    }
    catch {
      return;
    }
    let start = range.start-1;
    let end = range.end-1;
    if (window.getSelection) {
      if (window.getSelection().empty) {  
        window.getSelection().empty();
    } else if (window.getSelection().removeAllRanges) {  // Firefox
      window.getSelection().removeAllRanges();
      }
    } 
    else if (document.selection) {  // IE?
      document.selection.empty();
    }
    else {
      return;
    }

    
    if(start-end == 0) {
      alert("No selection selected");
    }
    else {   
      let real_start = -1;
      let real_end = this.state.indices[this.state.indices.length-1]+this.state.words[this.state.words.length-1].length;
      let start_word_num = 0;
      let end_word_num = this.state.words.length-1;
      
      
      for(var i = 0;i<this.state.indices.length;i++) {
        if(this.state.indices[i]<=start) {
          real_start = this.state.indices[i];
          start_word_num = i;
        }
      }
      
      for(var i = this.state.indices.length-1;i>=0;i--) {
        if(this.state.indices[i]>=end && i!=0) {
          real_end = this.state.indices[i-1]+this.state.words[i-1].length;
          end_word_num = i-1;
        }
      }

      this.update_spans({'start':start_word_num,'end':end_word_num,'content':this.state.questions[this.state.current_question].substring(real_start,real_end)},0)
    }
  }
 
  render_draggables = () => {
    let all_draggables = [];
    for(var i = 0;i<this.state.entity_list.length;i++) {
      all_draggables.push(<Dragbox entity_number={i} add_bolded={this.add_bolded} remove_bolded={this.remove_bolded} update_spans={this.update_spans} delete_entity={this.delete_entity} update_entity_name={this.update_entity_name} current_spans={this.state.entity_list[i]} entity_name={this.state.entity_names[i]} color={colors[i%colors.length]} delete_span={this.delete_span}/>);
    }
    return all_draggables;
  }
  
  
  updateDescription = (current_entity, description) => {
    this.setState({current_entity,description});
  }
  

    
  submit = () => {
    let str_entity_names = JSON.stringify(this.state.entity_names);
    let str_entity_spans = JSON.stringify(this.state.entity_list);
    let username = this.state.name;
    let question_id = this.state.current_question;
    var xhr = new XMLHttpRequest();
    xhr.open("POST", address+"/submit");
    xhr.send(JSON.stringify({str_entity_names,str_entity_spans,username,question_id}));
    this.setState({saved: true});
  } 
  
  reload = (new_num) => {
    this.get_noun_phrases(new_num)
  }
  
  increment_question = () => {
    this.submit();
    let new_num = (this.state.current_question+1)%this.state.questions.length;
    this.reload(new_num);
  }
  
  decrement_question = () => {
    this.submit();
    let new_num = (this.state.current_question-1+this.state.questions.length)%this.state.questions.length;
    this.reload(new_num);
  }
  

  get_styles = () => {
    let text = this.state.questions[this.state.current_question];
        
    // Calculate the span colors
    let spans = [];
    for(var i = 0;i<this.state.entity_list.length;i++) {
      for(var j = 0;j<this.state.entity_list[i].length;j++) {
        let current_tag = this.state.entity_list[i][j];
        let current_color = colors[i%colors.length];
        if (i == 0) {
          current_color = "#DDDDDD";
        } 
        let start_character = this.state.indices[current_tag.start];
        let end_character = this.state.indices[current_tag.end]+this.state.words[current_tag.end].length;
        spans.push([start_character,end_character,current_color]);
      }
    }
    
    spans = spans.sort(function(a, b) {
      return a[0] - b[0];
    });
        
    let new_spans = []
    i =0;
    
    while(spans.length>0){ 
      
      let current_span = spans.shift();
      if(new_spans.length == 0) {
        new_spans.push(current_span);
      }
      else {
        
        current_span[0] = Math.max(current_span[0],new_spans.slice(-1)[0][0]);
        if(current_span[0]<new_spans.slice(-1)[0][0]) {
          alert("There's an issue!");
        }
        if(intersects(current_span,new_spans.slice(-1)[0])) {
          if (span_length(current_span)<span_length(new_spans.slice(-1)[0]) && new_spans[new_spans.length-1][0]<=current_span[0]) {
            new_spans[new_spans.length-1][1] = current_span[0];
            new_spans.push(current_span);
            if(new_spans[new_spans.length-2][1]>current_span[1]) {
              new_spans.push([current_span[1],new_spans[new_spans.length-2][1],new_spans[new_spans.length-2][2]]);
            }
          }
          else {
            current_span[0] = new_spans[new_spans.length-1][1];
            new_spans.push(current_span);
          }
        } else {
          new_spans.push(current_span);
        }
      }
    }
            
    let parts = []; 
    
    let num = 0;
    let current_span = 0;
    while(num<text.length) {
      if(current_span == new_spans.length) {
        parts.push([num,text.length,'white']);
        num = text.length;
      }
      else if(num<new_spans[current_span][0]) {
        parts.push([num,new_spans[current_span][0],'white']);
        num = new_spans[current_span][0];
      }
      else {
        parts.push(new_spans[current_span]);
        num = new_spans[current_span][1];
        current_span+=1;
      }
    }
    
    var highlights = [];
    for(var i = 0;i<parts.length; i++) {
      let fields = parts[i];
      if(this.state.bolded_span.length>0) {
        if(this.state.bolded_span[0]>=fields[0] && this.state.bolded_span[0]<fields[1]) {
            if(this.state.bolded_span[1]<fields[1]) {
              // Then it goes [Text][Bolded][Text]
                highlights.push(<span key={fields[0]} style={{border: fields[2]=='white'?'':'1px solid #000000',backgroundColor:fields[2]}}>{text.substring(fields[0], this.state.bolded_span[0])}</span>);
                highlights.push(<span key={this.state.bolded_span[0]} style={{border: fields[2]=='white'?'':'1px solid #000000',backgroundColor:fields[2], textDecoration: 'underline'}}>{text.substring(this.state.bolded_span[0], this.state.bolded_span[1])}</span>);
                highlights.push(<span key={this.state.bolded_span[1]} style={{border: fields[2]=='white'?'':'1px solid #000000',backgroundColor:fields[2]}}>{text.substring(this.state.bolded_span[1], fields[1])}</span>);
            }
            else {
              // Then it goes [Text][Bolded]
              highlights.push(<span key={fields[0]} style={{backgroundColor:fields[2]}}>{text.substring(fields[0], this.state.bolded_span[0])}</span>);
              highlights.push(<span key={this.state.bolded_span[0]} style={{border: fields[2]=='white'?'':'1px solid #000000',backgroundColor:fields[2], textDecoration: 'underline'}}>{text.substring(this.state.bolded_span[0], fields[1])}</span>);
            }

        }
        else if(this.state.bolded_span[0]<=fields[0] && this.state.bolded_span[1]>=fields[0]) {
          if(this.state.bolded_span[1]>=fields[1]) {
            // Then it goes [Bolded]
            highlights.push(<span key={fields[0]} style={{border: fields[2]=='white'?'':'1px solid #000000', backgroundColor:fields[2], textDecoration: 'underline'}}>{text.substring(fields[0], fields[1])}</span>);
          }
          else {
            // Then it goes [Bolded][Text]
            highlights.push(<span key={fields[0]} style={{backgroundColor:fields[2], border: fields[2]=='white'?'':'1px solid #000000',textDecoration: 'underline'}}>{text.substring(fields[0], this.state.bolded_span[1])}</span>);
            highlights.push(<span key={this.state.bolded_span[1]} style={{border: fields[2]=='white'?'':'1px solid #000000',backgroundColor:fields[2]}}>{text.substring(this.state.bolded_span[1], fields[1])}</span>);
          }
        }
        else {
          // Then it goes [Text]
          highlights.push(<span key={fields[0]} style={{backgroundColor:fields[2],border: fields[2]=='white'?'':'1px solid #000000'}}>{text.substring(fields[0], fields[1])}</span>)
        }
      }
      else {
          // Then it goes [Text]
          highlights.push(<span key={fields[0]} style={{backgroundColor:fields[2],border: fields[2]=='white'?'':'1px solid #000000'}}>{text.substring(fields[0], fields[1])}</span>)
        }

    }
       
    return highlights;
  }
  
  delete_entity = (entity_number) => {
    let entity_list = this.state.entity_list.slice();
    let entity_names = this.state.entity_names.slice(); 
    entity_list.splice(entity_number, 1);
    entity_names.splice(entity_number,1);
    this.setState({entity_list,entity_names, saved:false})
  }
  
  show_instructions = () => {
    this.setState({show_instructions: true});
  }
  
  hide_instructions = () => {
    this.setState({show_instructions: false});
  }
  
  render() {
    if(this.state.words.length == 0 || this.state.loaded_question != this.state.current_question) {
      return <h1> Loading </h1> 
    }
    else {
      return  <DndProvider backend={HTML5Backend}> <div> 
            <Grid container style={{marginTop: 50}} spacing={3}>

            <Grid item xs={6} style={{width: "50%", position: "fixed", top:"0", marginLeft: 50}}> 
              <div style={{marginBottom: 20}}> 
                <button style={{marginLeft: 30}} onClick={this.decrement_question}> Previous </button>
                <button style={{marginLeft: 30}} onClick={this.increment_question}> Next </button>
                <button style={{marginLeft: 30}} onClick={this.submit}> Save Question </button> 
                <button  style={{marginLeft: 30}}  onClick={this.show_instructions}>Instructions</button> <br /> <br />
                <div style={{color: this.state.saved?'green':'red', fontSize: 24}}> 
                    {this.state.saved?'Saved':'Not Saved'} 
                </div>
              </div> 
                    <Modal show={this.state.show_instructions} onHide={this.hide_instructions} animation={false}>
                      <Modal.Header closeButton>
                        <Modal.Title>Instructions</Modal.Title>
                      </Modal.Header>
                      <Modal.Body><Instructions /></Modal.Body>
                      <Modal.Footer>
                        <Button variant="secondary" onClick={this.hide_instructions}>
                          Close
                        </Button>
                      </Modal.Footer>
                    </Modal>

              <div  style={{fontSize: 16}}>  
              Question number: {this.state.current_question+1} (1. Highlight spans and select create span)
              <div id="main_text"> {this.get_styles()} </div>
              <div> <b> Answer: </b> {this.state.answers[this.state.current_question]} </div>
              </div>
              <br />
              <button style={{fontSize: 24}}  onClick={this.create_tag} > Create Span </button>
              <br />
              {this.render_draggables()[0]}

            </Grid>
            <Divider orientation="vertical" flexItem />
            <Grid item xs={6} style={{marginLeft: "55%", paddingLeft: 25, paddingRight: 25, borderLeft:'1px solid black',height: "100%", width: "40%"}}>
              <div style={{height: "100%"}}>
                {all_but_first(this.render_draggables())}  
                <button style={{fontSize: 24, marginTop: 50}}  onClick={this.create_new_entity} > 
                    Create New Entity Cluster
                </button>
              </div>
            </Grid>
            </Grid>
            </div> </DndProvider>
   }
  }
}
