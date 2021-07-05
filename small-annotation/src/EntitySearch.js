import * as React from "react";
import {getCookie,setCookie,arrayRotate} from "./Util";
import {Redirect} from 'react-router-dom';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import CircularProgress from '@material-ui/core/CircularProgress';
import {toNormalString,toNiceString, categories,difficulties,emptyOrValue} from "./Util";
import LineGraph from "./LineGraph";
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Carousel from './Carousel';
import AutoComplete from './Autocomplete';
import Dropdown from './Dropdown';
import BarGraph from './BarGraph';


interface State {
  
}

let address = "/quel";

export default class EntitySearch extends React.Component<Props, State> {
  state: State = {
    username: "",
    category_option: "Any",
    difficulty_option: "Any",
    search_entity: "",
    results: [],
    start:0,
    loading: false,
    value: "",
    autocorrect: [],
    entities: [],
    year_freq: [],
    all_entities: false,
    current_question: 0,
    initial_search: "",
    definition: "",
    search: "",
    common_definitions: {},
    common_ids: {},
    categories: {},
    default_category: "Any",
    default_difficulty: "Any",
  }
  
  update_current_question = (current_question) => {
    this.setState({current_question});
  }
  
  render_year_freq = () => {
    if(this.state.year_freq.length>0 && !this.state.loading) {
      let years = [];
      for(var i = 2005;i<=2017;i++) {
        years.push(i.toString());
      }
  
      return <div> <div style={{textAlign: 'center', marginTop: 20, marginBottom: 20, fontSize: 24}}> Questions about {this.state.search} by Year </div> <LineGraph labels={years} data={this.state.year_freq} label={"Number of Questions"} /> </div>
    }
  }
  
  render_entities = () => {
    let entities = [];
    for(var i = 0;i<this.state.entities.length;i++) {
      let entity = this.state.entities[i];
      let searchButton = (<Button style={{marginRight: 30}} onClick={()=>{this.setState({value: entity, initial_search: entity, difficulty_option: 'Any', category_option: 'Any', current_question: 0},()=>{this.get_results()})}} variant="contained"> Search </Button>);
      let definition = this.state.common_definitions[this.state.entities[i]].substring(0,200);
      let card = (<div style={{marginBottom: 20, width: "100%"}}> <Card>
      <CardContent>
        <Typography variant="h5" component="h2">
        <a href={"https://wikipedia.org/wiki?curid="+this.state.common_ids[entity]} target="_blank"> {entity} </a> 
        </Typography>
        <Typography variant="body2" component="p">
        {definition}
        </Typography>
      </CardContent>
      <CardActions>
      {searchButton}
      </CardActions>
    </Card> </div>);
      entities.push(card);
    }
    
    if(entities.length>0 && !this.state.loading) {
      return <div> <div style={{textAlign: 'center', marginTop: 20, marginBottom: 20, fontSize: 24}}> Enities related to {this.state.search} </div> <Carousel cards={entities} /> </div>
    }
  }
  
  get_results = () => {
    this.setState({loading: true, start: 0,all_entities: false});
        fetch(
      address+"/entity/"+this.state.value.replaceAll(" ","_")+"_"+this.state.category_option+"_"+this.state.difficulty_option
      ).then(res=>res.json())
      .then(res => {
        this.setState({results: res['results'], search: this.state.value.replaceAll("_"," "),entities: res['entities'],year_freq: res['year_freq'],loading: false, current_question: 0, definition: res['definition'], common_definitions: res['common_definitions'],categories: res['categories'], common_ids: res['common_ids']});
        setCookie("entity","");
      })
  }
  
  render_questions = () => {
    let ret = [];
    let ids = [];
    for(var i = 0;i<this.state.results.length;i++) {
      ids.push(this.state.results[i].id);
    }

    for(var i = 0;i<this.state.results.length;i++) {
      let annotateButton = (<Button style={{marginRight: 30}} onClick={()=>{setCookie("questions",JSON.stringify(arrayRotate(ids,i))); setCookie("packet",""); setCookie("entity",this.state.value.replaceAll("_"," ")+"_"+this.state.category_option+"_"+this.state.difficulty_option); }} variant="contained"><a href="/selected"> Annotate Question</a></Button>);
      let answer = this.state.results[i]['answer'];
      let question_id = this.state.results[i]['id'];
      let question_text = this.state.results[i]['question'].substring(0,200)+"...";
             
      let question = 
              (<div style={{marginBottom: 20, width: "100%"}}> <Card>
      <CardContent>
        <Typography variant="h5" component="h2">
        Question {i+1}
        </Typography>
        <Typography  color="textSecondary">
        {this.state.results[i]['tournament']} {this.state.results[i]['year']}
        </Typography>
        <Typography variant="body2" component="p">
        {question_text}
        </Typography>
        <Typography variant="body2" component="p">
        <b> Answer: </b> {answer}
        </Typography>
      </CardContent>
      <CardActions>
      {annotateButton}
      </CardActions>
    </Card> </div>);
      ret.push(question);        
    }
        
    return <Carousel cards={ret} />    
;
  
  }
  
