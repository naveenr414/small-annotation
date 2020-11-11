import * as React from "react";
import Phrase from "./Phrase";
import Word from "./Word";
import Grid from "@material-ui/core/Grid";


let address = "http://127.0.0.1:1234";

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
    this.state.checked[i] = checked;
    this.state.annotations[i] = annotation;
  }
  
  get_questions = () => {
    fetch(
      address+"/questions"
      )
      .then((res) => res.json())
      .then((res) => this.setState({questions:res['questions'],answers:res['answers']}));
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
      this.setState({end: num, add_entity: false});
      alert(this.state.start + " "+num);
      // Add in the entity
      let left_context = this.state.noun_phrases['words'].slice(Math.max(0,this.state.start-5),this.state.start);
      let content = this.state.noun_phrases['words'].slice(this.state.start,num+1);
      let right_context = this.state.noun_phrases['words'].slice(num+1,Math.min(num+6,this.state.noun_phrases['words'].length));

      this.state.noun_phrases['nouns']['spans'].push([this.state.start,num]);
      this.state.noun_phrases['nouns']['text'].push({'context_left': left_context.join(' '),'content': content.join(' '), context_right: right_context.join(' ')});
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
  
    alert("Saved!");
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
        for(var i = 0;i<this.state.noun_phrases['words'].length;i++) {
          t.push(<Word callback={this.update_span} text={this.state.noun_phrases['words'][i] + " "} num={i} add_entity={this.state.add_entity} key={i} />);
        }
      }
  t.push(<div> Answer: <b> {this.state.answers[this.state.current_question]} </b> </div>);
      return t;
  }
  
  
  renderQuestion = () => {
    let q = this.state.questions[this.state.current_question];
    let noun_phrases = [];
    
        
    if("nouns" in this.state.noun_phrases){      
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
      noun_phrases.push(<div> Loading noun phrases </div>);
    }
      
    return (<div >
        <div> 
              <h1> Question {this.state.current_question+1} </h1> 

          <div style={{fontSize: 24}}>  
            <button onClick={()=>{this.submit();this.setState({current_question: (this.state.current_question+this.state.questions.length-1)%this.state.questions.length,noun_phrases:[], annotations: {}, checked: {}})}}>
              Previous 
            </button>  
            &nbsp; &nbsp;  &nbsp; &nbsp; 
            <button onClick={()=>{this.submit();this.setState({current_question: (this.state.current_question+1)%this.state.questions.length,noun_phrases:[],annotations: {}, checked: {}})}}> 
              Next 
            </button>  
            &nbsp; &nbsp;  &nbsp; &nbsp;
            <button onClick={this.submit}> 
              Submit 
            </button>
            <br />
            <button onClick={()=>{this.setState({add_entity: !this.state.add_entity})}}> 
              Add Entity
            </button>
          </div> 
          
  <div style={{fontSize: 24, marginLeft: 20, marginRight: 20}}> {this.show_question()} </div> 
          <br /> 
          <div style={{fontSize: 24, marginLeft: 20, marginRight: 20}}>
          <b> Instructions: </b> 
          Enter noun phrase, and check off if Named Entity
          <br /> 
          </div>
        </div> 
        <br /> 
        <div style={{paddingLeft: 20}}> 
          <br /> {noun_phrases} </div> </div>);
  }
  
  render() {
    if(this.state.questions.length == 0) {
      return <h1> Loading </h1> 
    }
    else {
      return <div> 
            <Grid container spacing={3}>

            <Grid item xs={8}> 
              {this.renderQuestion()}
            </Grid>
            <Grid item xs={4}> 
        <div style={{top: 0,   position: 'sticky', padding: 100, fontSize: 24}}> 

                    <b> {this.state.current_entity} </b> <br />
                      {this.state.description}
                      </div>
            </Grid>

    </Grid>
   
      </div>
   }
  }
}
