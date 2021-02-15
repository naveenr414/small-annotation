import * as React from "react";
import Phrase from "./Phrase";
import Word from "./Word";
import Grid from "@material-ui/core/Grid";
import Switch from '@material-ui/core/Switch';
import {Editor, EditorState, ContentState} from 'draft-js';
import 'draft-js/dist/Draft.css';


let address = "/api";

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
  add_entity: boolean;
  start: number;
  end: number;
  saved: boolean;
  editorState: any;
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
  }
  
  componentDidMount = () => {
    let name = prompt("What's your name").toLowerCase();
    this.setState({name},()=>{    this.get_questions();
    this.get_noun_phrases();});
  }
  
  updateDescription = (current_entity, description) => {
    this.setState({current_entity,description});
  }
  
  update_info = (i,annotation,checked) => {
    if(this.state.saved == true && (this.state.checked[i]!=checked || this.state.annotations[i]!=annotation)){
      this.setState({saved: false});
    }
    this.state.checked[i] = checked;
    this.state.annotations[i] = annotation;

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

  update_span = (num) => {
    if(this.state.start == -1) {
      this.setState({start:num});
    }
    else {
      this.setState({end: num});
      // Add in the entity
      let left_context = this.state.noun_phrases['words'].slice(Math.max(0,this.state.start-5),this.state.start);
      let content = this.state.noun_phrases['words'].slice(this.state.start,num+1);
      let right_context = this.state.noun_phrases['words'].slice(num+1,Math.min(num+6,this.state.noun_phrases['words'].length));

      this.state.noun_phrases['nouns']['spans'].push([this.state.start,num]);
      this.state.noun_phrases['nouns']['text'].push({'context_left': left_context.join(' '),'content': content.join(' '), context_right: right_context.join(' ')});
      this.setState({start: -1, end: -1});
      window.getSelection().removeAllRanges();
    }
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

 run_local = (i: any, event:any, f: any) => {
  return function () {
    f(i,event);
  };
}

  get_function = (i,event) => {
    return this.setValue(i,event);
  }

  
  setValue = (i,event) => {
    let d = this.state.annotations; 
    d[i] = event.target.value; 
    this.setState({annotations:d});
  }
  
  show_question = () => {
      let q = this.state.questions[this.state.current_question];
      let t = [];
      if('words' in this.state.noun_phrases) {
        let underlined_words = [];
        for(var j = 0;j<this.state.noun_phrases['nouns']['text'].length;j++) {
          if(j in this.state.annotations) 
          {
            for(var i = this.state.noun_phrases['nouns']['spans'][j][0];i<=this.state.noun_phrases['nouns']['spans'][j][1];i++) {
              if(!(i in underlined_words)){
                underlined_words.push(i);
              }
            }
          }
          
        }        
        
        for(var i = 0;i<this.state.noun_phrases['words'].length;i++) {
            let should_underline = underlined_words.indexOf(i)>=0;
            t.push(<Word underline={should_underline} callback={this.update_span} text={this.state.noun_phrases['words'][i] + " "} num={i} add_entity={this.state.add_entity} key={i} />);
        }
      }
  t.push(<div> Answer: <b> {this.state.answers[this.state.current_question]} </b> </div>);
      return t;
  }
  
  
  renderQuestion = () => {
    let q = this.state.questions[this.state.current_question];
    let noun_phrases = [];
    
        
    if("nouns" in this.state.noun_phrases){
      if(this.state.noun_phrases['nouns']['text'].length>0) {
        noun_phrases.push(<div style={{fontSize: 24, textAlign: 'left', paddingBottom: '20px'}}> <b> Total Noun Phrases: </b> {this.state.noun_phrases['nouns']['text'].length}</div>);
      }
    
      for(var i = 0;i<this.state.noun_phrases['nouns']['text'].length;i++) {
          let left_context = this.state.noun_phrases['nouns']['text'][i]['context_left'];
          let t = this.state.noun_phrases['nouns']['text'][i]['content'];
          let right_context = this.state.noun_phrases['nouns']['text'][i]['context_right'];
          
          let annotation = "";
          let is_nel = false;
          if(i in this.state.annotations) {
            annotation = this.state.annotations[i];
            is_nel = this.state.checked[i];
          }
          
          noun_phrases.push(<Phrase left_context={left_context} right_context={right_context} content={t} id={i} update_info={this.update_info} annotation={annotation} is_nel={is_nel} update_description={this.updateDescription} />);
      }
      


    }
    else {
      noun_phrases.push(<div style={{fontSize: 24}}> Loading noun phrases </div>);
    }
    
    if(noun_phrases.length == 0) {
      noun_phrases.push(<div style={{fontSize: 24}}> Add some noun phrases by clicking the toggle button above! </div>);
    }
      
    return (<div >
        <div> 
          <div style={{position: "absolute", top: "0px", width: "66%", height: "50%", borderBottom: "5px dotted red",}}> 
                        <h1> Question {this.state.current_question+1} </h1> 

          <div style={{fontSize: 24}}>  
            <button style={{fontSize: 24}} onClick={()=>{this.submit();this.setState({current_question: (this.state.current_question+this.state.questions.length-1)%this.state.questions.length,noun_phrases:[], annotations: {}, checked: {},saved: true,})}}>
              Previous 
            </button>  
            &nbsp; &nbsp;  &nbsp; &nbsp; 
            <button style={{fontSize: 24}} onClick={()=>{this.submit();this.setState({current_question: (this.state.current_question+1)%this.state.questions.length,noun_phrases:[],annotations: {}, checked: {},saved: true})}}> 
              Next 
            </button>  
            &nbsp; &nbsp;  &nbsp; &nbsp;
            <button style={{fontSize: 24}} onClick={this.submit}> 
              Save 
            </button>
            <br />
            Toggle Add Entity <Switch
              checked={this.state.add_entity}
              onChange={()=>{this.setState({add_entity: !this.state.add_entity})}}
              color="primary"
              name="checkedB"
              inputProps={{ 'aria-label': 'primary checkbox' }}
            />
            <br />

          </div> 
          
  <div style={{fontSize: 24, marginLeft: 20, marginRight: 20}}> {this.show_question()} </div> 
          <br /> 
          <div style={{fontSize: 24, marginLeft: 20, marginRight: 20}}>
          <b> Instructions: </b> 
          Highlight all noun phrases first, then fill in with Wiki page. 
          <br /> 
          </div>
        </div> 
        </div>
        <br /> 
        <div style={{paddingLeft: 20, width: "66%", height: "40%", overflow: "auto", padding: "20px",paddingBottom: "30px", position: "absolute", bottom: "0px"}}> 
          <br /> {noun_phrases} </div> </div>);
  }
  
  editorChange = (editorState) => {
    this.setState({editorState});
    console.log("Editor state selection "+editorState.getSelection());
    let anchorOffset = editorState.getSelection().anchorOffset;
    let focusOffset = editorState.getSelection().focusOffset;
    console.log("Editor state offsets "+anchorOffset + " "+focusOffset);
    if(focusOffset!=anchorOffset) {
      this.setState(
        {start: Math.min(anchorOffset,focusOffset),
          end:Math.max(anchorOffset,focusOffset)});
    }
    else {
      this.setState({start: -1, end: -1});
    }
  }
  
  // Alert what the start and end characters are 
  createTag = () => {
    if(this.state.start == -1 || this.state.end == -1) {
      alert("No selection selected");
    }
    else {
      alert(this.state.start + " "+this.state.end);
    }
  }
  
  render() {
    if(this.state.questions.length == 0) {
      return <h1> Loading </h1> 
    }
    else {
      return <div> 
            <Grid container spacing={3}>

            <Grid item xs={8}> 
<Editor keyBindingFn={() => 'not-handled-command'} editorState={this.state.editorState} onChange={this.editorChange} />
<button style={{fontSize: 24}}  onClick={this.createTag} > Create Tag </button>
              {/*this.renderQuestion()*/}
            </Grid>
            <Grid item xs={4}> 
        <div style={{top: 0,   position: 'sticky', padding: 100, fontSize: 24}}> 
              <div style={{color: this.state.saved?'green':'red', fontSize: 24}}> {this.state.saved?'Saved':'Not Saved'} </div>
                    <b> {this.state.current_entity} </b> <br />
                      {this.state.description}
                      </div>
            </Grid>

    </Grid>
   
      </div>
   }
  }
}
