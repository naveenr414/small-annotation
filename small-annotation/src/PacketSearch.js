import * as React from "react";
import {getCookie,setCookie,tournaments,categories,arrayRotate} from "./Util";
import {Redirect} from 'react-router-dom';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import CircularProgress from '@material-ui/core/CircularProgress';
import {toNormalString,toNiceString} from "./Util";
import Autocomplete from '@material-ui/lab/Autocomplete';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Carousel from './Carousel';
import BarGraph from './BarGraph';
import AutoComplete from './Autocomplete';
import Dropdown from './Dropdown';

interface State {

}

let address = "/quel";

export default class PacketSearch extends React.Component<Props, State> {
  state: State = {
    difficulty_option: "High School", 
    year_option: -1,
    tournament_option: "",
    common_entities: [],
    search_results: [],
    search_entity: "",
    category_frequency: {},
    loading_info: false,
    loading_search: false,
    gender_counts: {'male':0,'female':0},
    common_entity_definitions: {},
    common_entity_ids: {},
    entities: [],
    all_entities: false,
    initial_search :"",
  }
  
  get_results = () => {
    this.setState({loading_search: true,start:0});
    let entity = this.state.search_entity.replaceAll(" ","_");
    let year = this.state.year_option;
    let tournament = this.state.tournament_option;
    fetch(
      address+"/tournament_entity/"+entity+"_"+year+"_"+tournament+"_"+this.state.category_option
      ).then(res=>res.json())
      .then(res => {
        this.setState({search_results: res['data'],loading_search: false});
      })
  }
  
  componentDidMount = () => {
    if(getCookie("packet")!="") {
      let packet_vals = getCookie("packet").split("_");
      this.setState({search_entity: packet_vals[0],year_option: parseInt(packet_vals[1]),
                      tournament_option: packet_vals[2], initial_search: packet_vals[0],
      difficulty_option: packet_vals[3]},()=>{this.get_results(); this.search();});
    } 
    
    if(getCookie("tournament_option")!= "") {

      this.setState({tournament_option: getCookie("tournament_option"), value: "", year_option: getCookie("year_option"), difficulty_option: getCookie("difficulty_option")},()=>{this.search()});
    }
  }
  
  
  render_search_results = () => {
    if(this.state.loading_search) {
      return <CircularProgress />
    }
    
    let ret = [];
    let ids = [];
    for(var i = 0;i<this.state.search_results.length;i++) {
      ids.push(this.state.search_results[i]['question_id']);
    }
    for(let i = 0;i<this.state.search_results.length;i++) {
      let annotateButton = (<Button style={{marginRight: 30}} onClick={()=>{setCookie("questions",JSON.stringify(arrayRotate(ids,i))); setCookie("packet",this.state.search_entity.replaceAll("_"," ")+"_"+this.state.year_option+"_"+this.state.tournament_option+"_"+this.state.difficulty_option) }} variant="contained"><a href="/selected"> Annotate Question</a></Button>);
      let answer = this.state.search_results[i]['answer'];
      let question_id = this.state.search_results[i]['question_id'];
      let question_text = this.state.search_results[i]['question'].substring(0,200)+"...";
             
      let question = 
              (<div style={{marginBottom: 20, width: "100%"}}> <Card>
      <CardContent>
        <Typography variant="h5" component="h2">
        Question {i+1}
        </Typography>
        <Typography  color="textSecondary">
        {this.state.search_results[i]['tournament']} {this.state.search_results[i]['year']}
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
    
    if(this.state.common_entities.length>0) {
      return <Carousel cards={ret} />  
    }
  }

  search = () => {
    if(this.state.difficulty_option!="" &&
    this.state.year_option>0 &&
    this.state.tournament_option!="") {
    this.setState({loading_info: true});

      fetch(
      address+"/tournament/"+this.state.year_option+"_"+this.state.tournament_option
      ).then(res=>res.json())
      .then(res => {
        this.setState({common_entities: res['data'], common_entity_definitions: res['definitions'], common_entity_ids: res['ids'], gender_counts: res['genders'], category_frequency: res['categories'], loading_info: false});
      })
    }
  }
  
  render_search = () => {
 
    if(this.state.common_entities.length>0) {
      return <div>  <div style={{textAlign: 'center', fontSize: 36}}> Search in Tournament </div> <div style={{marginLeft: 50, marginTop: 20}}> Search: <AutoComplete on_enter={this.get_results} update_value={(search_entity)=>{this.setState({search_entity})}} initial_value={this.state.initial_search} /> 
      <span style={{marginLeft: 20}}> Category: </span> <Dropdown update_value={(category_option)=>{this.setState({category_option})}} default_value={"Any"} options={categories.concat(["Any"])} fontSize={24} />
      <Button style={{'border': '1px solid black', marginLeft: 20}} onClick={this.get_results}>
            Go! 
          </Button> </div> </div>
    }
  }
  
  render_top_entities = () => {
    if(this.state.loading_info) {
      return <CircularProgress />
    }
    else if(this.state.common_entities.length == 0) {
      return <div style={{textAlign: 'center',fontSize: 36}}> No tournament selected, return to Main Menu  </div>; 
    }
    
    let entities = [];
    for(var i = 0;i<this.state.common_entities.length;i++) {
      let entity = this.state.common_entities[i];
      let searchButton = (<Button style={{marginRight: 30}} onClick={()=>{this.setState({initial_search: entity.replaceAll("_"," "),search_entity: entity.replaceAll("_"," ")},()=>{this.get_results()})}} variant="contained"> Search </Button>);
      let definition = this.state.common_entity_definitions[entity].substring(0,200)+"...";
      let card = (<div style={{marginBottom: 20, width: "100%"}}> <Card>
      <CardContent>
        <Typography variant="h5" component="h2">
        <a href={"https://wikipedia.org/wiki?curid="+this.state.common_entity_ids[entity]} target="_blank"> {entity.replaceAll("_"," ")} </a> 
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
    
    return <div> <div style={{textAlign: 'center', fontSize: 36}}> Top Entities </div>
        <Carousel cards={entities} /> </div> 
   }
    
      
  render_genders = () => {
    if(this.state.loading_info || this.state.common_entities.length == 0) {
      return <div />;
    }
    return <div> <div style={{textAlign: 'center', fontSize: 36}}> Gender Frequency of Entities </div> <BarGraph data={this.state.gender_counts} title='Frequency by Gender' /> </div>     
  }

  render_categories = () => {
    if(this.state.common_entities.length >0 && !this.state.loading_info) {
      return <div> <div style={{textAlign: 'center', fontSize: 36}}> Questions by Category </div> <BarGraph data={this.state.category_frequency} title='Questions by Category' /> </div>
    }
  }
  
  render() {
    if(getCookie("token") == "") {
      return <Redirect to="/login" />;
    }
    
/*    if (getCookie("topic") != "") {
      return <Redirect to="/entitysearch" />; 
    }*/

    return <div style={{marginLeft: 30, marginBottom: 30}}> <h1> Search by Tournament </h1> 
          <div style={{marginBottom: 50}}> <Button variant="contained" ><a href="/user"> Main Menu </a> </Button>
        </div>
    
    {this.state.year_option>0 && <div style={{textAlign: 'center', fontSize: 48, fontWeight: 'bold'}}> {this.state.tournament_option} {this.state.year_option} </div>} <br />
          {this.render_search()}
        {this.render_search_results()}

        <br />
        <div> {this.render_top_entities()}<br />   
          {this.render_genders()}
        {this.render_categories()}
      </div>  <br />
    </div>  
    
  }
}
