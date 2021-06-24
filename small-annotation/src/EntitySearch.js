import * as React from "react";
import {getCookie,setCookie} from "./Util";
import {Redirect} from 'react-router-dom';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import CircularProgress from '@material-ui/core/CircularProgress';
import {toNormalString,toNiceString, categories,difficulties} from "./Util";
import { Line } from "react-chartjs-2";
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { Carousel } from 'react-responsive-carousel';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import ItemsCarousel from 'react-items-carousel';
import AutoComplete from './Autocomplete';
import Dropdown from './Dropdown';


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
       let data = {
         labels: years,
         datasets: [
           {
            label: "Entity Frequency by Year",
            data: this.state.year_freq,
            fill: true,
            backgroundColor: "rgba(75,192,192,0.2)",
            borderColor: "rgba(75,192,192,1)",
           }
         ]
         };
       return <Line width={1500} height={200} data={data} />;
    }
  }
  
  render_entities = () => {
    if(this.state.entities.length>0 && !this.state.loading) {
      
      let table = [];
      let i = 0;
      let top = this.state.entities.length;
      if(!this.state.all_entities) {
        top = 4;
      }
      while(i<top){ 
        let temp = [];
        let next = i+4;
        while(i<next) {
          if(i<this.state.entities.length) {
            let entity = this.state.entities[i];
            let elem = (<td style={{textAlign: 'left',marginRight: 60, paddingRight: 60}}> <a target="_blank" href={"https://wikipedia.org/wiki/"+entity.replaceAll(" ","_")}> {entity} </a> 
            <button onClick={()=>{this.setState({value: entity, initial_search: entity, difficulty_option: 'Any', category_option: 'Any', current_question: 0},()=>{this.get_results();})}}> Search </button> </td>);
            temp.push(elem);
          }
           i++;

        }
        
        table.push(<tr> {temp} </tr>);
      }
      
      return <div> Most common co-occurring entities <table>
      {table}
      </table> <br /> 
      <Button style={{'border': '1px solid black'}} onClick={()=>{this.setState({all_entities: !this.state.all_entities})}}>
        {this.state.all_entities? 'Show Less': 'Show More'} 
        </Button> 
      </div> 
    }
  }
  
  get_results = () => {
    this.setState({loading: true, start: 0,all_entities: false});
        fetch(
      address+"/entity/"+this.state.value.replaceAll(" ","_")+"_"+this.state.category_option+"_"+this.state.difficulty_option
      ).then(res=>res.json())
      .then(res => {
        this.setState({results: res['results'], entities: res['entities'],year_freq: res['year_freq'],loading: false, current_question: 0 });
        setCookie("entity","");
      })
  }
  
  render_questions = (start,end) => {
    let ret = [];
    let ids = [];
    for(var i = 0;i<this.state.results.length;i++) {
      ids.push(this.state.results[i].id);
    }
      function arrayRotate(arr, n) {
        let dup = arr.slice();
        for(var i = 0;i<n;i++) {
          dup.push(dup.shift());
        }
        return dup;
      }

    for(var i = start;i<end;i++) {
      if(i>=this.state.results.length) {
        return ret; 
      }
      let annotateButton = (<Button style={{marginRight: 30}} onClick={()=>{setCookie("questions",JSON.stringify(arrayRotate(ids,i))); setCookie("packet",""); setCookie("entity",this.state.value.replaceAll("_"," ")+"_"+this.state.category_option+"_"+this.state.difficulty_option); }} variant="contained"><a href="/selected"> Annotate Question</a></Button>);
      let answer = this.state.results[i]['answer'];
      let question_id = this.state.results[i]['id'];
      let question_text = this.state.results[i]['question'].substring(0,200)+"...";
             
      let question = 
              (<div style={{marginBottom: 20, width: 400}}> <Card>
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
        
    return      <div style={{padding: '0 40px'}}> <ItemsCarousel
        requestToChangeActive={this.update_current_question}
        activeItemIndex={this.state.current_question}
        numberOfCards={2}
        gutter={20}
        leftChevron={<button>{'<'}</button>}
        rightChevron={<button>{'>'}</button>}
        outsideChevron
        chevronWidth={40}
      >
      {ret}
      </ItemsCarousel> </div>
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
      this.setState({value: getCookie("topic"),initial_search: getCookie("topic"),difficulty_option: 'Any', category_option: 'Any'},()=>{this.get_results(); setCookie("topic","");});
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
      {this.render_questions(0,this.state.results.length)} 
      </div>;
    }
  }
  
  render() {
    if(getCookie("token") == "") {
      return <Redirect to="/login" />;
    }
    
    
    return <div style={{marginLeft: 30, marginBottom: 30}}> 
    <h1> Search for an Entity  </h1>
          <div style={{marginBottom: 20}}> <Button variant="contained" ><a href="/user"> Main Menu </a> </Button>
          </div>
          
        <div style={{fontSize: 20, display: 'inline-block'}}> 
          Search for a Wikipedia entity to see it's prevelance over time, co-occuring entities, and which questions reference that entity. <br />
          For example, to see what clues come up about Chinua Achebe, search for his name, and annotate questions about him or his books
        </div>
        <AutoComplete update_value={(value)=>{this.setState({value})}} initial_value={this.state.initial_search} />
        
        <div style={{marginTop: 10, display: 'inline-block'}}> 
          Category: 
          <Dropdown update_value={(category_option)=>{this.setState({category_option})}} default_value={"Any"} options={categories} />
          
          Difficulty: 
          <Dropdown update_value={(difficulty_option)=>{this.setState({difficulty_option})}} default_value={"Any"} options={difficulties.concat(["Any"])} />
          
          <Button style={{'border': '1px solid black'}} onClick={this.get_results}>
            Search 
          </Button> 
        </div> 
        <br /> 
        {this.render_year_freq()}
        {this.render_entities()}
        {this.render_results()}

    </div>
    
  }
}
