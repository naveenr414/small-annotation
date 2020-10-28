import * as React from "react";
import Phrase from "./Phrase";
import Grid from "@material-ui/core/Grid";


interface Props {}

interface State {
  questions: any;
  current_question: number;
  noun_phrases: string[];
  annotations: any;
  checked: any;
  current_entity: string;
  description: string;
  name: string;
}

export default class Main extends React.Component<Props, State> {
  state: State = {
    questions: [],
    current_question: 0,
    noun_phrases: [],
    annotations: {},
    checked: {},
    current_entity: "",
    description: "",
    name: "",
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
      "http://127.0.0.1:8000/questions"
      )
      .then((res) => res.json())
      .then((res) => this.setState({questions:res}));
  }
  
  get_noun_phrases = () => {
    fetch(
      "http://127.0.0.1:8000/noun_phrases/"+this.state.current_question.toString()+"_"+this.state.name
      )
      .then((res) => res.json())
      .then((res) => this.setState({noun_phrases:res,annotations:res['formatted_annotations'],checked: res['formatted_checked']},()=>{this.setState({noun_phrases: this.state.noun_phrases})}));
  }
  

  componentDidUpdate = (prevProps, prevState) => {
    if(prevState.current_question != this.state.current_question) {
      this.get_noun_phrases();
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
      xhr.open("POST", "http://127.0.0.1:8000/submit");
      xhr.send(
        JSON.stringify({
      question_num: this.state.current_question,
      person_name: this.state.name,
      annotations: annotations,
    })
  );
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
      
    return <div style={{marginLeft: 40, marginTop: 60, marginRight: 100, fontSize: 20, textAlign: 'left'}}> <h1> Question {this.state.current_question+1} </h1> <div>  <button onClick={()=>{this.submit();this.setState({current_question: (this.state.current_question+this.state.questions.length-1)%this.state.questions.length,noun_phrases:[], annotations: {}, checked: {}})}}> Previous </button>  &nbsp; &nbsp;  &nbsp; &nbsp; <button onClick={()=>{this.submit();this.setState({current_question: (this.state.current_question+1)%this.state.questions.length,noun_phrases:[],annotations: {}, checked: {}})}}> Next </button>  &nbsp; &nbsp;  &nbsp; &nbsp;<button onClick={this.submit}> Submit </button>  </div> <br /> <div > {q} </div> <br /> <div> <b> Instructions: </b> Enter noun phrase, and check off if Named Entity <br /> <br /> {noun_phrases} </div> </div>
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