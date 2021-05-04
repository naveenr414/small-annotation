import * as React from "react";
import {useContext} from "react";
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
import {getCookie,setCookie} from "./Util";
import {Redirect} from 'react-router-dom';
import introJs from 'intro.js';
import 'intro.js/introjs.css';

let address = "/quel";


interface Props {
  suggested: boolean;
  last: boolean;
  selected: boolean; 
}


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
  qanta_id: any;
  metadata: any;
}

let colors = ["#4E79A7","#A0CB38","#F28E2B","#FFBE7D","#59A14F","#8CD17D","#B6992D","#F1CE63","#499894","#86BCB6"];
let num_questions = 20;

export default class Main extends React.Component<Props, State> {
  state: State = {
    question: "",
    answer: "",
    name: "",
    words: [],
    indices: [],
    saved: true,
    next_numbers: [],
    entity_list: [[],[]],
    entity_names: ["",""],
    show_instructions: false,
    underline_span: [],
    is_dragged: false,
    clicked: "",
    qanta_id: "",
    metadata: {'difficulty': '', 'category': '', 'tournament': '', 'year': ''},
    submitted: false,
    start: 0,
  }
  

  
  /* Loading in questions */ 
  componentDidMount = () => {
    let name = getCookie("token");
  
    if(this.props.selected) {
      this.setState({name},()=>{this.get_question_num();});
    }
    else if(this.props.suggested) {
      this.setState({name},()=>{this.get_noun_phrases_suggested(0);});
    }
    else if(this.props.last) {
      this.setState({name},()=>{this.get_last_question();});
    }
    else {
      this.setState({name},()=>{this.get_noun_phrases(0);});
    }
    
    
    if(name!="" && getCookie("help")=="") {
      setCookie("help","done");
      setTimeout(()=>{
        introJs().setOptions({
        steps: [{
          title: 'Welcome',
          intro: 'We\'ll quickly walk you through the app!'
        },
        {
          element: document.querySelector('.highlight'),
          intro: 'First, highlight a span which refers to an entity'
        },
        {
          element: document.querySelector('.create'),
          intro: 'Then select "create span"'
        },
        {
          element: document.querySelector('.unassigned'),
          intro: 'Your new span will now be in the unassigned spans box'
        },
        {
          element: document.querySelector('.entity'),
          intro: 'Drag your new span over to the correct matching entity'
        },
        {
          element: document.querySelector('.new'),
          intro: 'If none of the entities match, you can create a new entity for this span'
        },
        {
          intro: 'Click "change entity" to change the name of the entity box'
        },
        {
          element: document.querySelector('.submit'),
          intro: "Once you're done annotating, click the submit button"
        },
        {
          intro: "To explore the prevalence of entities in different tournaments, or to view person annotation stats, click on \"Main Menu\"",
          element: document.querySelector('.user'),
        },
        ]
      }).start();},250)
    }
  }

  get_question = (url,question_num) => {
    fetch(
      url
      )
      .then((res) => res.json())
      .then((res) => this.setState(
        {current_question: question_num, 
        metadata: res['metadata'],
        words: res['words'], 
        indices: res['indices'],
        question: res['question'],
        answer: res['answer'],
        qanta_id: res['question_num'],
        submitted: false,
        start: new Date() / 1000,
        entity_names: JSON.parse(res['entity_names']), entity_list: JSON.parse(res['entity_list']),underline_span: []}
        ,()=>{this.setState({clicked: []})}));
  }

  get_noun_phrases_suggested = (question_num) => {
    this.get_question(address+"/noun_phrases_suggested/"+question_num+"_"+this.state.name,question_num);
  }
  
  get_noun_phrases = (question_num) => {
    this.get_question(address+"/noun_phrases/"+question_num+"_"+this.state.name,question_num);
  }
  
  get_last_question = () => {
    this.get_question(address+"/noun_phrases_last/"+this.state.name,0);
  }
  
  get_question_num = () => {
    let numbers = getCookie("questions"); 
    if(numbers!="" && JSON.parse(numbers).length>0) {
      numbers = JSON.parse(numbers);
      this.setState({next_numbers: numbers});
      this.get_question(address+"/noun_phrases_selected/"+numbers[0]+"_"+this.state.name,numbers[0]);
    }
    else {
      this.get_noun_phrases(5);
    }
  }
  