  componentDidMount = () => {
    if(getCookie("entity")!="") {
      let e = getCookie("entity").split("_");
      this.setState({
        value: e[0],
        initial_search: e[0],
        category_option: e[1],
        difficulty_option: e[2],
      },()=>{this.get_results()});
    } 
    else if(getCookie("topic")!="") {
      let difficulty_option = emptyOrValue(getCookie("difficulty_option"),'Any');
      let category_option = emptyOrValue(getCookie("category_option"),'Any');      
      
      this.setState({value: getCookie("topic"),initial_search: getCookie("topic"),difficulty_option,category_option,default_difficulty: difficulty_option, default_category: category_option},()=>{this.get_results(); setCookie("topic",""); setCookie("difficulty_option",""); setCookie("category_option",""); });
    }
  }
  
  render_results = () => {
    if (this.state.loading) {
      return  <CircularProgress />

    }
    else if(this.state.results.length == 0) {
      return <div> No results found </div> 
    }
    else {
      return <div> 
      <div style={{textAlign: 'center', marginTop: 20, marginBottom: 20, fontSize: 24}}> {this.state.results.length} Questions featuring {this.state.search} </div>
      {this.render_questions(0,this.state.results.length)} 
      </div>;
    }
  }
  
  render_entity_info = () => {
    if(!this.state.loading && this.state.definition!=="") {
      return (<div> <b> Wikipedia summary for {this.state.search} </b> - {this.state.definition}.. </div>)
    }
  }
  
  render_bar_graph = () => {
    if(this.state.results.length>0 && !this.state.loading) {
      return <div> <div style={{textAlign: 'center', marginTop: 20, marginBottom: 20, fontSize: 24}}> Frequency of {this.state.search} questions by category </div>
       <BarGraph data={this.state.categories} title='Number of questions by category' /> </div> 
    }
  }
  
  render() {
    if(getCookie("token") == "") {
      return <Redirect to="/login" />;
    }
    
    let search_text = "Search for an Entity";
    if(this.state.results.length != 0) {
      search_text = "Results for "+this.state.search;
    }
    
    return <div style={{marginLeft: 30, marginBottom: 30}}> 
    <h1> {search_text}  </h1>
          <div style={{marginBottom: 20}}> <Button variant="contained" ><a href="/user"> Main Menu </a> </Button>
          </div>
          
        <div style={{fontSize: 20, display: 'inline-block', marginRight: 20}}> 
          Search for a Wikipedia entity to see it's prevelance over time, co-occuring entities, and which questions reference that entity. <br />
          For example, to see what clues come up about Chinua Achebe, search for his name, and annotate questions about him or his books
        </div>
        
        <div style={{marginTop: 10, display: 'inline-block'}}> 
          <span style={{marginRight: 20}}> <AutoComplete on_enter={this.get_results} update_value={(value)=>{this.setState({value})}} initial_value={this.state.initial_search} /> </span>

          Category: 
          <Dropdown update_value={(category_option)=>{this.setState({category_option})}} default_value={this.state.default_category} options={categories} fontSize={24} />
          
          Difficulty: 
          <Dropdown update_value={(difficulty_option)=>{this.setState({difficulty_option})}} default_value={this.state.default_difficulty} options={difficulties.concat(["Any"])} fontSize={24} />
          
          <Button style={{'border': '1px solid black'}} onClick={this.get_results}>
            Search 
          </Button> 
        </div> 
        <br /> 
        {this.render_entity_info()}
        {this.render_entities()}
        {this.render_bar_graph()}
        {this.render_year_freq()}
        {this.render_results()}

    </div>
    
  }
}
