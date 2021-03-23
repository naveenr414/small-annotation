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
import KeyboardEventHandler from 'react-keyboard-event-handler';

let address = "/quel";

interface Props {}

interface State {
  question: any;
  answer: any;
  current_question: number;
  words: string[];
  indices: any;
  checked: any;
  name: string;
  saved: boolean;
  entity_list: any;
  entity_names: any;
  underline_span: any;
  is_dragged: boolean;
  clicked: any;
}

let colors = ['hsl(205, 56.49289099526066%, 41.372549019607845%)', 'hsl(28, 80.0%, 52.74509803921569%)', 'hsl(120, 45.490196078431374%, 40.0%)', 'hsl(360, 55.33596837944664%, 49.6078431372549%)', 'hsl(271, 31.55963302752294%, 57.25490196078431%)', 'hsl(10, 24.186046511627907%, 42.156862745098046%)', 'hsl(318, 52.68292682926828%, 67.84313725490196%)', 'hsl(0, 0.0%, 49.80392156862745%)', 'hsl(60, 55.6053811659193%, 43.72549019607843%)', 'hsl(186, 64.0%, 45.09803921568628%)'];
let num_questions = 20;

export default class Main extends React.Component<Props, State> {
  state: State = {
    question: "",
    answer: "",
    name: "",
    words: [],
    indices: [],
    saved: true,
    entity_list: [[],[]],
    entity_names: ["",""],
    show_instructions: false,
    underline_span: [],
    is_dragged: false,
    clicked: "",
  }
  
  /* Loading in questions */ 
  componentDidMount = () => {
    let name = prompt("What's your name").toLowerCase();
    this.setState({name},()=>{this.get_noun_phrases(0);});
  }
  
