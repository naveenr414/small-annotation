import * as React from "react";
import {getCookie,setCookie,tournaments,categories} from "./Util";
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

interface State {

}

let address = "/quel";

export default class PacketSearch extends React.Component<Props, State> {
  state: State = {
    difficulty_option: "High School", 
    year_option: 2015,
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
  }
  
  get_results = () => {
    this.setState({loading_search: true,start:0});
    let entity = this.state.value.replaceAll(" ","_");
    let year = this.state.year_option;
    let tournament = this.state.tournament_option;
    fetch(
      address+"/tournament_entity/"+entity+"_"+year+"_"+tournament
      ).then(res=>res.json())
      .then(res => {
        this.setState({results: res['data'], entities: res['entities'], loading_search: false});
      })
  }
  
  componentDidMount = () => {
    if(getCookie("packet")!="") {
      let packet_vals = getCookie("packet").split("_");
      this.setState({value: packet_vals[0],year_option: parseInt(packet_vals[1]),
                      tournament_option: packet_vals[2], 
      category_option: packet_vals[3], subcategory_option: packet_vals[4]},()=>{this.search();});
    } 
    
    if(getCookie("tournament_option")!= "") {
      this.setState({tournament_option: getCookie("tournament_option"), value: "", year_option: getCookie("year_option"), difficulty_option: getCookie("difficulty_option")},()=>{this.search()});
    }
  }
  
  
  render_search_results = () => {
    if(this.state.entities.length>0 && !this.state.loading_search) {
      
      let close_entities = [];
      let i = 0;
      while(i<this.state.entities.length) {
        let temp = [];
        let top = i+4;
        while(i<top) {
          let entity = this.state.entities[i];
          temp.push(<td style={{paddingRight: 150}}> <a target="_blank" href={"https://wikipedia.org/wiki/"+entity.replaceAll(" ","_")}> {entity} </a> </td>);
          i+=1;
        }
        close_entities.push(<tr> {temp} </tr>);
        
      }
      
      return <div> Most common co-occurring entities <table> {close_entities} </table> </div> 
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
        setCookie("packet","");
        setCookie("tournament_option","");
        setCookie("year_option", "");
        setCookie("difficulty_option","");
      })
    }
  }
  
  render_search = () => {
    
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
      let searchButton = (<Button style={{marginRight: 30}} onClick={()=>{setCookie("topic",entity.replaceAll("_"," ")); this.setState({});}} variant="contained"> Search </Button>);
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
    
    if (getCookie("topic") != "") {
      return <Redirect to="/entitysearch" />; 
    }

    return <div style={{marginLeft: 30, marginBottom: 30}}> <h1> Search by Tournament </h1> 
          <div style={{marginBottom: 50}}> <Button variant="contained" ><a href="/user"> Main Menu </a> </Button>
        </div>
    
        <div style={{textAlign: 'center', fontSize: 48, fontWeight: 'bold'}}> {this.state.tournament_option} </div>
    
        <br />
        <div> {this.render_top_entities()}<br />   
          {this.render_genders()}
        {this.render_categories()}
      </div>  
      {this.render_search()}
        {this.render_search_results()}
    </div>  
    
  }
}