  arrayRotate = (arr, n,reverse) => {
    let dup = arr.slice();
    for(var i = 0;i<n;i++) {
      if(reverse) {
        dup.unshift(dup.pop());
      } else {
        dup.push(dup.shift());
      }
    }
    return dup;
  }

  previous = () => {
    let nums = this.state.next_numbers;
    setCookie("questions",JSON.stringify(this.arrayRotate(nums,1,true)));
    this.get_question_num();
  }

  next = () => {
    let nums = this.state.next_numbers;
    let rotated = this.arrayRotate(nums,1,false);
    setCookie("questions",JSON.stringify(rotated));
    this.get_question_num();
  }
  
  back_button = () => {
    if(getCookie("packet")!="") {
      return <button style={{fontSize: "2.5vh", marginRight: 50}}  class="packet"><a href="/packetsearch"> Back </a> </button>
    }
    if(getCookie("entity")!="") {
      return <button style={{fontSize: "2.5vh", marginRight: 50}}  class="entity"><a href="/entitysearch"> Back </a> </button>
    }
  }

  submit = () => {
    let str_entity_names = JSON.stringify(this.state.entity_names);
    let str_entity_spans = JSON.stringify(this.state.entity_list);
    let username = this.state.name;
    let question_id = this.state.qanta_id.toString();
    let end_time = this.state.start;
    if(this.state.submitted) {
      end_time = new Date() / 1000;
    }
    var xhr = new XMLHttpRequest();
    xhr.open("POST", address+"/submit");
    xhr.send(JSON.stringify({str_entity_names,str_entity_spans,username,question_id,time: end_time-this.state.start}));
    this.setState({saved: true,underline_span: []});
  } 

