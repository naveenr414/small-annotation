import * as React from "react";
import {getCookie,setCookie} from "./Util";
import {Redirect} from 'react-router-dom';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';


interface State {

}

let address = "/quel";

let tournaments ={'High School': {2016: ['A Bit of Lit', 'BHSAT', 'HFT XI', 'PACE NSC', 'SCOP', 'WHAQ'], 2017: ['BHSAT', 'Ladue Invitational Sprint Tournament (LIST)', 'PACE NSC', 'Prison Bowl'], 1998: ['PACE NSC'], 2000: ['PACE NSC'], 2001: ['PACE NSC'], 2002: ['PACE NSC'], 2003: ['Delta Burke', 'PACE NSC'], 2004: ['Illinois Earlybird', 'PACE NSC'], 2005: ['Crusader Cup', 'Illinois Earlybird', 'Maryland Spring Classic', 'PACE NSC'], 2006: ['Illinois Earlybird', 'Maryland Spring Classic', 'PACE NSC', 'WUHSAC VIII'], 2007: ['Maggie Walker GSAC XV', 'Maryland Spring Classic', 'WUHSAC IX'], 2008: ['Bulldog High School Academic Tournament (BHSAT)', 'Chitin', 'HAVOC', 'HFT', 'HSAPQ 4Q 1', 'HSAPQ ACF 1', 'HSAPQ ACF 2', 'HSAPQ ACF 3', 'HSAPQ NSC 1', 'HSAPQ NSC 2', 'Maggie Walker GSAC XVI', 'NNT', 'NTV', 'New Trier Scobol Solo', 'PACE NSC', 'Prison Bowl', 'QuAC I', 'UIUC High School Solo'], 2009: ['BATE', 'BHSAT', 'DAFT', 'Fall Kickoff Tournament', 'Fall Kickoff Tournament (FKT)', 'Fall Novice', 'From Here To Eternity', 'HAVOC II', 'HFT', 'HSAPQ 4Q1', 'HSAPQ 4Q2', 'HSAPQ NASAT Tryout Set', 'HSAPQ Tournament 10', 'HSAPQ Tournament 11', 'HSAPQ Tournament 8', 'HSAPQ Tournament 9', 'MOHIT (Thomas Jefferson)', 'MW GSAC XVII', 'NTV', 'New Trier Scobol Solo', 'PACE NSC', 'Prison Bowl', 'U. of Georgia CCC', 'WUHSAC XI', 'Weekend of Quizbowl Saturday Event'], 2010: ['BATE', 'BHSAT', 'Fall Kickoff Tournament', 'Fall Kickoff Tournament (FKT)', 'Fall Novice', 'GDS Ben Cooper Memorial', 'Harvard Fall Tournament', 'Maggie Walker GSAC', 'Maggie Walker GSAC XVIII', 'Maryland Spring Classic', 'NTSS', 'PACE NSC', 'Prison Bowl', 'SCOP Novice', 'TJ NAREN', 'Vanderbilt ABC/2011 VCU Winter'], 2011: ['BDAT I', 'BHSAT', 'Centennial (MD) Housewrite', 'Fall Kickoff Tournament (FKT)', 'HSAPQ Colonia 2', 'HSAPQ National History Bowl', 'HSAPQ Tournament 15', 'HSAPQ Tournament 16', 'HSAPQ Tournament 17', 'HSAPQ VHSL Districts', 'HSAPQ VHSL Regionals', 'HSAPQ VHSL Regular Season', 'HSAPQ VHSL States', 'Ladue Invitational Spring Tournament', 'Maggie Walker GSAC', 'Maggie Walker GSAC XIX', 'Minnesota Novice Set', 'New Trier Scobol Solo', 'OLEFIN', 'PACE NSC', 'Prison Bowl', 'SCOP Novice', 'St. Anselms and Torrey Pines'], 2012: ['BHSAT', 'Fall Kickoff Tournament (FKT)', 'Harvard Fall Tournament', 'Harvard Fall Tournament VII', 'LIST', 'LIST (Ladue Invitational Spring Tournament)', 'Ladue Invitational Spring Tournament', 'Ladue Invitational Sprint Tournament (LIST)', 'MSU/UD Housewrite', 'Maggie Walker GSAC', 'Maryland Spring', 'New Trier Scobol Solo', 'Ohio State/VCU housewrite', 'PACE NSC', 'Prison Bowl', 'RAVE', 'SCOP 3', 'SCOP Novice'], 2013: ['BHSAT', 'BISB', 'Brookwood Invitational Scholars Bowl', 'FKT', 'JAMES', 'LIST', 'LIST (Ladue Invitational Spring Tournament)', 'Ladue Invitational Sprint Tournament (LIST)', 'Maggie Walker GSAC', 'NTSS', 'New Trier Scobol Solo', 'PACE NSC', 'Prison Bowl', 'SASS', 'SCOP Novice', 'Scobol Solo'], 2014: ['BELLOCO', 'BHSAT', 'LIST', 'LIST (Ladue Invitational Spring Tournament)', 'Ladue Invitational Sprint Tournament (LIST)', 'Masonic', 'New Trier Scobol Solo', 'PACE NSC', 'Prison Bowl', 'SCOP Novice'], 2015: ["BISB (Brookwood Invitational Scholars' Bowl)", 'GSAC XXIII', 'HFT X', 'JAMES', 'Maryland Fall', 'PACE NSC', 'Prison Bowl']}, 'Middle School': {2010: ['Collaborative MS Tournament'], 2011: ['Collaborative MS Tournament'], 2012: ['Collaborative MS Tournament'], 2013: ['Collaborative MS Tournament'], 2015: ['SCOP 6 MS']}, 'Open': {2016: ['A Culture of Improvement', 'CLEAR II', 'Chicago Open', 'Christmas Present', 'GRAPHIC', 'Geography Monstrosity'], 2017: ['(This) Tournament is a Crime', 'Chicago Open', 'FRENCH', 'Fine Arts Common Links', 'GRAB BAG', 'Geography Monstrosity', "It's Lit", 'Jordaens Visual Arts', 'Letras', 'Math Monstrosity', 'Naveed Bork Memorial Tournament', 'Scattergories'], 1998: ['Virginia Open'], 1999: ['ACF Nationals'], 2000: ['ACF Nationals', 'Chicago Open', 'St. Louis Open'], 2001: ['ACF Nationals', 'Michigan Artaud', 'St. Louis Open'], 2002: ['ACF Nationals', 'Chicago Open'], 2003: ['ACF Nationals', 'Chicago Open', 'Illinois Open'], 2004: ['ACF Nationals', 'Chicago Open', 'Chicago Open Lit', 'Science Monstrosity'], 2005: ['ACF Nationals', 'Illinois Open', 'Jacopo Pontormo (history tournament)', 'Michigan Manu Ginobili Open', 'Science Monstrosity', 'Teitler Myth Singles', 'Toby Keith Hybrid'], 2006: ['ACF Nationals', 'Chicago Open', 'Chicago Open History Doubles', 'Illinois Open Literature Tournament', 'Toby Keith Hybrid'], 2007: ['ACF Nationals', 'Chicago Open', 'Chicago Open Lit', 'The Experiment'], 2008: ['ACF Nationals', 'Cardinal Classic XVII', 'Chicago Open', 'Chicago Open Literature', 'Gaddis I', 'Gunpei Yokoi Memorial Open (side event)', 'Illinois Open', 'Minnesota Open', "Sun 'n' Fun", 'The Experiment II', 'VCU Open'], 2009: ['ACF Nationals', 'Cardinal Classic XVIII', 'Chicago Open', 'Chicago Open Literature', 'Gaddis II', 'Geography Monstrosity', 'Illinois Open/(Fall) Terrapin Invitational', 'Minnesota Open KLEE Fine Arts', 'Minnesota Open Lederberg Memorial Science Tournament', 'Minnesota Open Lit', 'Science Non-Strosity', 'The Experiment II', 'Tyrone Slothrop Lit', 'Tyrone Slothrop Literature Singles', 'VCU Open'], 2010: ['ACF Nationals', 'ANGST', 'BELFAST Arts', 'Chicago Open', 'Chicago Open Arts', 'Chicago Open Literature', 'Geography Monstrosity', 'Julius Civilis Classics Tournament', 'MELD', 'Minnesota Open', 'Spring Offensive (history tournament)', 'VCU Open (Saturday)'], 2011: ['ACF Nationals', 'Chicago Open', 'Chicago Open History', 'Geography Monstrosity', 'Guerrilla at ICT', 'Illinois Open', 'Illinois Wissenschaftslehre', 'Law Bowl', 'Minnesota Open', 'The Bob Loblaw Law Bowl'], 2012: ['ANFORTAS', 'Chicago Open', 'College History Bowl', 'Geography Monstrosity', 'Geography Monstrosity 4', 'History Doubles at Chicago Open', 'Minnesota Open', 'The Questions Concerning Technology', 'VETO'], 2013: ['Arrabal', 'Chicago Open', 'Fernando Arrabal Tournament of the Absurd', 'Geography Monstrosity', "Schindler's Lit", 'VCU Open', 'VETO'], 2014: ['3M: Chicago Open History', 'Cane Ridge Revival', 'Chicago Open', 'Geography Monstrosity', 'Gorilla Lit', 'Lederberg Memorial Science Tournament 2: Daughter Cell', 'Oxford Open', 'VCU Open'], 2015: ['ACF Nationals', 'BHSAT', 'Chicago Open', 'Chicago Open History', 'Chicago Open Visual Arts', 'Claude Shannon Memorial Tournament', 'Geography Monstrosity', 'George Oppen', 'RILKE', 'VCU Open', 'VICO', 'We Have Never Been Modern']}, 'College': {1997: ['ACF Nationals', 'ACF Regionals', 'Virginia Wahoo War'], 1998: ['ACF Nationals', 'ACF Regionals', 'Terrapin Invitational Tournament', 'Virginia Wahoo War'], 1999: ['ACF Regionals'], 2000: ['ACF Regionals', 'Illinois Novice'], 2001: ['ACF Fall', 'ACF Regionals', 'Illinois Novice', 'Kentucky Wildcat'], 2002: ['ACF Fall', 'ACF Regionals', 'Illinois Novice', 'Kentucky Wildcat', 'Penn Bowl'], 2003: ['ACF Fall', 'ACF Regionals', 'Kentucky Wildcat', 'Michigan Auspicious Incident', 'The New Tournament at Cornell'], 2004: ['ACF Fall', 'ACF Regionals', 'Aztlan Cup', 'Berkeley WIT XII'], 2005: ['ACF Fall', 'ACF Regionals', 'Terrapin Invitational Tournament', "Virginia J'ACCUSE!"], 2006: ['ACF Fall', 'ACF Regionals', 'Aztlan Cup II/Brown UTT/UNC AWET', 'Chicago John Stuart Mill', 'Early Fall Tournament (EFT)', 'MLK', 'Terrapin Invitational Tournament'], 2007: ['ACF Fall', 'ACF Regionals', 'Early Fall Tournament (EFT)', 'MLK', 'Matt Cvijanovich Memorial Novice Tournament', 'Penn Bowl', 'Titanomachy'], 2008: ['ACF Fall', 'ACF Regionals', 'Early Fall Tournament (EFT)', 'FEUERBACH', 'FICHTE', 'MUT', 'Matt Cvijanovich Memorial Novice Tournament', 'Minnesota Undergraduate Tournament (MUT)', 'Penn Bowl', 'RMP Fest', 'Terrapin Invitational Tournament', 'Zot Bowl'], 2009: ['ACF Fall', 'ACF Regionals', 'ACF Winter', 'Chipola Lit + Fine Arts', 'Delta Burke', 'FICHTE', 'FIST', 'MUT', 'Mahfouz Memorial Lit', 'Penn Bowl', 'RMP Fest', 'THUNDER'], 2010: ['ACF Fall', 'ACF Novice', 'ACF Regionals', 'ACF Winter', 'Delta Burke', 'EFT', 'Early Fall Tournament (EFT)', 'Geography Monstrosity 2', 'Guerrilla at ICT', 'Harvard International', 'MUT', 'NASAT', 'Penn Bowl', 'Princeton Buzzerfest', 'Sun n Fun', 'T-Party', 'THUNDER II', 'VCU Open (Sunday)', 'Wild Kingdom'], 2011: ['ACF Fall', 'ACF Regionals', 'Cheyne 1980s American History', 'Cheyne American History', 'Collegiate Novice', 'Delta Burke', 'MAGNI', 'MUT', 'Missiles of October', 'NASAT', 'Penn Bowl', 'SACK', 'Terrapin Invitational', 'Terrapin Invitational Tournament', 'VCU Open'], 2012: ['ACF Fall', 'ACF Nationals', 'ACF Regionals', 'BARGE', 'Cheyne American History', 'Collegiate Novice', 'Delta Burke', 'Illinois Fall', 'Illinois Fall Tournament', 'KABO', 'MUT', 'NASAT', 'NHBB College Nationals', 'Peaceful Resolution', 'Penn Bowl', 'Penn-ance', 'QUARK', 'WELD', 'YMIR'], 2013: ['ACF Fall', 'ACF Nationals', 'ACF Regionals', 'Angels in the Architecture', 'Cheyne American History', 'Collegiate Novice', 'DRAGOON', 'Delta Burke', 'Delta Burke 2013', 'MUT', 'Michigan Fall Tournament', 'NASAT', 'Penn Bowl', 'Terrapin', 'Terrapin Invitational Tournament', 'VCU Closed', 'WIT', 'Western Invitational Tournament'], 2014: ['ACF Fall', 'ACF Nationals', 'ACF Regionals', 'Cheyne American History People', 'Cheyne American Thought', 'College History Bowl', 'DEES', 'Delta Burke', 'ICCS', 'MUT', 'Mavis Gallant Memorial Tournament (Literature)', 'NASAT', 'PADAWAN', 'Penn Bowl', 'SUBMIT'], 2015: ['ACF Fall', 'ACF Regionals', 'Delta Burke', 'MUT', 'Missouri Open', 'NASAT', 'Penn Bowl', 'SHEIKH', 'STIMPY'], 2016: ['"stanford housewrite"', 'ACF Fall', 'ACF Nationals', 'ACF Regionals', 'Delta Burke', 'Early Fall Tournament (EFT)', 'Listory', 'MLK', 'MUT', 'MYSTERIUM', 'NASAT', 'Penn Bowl', 'Terrapin Invitational Tournament'], 2017: ['ACF Fall', 'ACF Nationals', 'ACF Regionals', 'EMT', 'Early Fall Tournament (EFT)', 'JAKOB', 'MASSOLIT', 'NASAT', 'Penn Bowl', 'Sivakumar Day Inter-Nationals', 'WAO', 'XENOPHON'], 2018: ['ACF Regionals']}}


