import * as React from "react";
import Phrase from "./Phrase";
import Dragbox from "./Dragbox";
import Word from "./Word";
import Search from "./Search";
import Grid from "@material-ui/core/Grid";
import Switch from '@material-ui/core/Switch';
import {Editor, EditorState, ContentState} from 'draft-js';
import 'draft-js/dist/Draft.css';
import {DraggableArea,DraggableAreasGroup} from 'react-draggable-tags';

let address = "/api";
const group = new DraggableAreasGroup();

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
  tags: any;
  tags2: any;
  draggables: any;
  tags3: any;
  tags4: any;
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
    tag_list: [],
    tags0: [],
    tags: [],
    tags2: [],
    draggables: [],
  }
      
  update_tags = (tags,number) => {
    let tag_list = this.state.tag_list.slice();
    tag_list[number] = tags;
    this.setState({tag_list});
  }
  
  create_new_tag = () => {
    let tag_list = this.state.tag_list.slice();
    tag_list.push([]);
    this.setState({tag_list});
  }
  
  render_draggable_0 = () => {
    if(this.state.tag_list.length>0) {
      return <Dragbox entity_number={0} drag_group={group} update_tags={this.update_tags} current_tags={this.state.tag_list[0]} />
    }
    return <div> </div>;
  }
  
  render_draggables = () => {
    let all_draggables = [];
    for(var i = 1;i<this.state.tag_list.length;i++) {
      all_draggables.push(<Dragbox entity_number={i} drag_group={group} update_tags={this.update_tags} current_tags={this.state.tag_list[i]} />);
    }
    return all_draggables;
  }
  
  componentDidMount = () => {
    //console.log(DraggableArea1);
    let name = prompt("What's your name").toLowerCase();
    this.setState({name},()=>{    this.get_questions();
    this.get_noun_phrases();});
    this.create_new_tag();
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
      const group = new DraggableAreasGroup();
      const DraggableArea3 = group.addArea();
      const DraggableArea4 = group.addArea();
      let draggables = this.state.draggables;
      draggables.push(<DraggableArea3
    tags={this.state.tags}
    render={({tag, index}) => (
      <div style={{fontSize: 13,margin: 3,border: "1px dashed #cccccc", borderRadius: 4, padding: "0 8px", lineHeight: 1,color: "#666666", background: "rgba(255, 255, 255, 0.7)"}}>
        {tag.content}
      </div>
    )}
    onChange={tags => this.setState({tags})}
  />);
      console.log(draggables);
      this.setState({draggables});
    
      let real_start = 0;
      let real_end = 10;
      let start_word_num = 0;
      let end_word_num = 1;
      
      
      for(var i = 0;i<this.state.noun_phrases.indices.length;i++) {
        if(this.state.noun_phrases.indices[i]<=this.state.start) {
          real_start = this.state.noun_phrases.indices[i];
          start_word_num = i;
        }
      }
      
      for(var i = this.state.noun_phrases.indices.length-1;i>=0;i--) {
        if(this.state.noun_phrases.indices[i]>this.state.end && i!=0) {
          real_end = this.state.noun_phrases.indices[i-1]+this.state.noun_phrases.words[i-1].length;
          end_word_num = i-1;
        }
      }
      
      console.log(this.state.questions[this.state.current_question]);
      console.log(real_start);
      console.log(real_end);
      
      
      const tag_list = this.state.tag_list.slice();
      tag_list[0].push({'start':start_word_num,'end':end_word_num,'content':this.state.questions[this.state.current_question].substring(real_start,real_end)});
      this.setState({tag_list});

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
<div>  <Editor onClick={()=>alert("A")} keyBindingFn={() => 'not-handled-command'} editorState={this.state.editorState} onChange={this.editorChange} /> </div>
<button style={{fontSize: 24}}  onClick={this.createTag} > Create Tag </button>
{/*<DraggableArea1
    tags={this.state.tags}
    render={({tag, index}) => (
      <div style={{fontSize: 13,margin: 3,border: "1px dashed #cccccc", borderRadius: 4, padding: "0 8px", lineHeight: 1,color: "#666666", background: "rgba(255, 255, 255, 0.7)"}}>
        {tag.content}
      </div>
    )}
    onChange={tags => this.setState({tags})}
  /> <br />
  <DraggableArea2
    tags={this.state.tags2}
    render={({tag, index}) => (
      <div style={{fontSize: 13,margin: 3,border: "1px dashed #cccccc", borderRadius: 4, padding: "0 8px", lineHeight: 1,color: "#666666", background: "rgba(255, 255, 255, 0.7)"}}>
        {tag.content}
      </div>
    )}
    onChange={tags2 => this.setState({tags2})}
  /> */}
  {this.render_draggable_0()}

              {/*this.renderQuestion()*/}
            </Grid>
            <Grid item xs={4}>
            <button style={{fontSize: 24, marginTop: 50}}  onClick={this.create_new_tag} > Create New Entity </button>

              {this.render_draggables()}
             
                        

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