  /* Download questions */ 

  
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
    if(this.state.clicked == "") {
      this.setState({underline_span: this.word_to_character(underline_span)});
    }
  }
  
  remove_bolded = (underline_span) => {
    underline_span = this.word_to_character(underline_span);
        
    if(this.state.underline_span[0] == underline_span[0] 
    && this.state.underline_span[1] == underline_span[1]) {
      if(this.state.clicked == "") {
        this.setState({underline_span: []});
      }
      else {
        let json_info = JSON.parse(this.state.clicked);
        if(JSON.stringify(this.word_to_character([json_info.start,json_info.end])) == 
        JSON.stringify(this.state.underline_span)) {
          
        }
        else {
           this.setState({underline_span: []});
        }
      }
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
    
    setTimeout(()=>{this.setState({clicked: ""})},200);

  }
  
  adjust_span = (direction,click_data) => {
    let entity_list = JSON.parse(JSON.stringify(this.state.entity_list));
    let d = JSON.parse(JSON.stringify(entity_list[click_data.entity_number][click_data.number]));

    d.start+=direction[0];
    d.start = Math.max(0,d.start);
    d.end+=direction[1];
    d.end = Math.min(d.end,this.state.words.length-1);
    d.end = Math.max(d.end,d.start);
    let character_indicies = this.word_to_character([d.start,d.end]);
    let content = this.state.question.substring(character_indicies[0],character_indicies[1]);
    d.content = content;
    entity_list[click_data.entity_number][click_data.number] = d;
    click_data.start = d.start;
    click_data.end = d.end
    this.setState({entity_list,clicked:JSON.stringify(click_data)},()=>{this.submit()});
  }
  
  /* Dealing with clicking on spans */ 
  
  update_clicked = (json_string) => {
    if(json_string!=="" && this.state.clicked!==json_string) {
      let click_data = JSON.parse(json_string);
      this.setState({clicked: json_string,underline_span: this.word_to_character([click_data.start,click_data.end])});
    } else {
      this.setState({clicked: ""});
    }
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
    
    this.setState({entity_list,entity_names, saved:true,},()=>{this.submit();})
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
      return;
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
  
  new_suggested = () => {
    this.submit();
    let new_num = (this.state.current_question+1)%num_questions;
    this.get_noun_phrases_suggested(new_num);
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
        let end_character = this.state.indices[Math.min(current_tag.end,this.state.words.length-1)]+this.state.words[Math.min(current_tag.end,this.state.words.length-1)].length;
        spans.push([start_character,end_character,current_color]);
      }
    }
    
    spans = spans.sort(function(a, b) {
      return a[0] - b[0];
    });
    
    console.log(JSON.stringify(spans));
        
    let new_spans = []
    i =0;
    
    // Use a stack based approach, where we add on the smallest span at each point
    let stack = []
    
    while(i<this.state.question.length) {
      while(spans.length>0 && i>=spans[0][0]) {
        let current_span = spans.shift();
        if(i<current_span[1]) {
          stack.push(current_span);
        }
      }
      
      if(stack.length == 0) {
        if(spans.length == 0) {
          break;
        }
        else {
          i = spans[0][0];
          stack.push(spans.shift());
        }
      }
      else {
        // Find the smallest thing on the stack 
        let smallest = 0;
        for(var j = 1;j<stack.length;j++) {
          if(stack[j][1]-stack[j][0]<stack[smallest][1]-stack[smallest][0]) {
            smallest = j;
          }
        }
        
        let next_i = Math.min(stack[smallest][1],spans.length>0?spans[0][0]:stack[smallest][1]);
        new_spans.push([i,next_i,stack[smallest][2]]);
        i = next_i;
        let new_stack = [];
        for(var j = 0;j<stack.length;j++) {
          if(stack[j][0]<=i && stack[j][1]>i) {
            new_stack.push(stack[j]);
          }
        }
        stack = new_stack;
      }
    }
    
    console.log(JSON.stringify(new_spans));
   
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
        if(this.state.underline_span[0]>fields[0] && this.state.underline_span[0]<fields[1]) {
            if(this.state.underline_span[1]<fields[1]) {
              // Then it goes [Text][Bolded][Text]
                highlights.push(<span key={fields[0]+"textboldedtext"} style={{border: fields[2]=='white'?'':'1px solid #000000',backgroundColor:fields[2]}}>{text.substring(fields[0], this.state.underline_span[0])}</span>);
                highlights.push(<span key={this.state.underline_span[0]} style={{border: fields[2]=='white'?'':'1px solid #000000',backgroundColor:'yellow', textDecoration: 'underline'}}>{text.substring(this.state.underline_span[0], this.state.underline_span[1])}</span>);
                highlights.push(<span key={this.state.underline_span[1]} style={{border: fields[2]=='white'?'':'1px solid #000000',backgroundColor:fields[2]}}>{text.substring(this.state.underline_span[1], fields[1])}</span>);
            }
            else {
              // Then it goes [Text][Bolded]
              highlights.push(<span key={fields[0]+"textbolded"} style={{border: fields[2]=='white'?'':'1px solid #000000',backgroundColor:fields[2]}}>{text.substring(fields[0], this.state.underline_span[0])}</span>);
              highlights.push(<span key={this.state.underline_span[0]} style={{border: fields[2]=='white'?'':'1px solid #000000',backgroundColor:'yellow', textDecoration: 'underline'}}>{text.substring(this.state.underline_span[0], fields[1])}</span>);
            }

        }
        else if(this.state.underline_span[0]<=fields[0] && this.state.underline_span[1]>=fields[0]) {
          if(this.state.underline_span[1]>=fields[1]) {
            // Then it goes [Bolded]
            highlights.push(<span key={fields[0]+"bolded"} style={{border: fields[2]=='white'?'':'1px solid #000000',backgroundColor:'yellow', textDecoration: 'underline'}}>{text.substring(fields[0], fields[1])}</span>);
          }
          else {
            // Then it goes [Bolded][Text]
            highlights.push(<span key={fields[0]+"boldedtext"} style={{border: fields[2]=='white'?'':'1px solid #000000',backgroundColor:'yellow', textDecoration: 'underline'}}>{text.substring(fields[0], this.state.underline_span[1])}</span>);
            highlights.push(<span key={this.state.underline_span[1]} style={{border: fields[2]=='white'?'':'1px solid #000000',backgroundColor:fields[2]}}>{text.substring(this.state.underline_span[1], fields[1])}</span>);
          }
        }
        else {
          // Then it goes [Text]
          highlights.push(<span key={fields[0]+"else"} style={{backgroundColor:fields[2],border: fields[2]=='white'?'':'1px solid #000000'}}>{text.substring(fields[0], fields[1])}</span>)
        }
      }
      else {
          // Then it goes [Text]
          highlights.push(<span key={fields[0]+"else2"} style={{backgroundColor:fields[2],border: fields[2]=='white'?'':'1px solid #000000'}}>{text.substring(fields[0], fields[1])}</span>)
        }

    }
    
    return highlights;
  }
  
  get_styles = () => {
    let text = this.state.question;
    let new_spans = this.get_span_colors();
    let highlights = this.get_underlines(text,new_spans);
    console.log(highlights);
    return highlights;
  }
  
  logout = () => {
    setCookie("token","");
    this.setState({clicked: this.state.clicked});
  }
  
  render_navigation_buttons = () => {
    if(this.state.next_numbers.length>0) {
      return   <div style={{display:'inline-block', paddingTop: 20}}> 
          <button style={{fontSize: "2.5vh"}} onClick={()=>{this.final_submit(); this.previous();}}> Previous </button>
          <button style={{marginLeft: 50, fontSize: "2.5vh"}} onClick={()=>{this.final_submit();this.next()}}> Next </button> 

    </div>
    }
    
    return <div style={{display:'inline-block', paddingTop: 20}}> 
          <button style={{fontSize: "2.5vh"}} onClick={()=>{this.final_submit(); this.increment_question();}}> Random Question </button>
          <button style={{marginLeft: 50, fontSize: "2.5vh"}} onClick={()=>{this.final_submit();this.new_suggested()}}> Suggested Question </button> 

    </div>
  }
    
  final_submit = () => {
    this.setState({submitted: true},()=>{this.submit()});
  }
  
  skip = () => {
    this.setState({submitted: true},()=>{
      if(this.state.next_numbers.length>0) {
        this.next();
      }
      else {
        this.increment_question();
      }
    });
  }
  
  render() {
    if (getCookie("token") === "") {
      return <Redirect to="/login" />;
    }
    else if(this.state.words.length == 0) {
      return <h1> Loading </h1> 
    }
    else {
      return  <DndProvider backend={HTML5Backend}> 
                <div> 
                  <Grid container style={{marginTop: 50}} spacing={3}>

                    <Grid item xs={6} style={{width: "50%", position: "fixed", top:"0", marginLeft: 50}}> 
                      <div  style={{}}> 
                        {this.back_button()}
                        <button class="user" style={{fontSize: "2.5vh"}}><a href="/user"> Main Menu </a> </button>
                        <button  style={{marginLeft: 50, fontSize: "2.5vh"}}  onClick={this.show_instructions}>Instructions</button> 
                        <button  style={{marginLeft: 50, fontSize: "2.5vh"}}  onClick={this.logout}>Logout</button> 
                        <br />
                        {this.render_navigation_buttons()}

                        <br /> <br />
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

                      <div class="highlight" style={{fontSize: "2.5vh"}}>  
                        (1. Highlight spans and select create span)  <br />
                        <b> Category</b>:  {" "} {this.state.metadata.category}, from {this.state.metadata.tournament} {this.state.metadata.year} 
                       
                        <div id="main_text"> {this.get_styles()} </div>
                        <div> <b> Answer: </b> {this.state.answer.substring(0,250)} </div>
                      </div>
                      <button class="create" style={{fontSize: "2.5vh"}}  onClick={()=>{this.create_tag(0)}} > 
                      Create Span </button>
                      <br />
                      <div class="unassigned"> {this.render_draggables()[0]} </div>
                    </Grid>
                    
                    <Divider orientation="vertical" flexItem />
                    <Grid item xs={6} style={{marginLeft: "55%", paddingLeft: 25, paddingRight: 25, borderLeft:'1px solid black',height: "100%", width: "40%"}}>
                      <h3 class="entity"> Entities </h3>
                      <div style={{height: "100%"}}>
                        {all_but_first(this.render_draggables())}  
                        <button style={{fontSize: 24, marginTop: 50}}  onClick={this.create_new_entity} class="new"> 
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