export default class PacketSearch extends React.Component<Props, State> {
  state: State = {
    username: "",
    difficulty_option: "High School", 
    year_option: 2016,
    tournament_option: "BHSAT",
    summary_stats: [],
    results: [],
    search_entity: "",
  }
  
  get_results = () => {
        fetch(
      address+"/tournament_entity/"+this.state.search_entity.replaceAll(" ","_")+"_"+this.state.year_option+"_"+this.state.tournament_option
      ).then(res=>res.json())
      .then(res => {
        this.setState({results: res});
      })
  }
  
  
  search = () => {
    if(this.state.difficulty_option!="" &&
    this.state.year_option>0 &&
    this.state.tournament_option!="") {
      fetch(
      address+"/tournament/"+this.state.year_option+"_"+this.state.tournament_option
      ).then(res=>res.json())
      .then(res => {
        this.setState({summary_stats: res});
      })
    }
  }
  
  get_user_info = () => {
    fetch(
      address+"/user/"+getCookie("token")
      ).then(res=>res.json())
      .then(res => {
        this.setState({username: res['username'],});
      })
  }
  componentDidMount = ()=> {
    if(getCookie("token") !== "") {
      this.get_user_info();
    }
  }
  
  render_top_entities = () => {
    let top_entities = [];
    for(var i = 0;i<this.state.summary_stats.length;i++) {
      top_entities.push(<li> {this.state.summary_stats[i][0].replaceAll("_"," ")} ({this.state.summary_stats[i][1]} mentions) </li>);
    }
    
    
    return top_entities;
  }
  