  get_noun_phrases = (question_num) => {
    fetch(
      address+"/noun_phrases/"+question_num+"_"+this.state.name
      )
      .then((res) => res.json())
      .then((res) => this.setState(
        {current_question: question_num, 
        words: res['words'], 
        indices: res['indices'],
        question: res['question'],
        answer: res['answer'],
        entity_names: JSON.parse(res['entity_names']), entity_list: JSON.parse(res['entity_list']),underline_span: []}
        ,()=>{this.setState({clicked: []})}));
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

  /* Download questions */ 
  download_questions = () => {
    fetch(
      address+"/pdf/"+this.state.current_question+"_"+this.state.name
      ).then(res => {
        return res.blob();
      })
      .then((blob)=>{
        const href = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = href;
        a.download = 'question.pdf';
        a.click();
      });
  }
  
  /* Util to help with word <-> character <-> span */ 
  word_to_character = (span) => {
    let start = span[0];
    let end = span[1];
    let real_start = this.state.indices[start];
    let real_end = this.state.indices[end]+this.state.words[end].length
    return [real_start,real_end];
  }
  
  /* Dealing with underlining */
  add_bolded = (underline_span) => {
    this.setState({underline_span: this.word_to_character(underline_span)});
  }
  
  remove_bolded = (underline_span) => {
    underline_span = this.word_to_character(underline_span);
    if(this.state.underline_span[0] == underline_span[0] 
    && this.state.underline_span[1] == underline_span[1]) {
      this.setState({underline_span: []});
    }
  }
  
  /* Dealing with span updating */ 
  
  toggle_drag = (is_dragged) => {
    this.setState({is_dragged});
  }

  update_spans = (span,number) => {
    let entity_list = this.state.entity_list.slice();
    for(var i = 0;i<entity_list.length;i++) {
      entity_list[i] = entity_list[i].slice().filter(item => item['start']!==span['start'] || item['end'] !== span['end']);
    }
    entity_list[number].push(span);
    let entity_names = this.state.entity_names;
    
    if(number == entity_list.length-1) {
      entity_list.push([]);
      entity_names.push("");
    }
    
    this.setState({entity_list,entity_names,clicked:"",saved: true,underline_span: []},()=>{this.submit();});
  }
  
  delete_span = (span) => {
    let entity_list = this.state.entity_list.slice();
    for(var i = 0;i<entity_list.length;i++) {
      entity_list[i] = entity_list[i].slice().filter(item => item['start']!==span['start'] || item['end'] !== span['end']);
    }  
    this.setState({entity_list,clicked:"",saved: true, underline_span: []},()=>{this.submit();});
  }
  
  adjust_span = (direction,click_data) => {
    let entity_list = JSON.parse(JSON.stringify(this.state.entity_list));
    let d = JSON.parse(JSON.stringify(entity_list[click_data.entity_number][click_data.number]));

    d.start+=direction[0];
    d.end+=direction[1];
    let character_indicies = this.word_to_character([d.start,d.end]);
    let content = this.state.question.substring(character_indicies[0],character_indicies[1]);
    d.content = content;
    entity_list[click_data.entity_number][click_data.number] = d;
    click_data.start = d.start;
    click_data.end = d.end
    this.setState({entity_list,clicked:JSON.stringify(click_data)});
  }
  
  /* Dealing with clicking on spans */ 
  
  update_clicked = (json_string) => {
    this.setState({clicked: this.state.clicked==json_string?"":json_string});
  }
  
  /* Dealing with searching */
  
  update_entity_name = (entity,number) => {
    let entity_names = this.state.entity_names;
    entity_names[number] = entity;
    this.setState({entity_names},()=>{this.submit()});
  }
  
  /* Dealing with entity, tag creation */ 
  create_new_entity = () => {
    let entity_list = this.state.entity_list.slice();
    let entity_names = this.state.entity_names.slice();
    entity_list.push([]);
    entity_names.push("");
    this.setState({entity_list,entity_names, saved: true},()=>{this.submit();});
  }
  
  delete_entity = (entity_number) => {
    let entity_list = this.state.entity_list.slice();
    let entity_names = this.state.entity_names.slice(); 
    entity_list[0]=entity_list[0].concat(entity_list[entity_number]);
    entity_list.splice(entity_number, 1);
    entity_names.splice(entity_number,1);
    
    this.setState({entity_list,entity_names, saved:true},()=>{this.submit();})
  }
  
  create_tag = (num=0) => {

    
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
    if(num>=this.state.entity_list.length) {
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
      this.update_spans({'start':start_word_num,'end':end_word_num,'content':this.state.question.substring(real_start,real_end).trim()},num)
    }
  }
 
  /* Question navigation */ 
  increment_question = () => {
    this.submit();
    let new_num = (this.state.current_question+1)%num_questions;
     this.get_noun_phrases(new_num);
  }
    
  decrement_question = () => {
    this.submit();
    let new_num = (this.state.current_question-1+num_questions)%num_questions;
    this.get_noun_phrases(new_num);
  }
  
 
  render_draggables = () => {
    let all_draggables = [];
    for(var i = 0;i<this.state.entity_list.length;i++) {
      all_draggables.push(<Dragbox 
        toggle_drag={this.toggle_drag} 
        dragged={this.state.is_dragged} 
        entity_number={i} 
        add_bolded={this.add_bolded} 
        remove_bolded={this.remove_bolded} 
        update_spans={this.update_spans} 
        delete_entity={this.delete_entity} 
        update_entity_name={this.update_entity_name} 
        current_spans={this.state.entity_list[i]} 
        entity_name={this.state.entity_names[i]} 
        color={colors[i%colors.length]} 
        delete_span={this.delete_span} 
        update_clicked={this.update_clicked} 
        clicked={this.state.clicked}/>);
    }
    return all_draggables;
  }
  
  /* Instructions */ 
  show_instructions = () => {
    this.setState({show_instructions: true});
  }
  
  hide_instructions = () => {
    this.setState({show_instructions: false});
  }
  
  /* Key Input */   
  handle_key = (key,e) => {
    if(key>='0' && key<='9') {
      this.create_tag(parseInt(key));
    }
    else {
      let direction = [0,0];
      if(key == 'a') {
        direction = [0,-1];
      }
      else if (key == 'd') {
        direction = [0,1];
      }
      else if (key == 'w') {
        direction = [1,0];
      }
      else if (key == 's') {
        direction = [-1,0];
      }
      if(direction != [0,0] && this.state.clicked!=="") {
        let click_data = JSON.parse(this.state.clicked);
        this.adjust_span(direction,click_data);
      }
    }
  }
  
  /* Rendering */ 
  get_span_colors = () => {
    let text = this.state.question;
        
    // Calculate the span colors
    let spans = [];
    for(var i = 0;i<this.state.entity_list.length;i++) {
      for(var j = 0;j<this.state.entity_list[i].length;j++) {
        let current_tag = this.state.entity_list[i][j];
        if (current_tag.start<0 || current_tag.end <0 ) {
          continue; 
        }
        
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
      
    return new_spans; 
  }
  
  get_underlines = (text,new_spans) => {
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
      if(this.state.underline_span.length>0) {
        if(this.state.underline_span[0]>=fields[0] && this.state.underline_span[0]<fields[1]) {
            if(this.state.underline_span[1]<fields[1]) {
              // Then it goes [Text][Bolded][Text]
                highlights.push(<span key={fields[0]} style={{border: fields[2]=='white'?'':'1px solid #000000',backgroundColor:fields[2]}}>{text.substring(fields[0], this.state.underline_span[0])}</span>);
                highlights.push(<span key={this.state.underline_span[0]} style={{border: fields[2]=='white'?'':'1px solid #000000',backgroundColor:fields[2], textDecoration: 'underline'}}>{text.substring(this.state.underline_span[0], this.state.underline_span[1])}</span>);
                highlights.push(<span key={this.state.underline_span[1]} style={{border: fields[2]=='white'?'':'1px solid #000000',backgroundColor:fields[2]}}>{text.substring(this.state.underline_span[1], fields[1])}</span>);
            }
            else {
              // Then it goes [Text][Bolded]
              highlights.push(<span key={fields[0]} style={{backgroundColor:fields[2]}}>{text.substring(fields[0], this.state.underline_span[0])}</span>);
              highlights.push(<span key={this.state.underline_span[0]} style={{border: fields[2]=='white'?'':'1px solid #000000',backgroundColor:fields[2], textDecoration: 'underline'}}>{text.substring(this.state.underline_span[0], fields[1])}</span>);
            }

        }
        else if(this.state.underline_span[0]<=fields[0] && this.state.underline_span[1]>=fields[0]) {
          if(this.state.underline_span[1]>=fields[1]) {
            // Then it goes [Bolded]
            highlights.push(<span key={fields[0]} style={{border: fields[2]=='white'?'':'1px solid #000000', backgroundColor:fields[2], textDecoration: 'underline'}}>{text.substring(fields[0], fields[1])}</span>);
          }
          else {
            // Then it goes [Bolded][Text]
            highlights.push(<span key={fields[0]} style={{backgroundColor:fields[2], border: fields[2]=='white'?'':'1px solid #000000',textDecoration: 'underline'}}>{text.substring(fields[0], this.state.underline_span[1])}</span>);
            highlights.push(<span key={this.state.underline_span[1]} style={{border: fields[2]=='white'?'':'1px solid #000000',backgroundColor:fields[2]}}>{text.substring(this.state.underline_span[1], fields[1])}</span>);
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
  
  get_styles = () => {
    let text = this.state.question;
    let new_spans = this.get_span_colors();
    let highlights = this.get_underlines(text,new_spans);
    return highlights;
  }
  
  render() {
    if(this.state.words.length == 0) {
      return <h1> Loading </h1> 
    }
    else {
      return  <DndProvider backend={HTML5Backend}> 
                <div> 
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
                        <Modal.Body> <Instructions /> </Modal.Body>
                        <Modal.Footer>
                          <Button variant="secondary" onClick={this.hide_instructions}>
                            Close
                          </Button>
                        </Modal.Footer>
                      </Modal>

                      <div style={{fontSize: 16}}>  
                        Question number:  {" "} {this.state.current_question+1} (1. Highlight spans and select create span)
                        <div id="main_text"> {this.get_styles()} </div>
                        <div> <b> Answer: </b> {this.state.answer} </div>
                      </div>
                      <br />
                      <button style={{fontSize: 24}}  onClick={()=>{this.create_tag(0)}} > 
                      Create Span </button>
                      <br />
                      {this.render_draggables()[0]}
                      <br />
                      <button onClick={this.download_questions}> Download PDF </button>
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
                </div> 
                
                <KeyboardEventHandler
                handleKeys={['1','2','3','4','5','6','7','8','9','a','d','w','s']}
                onKeyEvent={(key, e) => this.handle_key(key,e)} />
              </DndProvider>
   }
  }
}