  render_results = () => {
    if(this.state.results.length == 0) {
      return <div> No results found </div> 
    }
    else {
      let ret = [];
      for(var i = 0; i<this.state.results.length;i++) {
        ret.push(<div style={{width: 500, marginBottom: 50}}> <b> Question: </b> {this.state.results[i]['question']} <br /> <b> Answer: </b> {this.state.results[i]['answer']} <br /> <b> Tournament: </b> {this.state.results[i]['tournament']} </div>);
                  
      }
      
      return ret;
    }
  }
  
  render() {
    if(getCookie("token") == "") {
      return <Redirect to="/login" />;
    }
    
    return <div style={{marginLeft: 30}}> <h1> Tournament Search </h1> 
        <Button style={{marginBottom: 50}} variant="contained" ><a href="/user"> Back </a> </Button>
    <br />
        <Select
          style={{marginLeft: 20, marginRight: 20}}
          labelId="demo-simple-select-label"
          value={this.state.difficulty_option}
          onChange={(event)=>{this.setState({difficulty_option:event.target.value})}}
        >
          {Object.keys(tournaments).map((option, index) => (
            <MenuItem
              value={option}
            >
              {option}
            </MenuItem>
          ))}
        </Select>
        <Select
          style={{marginLeft: 20, marginRight: 20}}
          labelId="demo-simple-select-label"
          value={this.state.year_option}
          onChange={(event)=>{this.setState({year_option:parseInt(event.target.value)})}}

        >
          {Object.keys(tournaments[this.state.difficulty_option]).map((option, index) => (
            <MenuItem
              value={option}
            >
              {option}
            </MenuItem>
          ))}
        </Select>
        <Select
          style={{marginLeft: 20, marginRight: 20}}
          labelId="demo-simple-select-label"
          value={this.state.tournament_option}
          onChange={(event)=>{this.setState({tournament_option:event.target.value})}}

        >
          {tournaments[this.state.difficulty_option][this.state.year_option].map((option, index) => (
            <MenuItem
              value={option}
            >
              {option}
            </MenuItem>
          ))}
        </Select>
        <Button style={{'border': '1px solid black'}} onClick={this.search}> Find Info </Button>
        <br />
        <b> Top Entities </b> 
        <ol> {this.render_top_entities()} </ol> <br />
         <TextField id="standard-basic" style={{marginRight: 30}} onChange={(event)=>{this.setState({search_entity: event.target.value})}} />
        <Button style={{'border': '1px solid black'}} onClick={this.get_results}>
          Search 
        </Button> 
        {this.render_results()}
    </div>
    
  }
}
