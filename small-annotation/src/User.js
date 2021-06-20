import * as React from "react";
import {getCookie,setCookie} from "./Util";
import {Redirect} from 'react-router-dom';
import Button from '@material-ui/core/Button';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { Input } from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import {toNormalString,toNiceString} from "./Util";

interface State {
  username: string;
  edits: any;
  option: string;
  option_open: boolean;
}

let address = "/quel";

const categories = ['Any','Literature', 'Social Science', 'History', 'Science', 'Fine Arts', 'Trash', 'Religion', 'Philosophy', 'Geography', 'Mythology', 'Current Events'];
const difficulties = ['Middle School','High School','College','Open'];
let tournaments ={'High School': {2016: ['A Bit of Lit', 'BHSAT', 'HFT XI', 'PACE NSC', 'SCOP', 'WHAQ'], 2017: ['BHSAT', 'Ladue Invitational Sprint Tournament (LIST)', 'PACE NSC', 'Prison Bowl'], 1998: ['PACE NSC'], 2000: ['PACE NSC'], 2001: ['PACE NSC'], 2002: ['PACE NSC'], 2003: ['Delta Burke', 'PACE NSC'], 2004: ['Illinois Earlybird', 'PACE NSC'], 2005: ['Crusader Cup', 'Illinois Earlybird', 'Maryland Spring Classic', 'PACE NSC'], 2006: ['Illinois Earlybird', 'Maryland Spring Classic', 'PACE NSC', 'WUHSAC VIII'], 2007: ['Maggie Walker GSAC XV', 'Maryland Spring Classic', 'WUHSAC IX'], 2008: ['Bulldog High School Academic Tournament (BHSAT)', 'Chitin', 'HAVOC', 'HFT', 'HSAPQ 4Q 1', 'HSAPQ ACF 1', 'HSAPQ ACF 2', 'HSAPQ ACF 3', 'HSAPQ NSC 1', 'HSAPQ NSC 2', 'Maggie Walker GSAC XVI', 'NNT', 'NTV', 'New Trier Scobol Solo', 'PACE NSC', 'Prison Bowl', 'QuAC I', 'UIUC High School Solo'], 2009: ['BATE', 'BHSAT', 'DAFT', 'Fall Kickoff Tournament', 'Fall Kickoff Tournament (FKT)', 'Fall Novice', 'From Here To Eternity', 'HAVOC II', 'HFT', 'HSAPQ 4Q1', 'HSAPQ 4Q2', 'HSAPQ NASAT Tryout Set', 'HSAPQ Tournament 10', 'HSAPQ Tournament 11', 'HSAPQ Tournament 8', 'HSAPQ Tournament 9', 'MOHIT (Thomas Jefferson)', 'MW GSAC XVII', 'NTV', 'New Trier Scobol Solo', 'PACE NSC', 'Prison Bowl', 'U. of Georgia CCC', 'WUHSAC XI', 'Weekend of Quizbowl Saturday Event'], 2010: ['BATE', 'BHSAT', 'Fall Kickoff Tournament', 'Fall Kickoff Tournament (FKT)', 'Fall Novice', 'GDS Ben Cooper Memorial', 'Harvard Fall Tournament', 'Maggie Walker GSAC', 'Maggie Walker GSAC XVIII', 'Maryland Spring Classic', 'NTSS', 'PACE NSC', 'Prison Bowl', 'SCOP Novice', 'TJ NAREN', 'Vanderbilt ABC/2011 VCU Winter'], 2011: ['BDAT I', 'BHSAT', 'Centennial (MD) Housewrite', 'Fall Kickoff Tournament (FKT)', 'HSAPQ Colonia 2', 'HSAPQ National History Bowl', 'HSAPQ Tournament 15', 'HSAPQ Tournament 16', 'HSAPQ Tournament 17', 'HSAPQ VHSL Districts', 'HSAPQ VHSL Regionals', 'HSAPQ VHSL Regular Season', 'HSAPQ VHSL States', 'Ladue Invitational Spring Tournament', 'Maggie Walker GSAC', 'Maggie Walker GSAC XIX', 'Minnesota Novice Set', 'New Trier Scobol Solo', 'OLEFIN', 'PACE NSC', 'Prison Bowl', 'SCOP Novice', 'St. Anselms and Torrey Pines'], 2012: ['BHSAT', 'Fall Kickoff Tournament (FKT)', 'Harvard Fall Tournament', 'Harvard Fall Tournament VII', 'LIST', 'LIST (Ladue Invitational Spring Tournament)', 'Ladue Invitational Spring Tournament', 'Ladue Invitational Sprint Tournament (LIST)', 'MSU/UD Housewrite', 'Maggie Walker GSAC', 'Maryland Spring', 'New Trier Scobol Solo', 'Ohio State/VCU housewrite', 'PACE NSC', 'Prison Bowl', 'RAVE', 'SCOP 3', 'SCOP Novice'], 2013: ['BHSAT', 'BISB', 'Brookwood Invitational Scholars Bowl', 'FKT', 'JAMES', 'LIST', 'LIST (Ladue Invitational Spring Tournament)', 'Ladue Invitational Sprint Tournament (LIST)', 'Maggie Walker GSAC', 'NTSS', 'New Trier Scobol Solo', 'PACE NSC', 'Prison Bowl', 'SASS', 'SCOP Novice', 'Scobol Solo'], 2014: ['BELLOCO', 'BHSAT', 'LIST', 'LIST (Ladue Invitational Spring Tournament)', 'Ladue Invitational Sprint Tournament (LIST)', 'Masonic', 'New Trier Scobol Solo', 'PACE NSC', 'Prison Bowl', 'SCOP Novice'], 2015: ["BISB (Brookwood Invitational Scholars' Bowl)", 'GSAC XXIII', 'HFT X', 'JAMES', 'Maryland Fall', 'PACE NSC', 'Prison Bowl']}, 'Middle School': {2010: ['Collaborative MS Tournament'], 2011: ['Collaborative MS Tournament'], 2012: ['Collaborative MS Tournament'], 2013: ['Collaborative MS Tournament'], 2015: ['SCOP 6 MS']}, 'Open': {2016: ['A Culture of Improvement', 'CLEAR II', 'Chicago Open', 'Christmas Present', 'GRAPHIC', 'Geography Monstrosity'], 2017: ['(This) Tournament is a Crime', 'Chicago Open', 'FRENCH', 'Fine Arts Common Links', 'GRAB BAG', 'Geography Monstrosity', "It's Lit", 'Jordaens Visual Arts', 'Letras', 'Math Monstrosity', 'Naveed Bork Memorial Tournament', 'Scattergories'], 1998: ['Virginia Open'], 1999: ['ACF Nationals'], 2000: ['ACF Nationals', 'Chicago Open', 'St. Louis Open'], 2001: ['ACF Nationals', 'Michigan Artaud', 'St. Louis Open'], 2002: ['ACF Nationals', 'Chicago Open'], 2003: ['ACF Nationals', 'Chicago Open', 'Illinois Open'], 2004: ['ACF Nationals', 'Chicago Open', 'Chicago Open Lit', 'Science Monstrosity'], 2005: ['ACF Nationals', 'Illinois Open', 'Jacopo Pontormo (history tournament)', 'Michigan Manu Ginobili Open', 'Science Monstrosity', 'Teitler Myth Singles', 'Toby Keith Hybrid'], 2006: ['ACF Nationals', 'Chicago Open', 'Chicago Open History Doubles', 'Illinois Open Literature Tournament', 'Toby Keith Hybrid'], 2007: ['ACF Nationals', 'Chicago Open', 'Chicago Open Lit', 'The Experiment'], 2008: ['ACF Nationals', 'Cardinal Classic XVII', 'Chicago Open', 'Chicago Open Literature', 'Gaddis I', 'Gunpei Yokoi Memorial Open (side event)', 'Illinois Open', 'Minnesota Open', "Sun 'n' Fun", 'The Experiment II', 'VCU Open'], 2009: ['ACF Nationals', 'Cardinal Classic XVIII', 'Chicago Open', 'Chicago Open Literature', 'Gaddis II', 'Geography Monstrosity', 'Illinois Open/(Fall) Terrapin Invitational', 'Minnesota Open KLEE Fine Arts', 'Minnesota Open Lederberg Memorial Science Tournament', 'Minnesota Open Lit', 'Science Non-Strosity', 'The Experiment II', 'Tyrone Slothrop Lit', 'Tyrone Slothrop Literature Singles', 'VCU Open'], 2010: ['ACF Nationals', 'ANGST', 'BELFAST Arts', 'Chicago Open', 'Chicago Open Arts', 'Chicago Open Literature', 'Geography Monstrosity', 'Julius Civilis Classics Tournament', 'MELD', 'Minnesota Open', 'Spring Offensive (history tournament)', 'VCU Open (Saturday)'], 2011: ['ACF Nationals', 'Chicago Open', 'Chicago Open History', 'Geography Monstrosity', 'Guerrilla at ICT', 'Illinois Open', 'Illinois Wissenschaftslehre', 'Law Bowl', 'Minnesota Open', 'The Bob Loblaw Law Bowl'], 2012: ['ANFORTAS', 'Chicago Open', 'College History Bowl', 'Geography Monstrosity', 'Geography Monstrosity 4', 'History Doubles at Chicago Open', 'Minnesota Open', 'The Questions Concerning Technology', 'VETO'], 2013: ['Arrabal', 'Chicago Open', 'Fernando Arrabal Tournament of the Absurd', 'Geography Monstrosity', "Schindler's Lit", 'VCU Open', 'VETO'], 2014: ['3M: Chicago Open History', 'Cane Ridge Revival', 'Chicago Open', 'Geography Monstrosity', 'Gorilla Lit', 'Lederberg Memorial Science Tournament 2: Daughter Cell', 'Oxford Open', 'VCU Open'], 2015: ['ACF Nationals', 'BHSAT', 'Chicago Open', 'Chicago Open History', 'Chicago Open Visual Arts', 'Claude Shannon Memorial Tournament', 'Geography Monstrosity', 'George Oppen', 'RILKE', 'VCU Open', 'VICO', 'We Have Never Been Modern']}, 'College': {1997: ['ACF Nationals', 'ACF Regionals', 'Virginia Wahoo War'], 1998: ['ACF Nationals', 'ACF Regionals', 'Terrapin Invitational Tournament', 'Virginia Wahoo War'], 1999: ['ACF Regionals'], 2000: ['ACF Regionals', 'Illinois Novice'], 2001: ['ACF Fall', 'ACF Regionals', 'Illinois Novice', 'Kentucky Wildcat'], 2002: ['ACF Fall', 'ACF Regionals', 'Illinois Novice', 'Kentucky Wildcat', 'Penn Bowl'], 2003: ['ACF Fall', 'ACF Regionals', 'Kentucky Wildcat', 'Michigan Auspicious Incident', 'The New Tournament at Cornell'], 2004: ['ACF Fall', 'ACF Regionals', 'Aztlan Cup', 'Berkeley WIT XII'], 2005: ['ACF Fall', 'ACF Regionals', 'Terrapin Invitational Tournament', "Virginia J'ACCUSE!"], 2006: ['ACF Fall', 'ACF Regionals', 'Aztlan Cup II/Brown UTT/UNC AWET', 'Chicago John Stuart Mill', 'Early Fall Tournament (EFT)', 'MLK', 'Terrapin Invitational Tournament'], 2007: ['ACF Fall', 'ACF Regionals', 'Early Fall Tournament (EFT)', 'MLK', 'Matt Cvijanovich Memorial Novice Tournament', 'Penn Bowl', 'Titanomachy'], 2008: ['ACF Fall', 'ACF Regionals', 'Early Fall Tournament (EFT)', 'FEUERBACH', 'FICHTE', 'MUT', 'Matt Cvijanovich Memorial Novice Tournament', 'Minnesota Undergraduate Tournament (MUT)', 'Penn Bowl', 'RMP Fest', 'Terrapin Invitational Tournament', 'Zot Bowl'], 2009: ['ACF Fall', 'ACF Regionals', 'ACF Winter', 'Chipola Lit + Fine Arts', 'Delta Burke', 'FICHTE', 'FIST', 'MUT', 'Mahfouz Memorial Lit', 'Penn Bowl', 'RMP Fest', 'THUNDER'], 2010: ['ACF Fall', 'ACF Novice', 'ACF Regionals', 'ACF Winter', 'Delta Burke', 'EFT', 'Early Fall Tournament (EFT)', 'Geography Monstrosity 2', 'Guerrilla at ICT', 'Harvard International', 'MUT', 'NASAT', 'Penn Bowl', 'Princeton Buzzerfest', 'Sun n Fun', 'T-Party', 'THUNDER II', 'VCU Open (Sunday)', 'Wild Kingdom'], 2011: ['ACF Fall', 'ACF Regionals', 'Cheyne 1980s American History', 'Cheyne American History', 'Collegiate Novice', 'Delta Burke', 'MAGNI', 'MUT', 'Missiles of October', 'NASAT', 'Penn Bowl', 'SACK', 'Terrapin Invitational', 'Terrapin Invitational Tournament', 'VCU Open'], 2012: ['ACF Fall', 'ACF Nationals', 'ACF Regionals', 'BARGE', 'Cheyne American History', 'Collegiate Novice', 'Delta Burke', 'Illinois Fall', 'Illinois Fall Tournament', 'KABO', 'MUT', 'NASAT', 'NHBB College Nationals', 'Peaceful Resolution', 'Penn Bowl', 'Penn-ance', 'QUARK', 'WELD', 'YMIR'], 2013: ['ACF Fall', 'ACF Nationals', 'ACF Regionals', 'Angels in the Architecture', 'Cheyne American History', 'Collegiate Novice', 'DRAGOON', 'Delta Burke', 'Delta Burke 2013', 'MUT', 'Michigan Fall Tournament', 'NASAT', 'Penn Bowl', 'Terrapin', 'Terrapin Invitational Tournament', 'VCU Closed', 'WIT', 'Western Invitational Tournament'], 2014: ['ACF Fall', 'ACF Nationals', 'ACF Regionals', 'Cheyne American History People', 'Cheyne American Thought', 'College History Bowl', 'DEES', 'Delta Burke', 'ICCS', 'MUT', 'Mavis Gallant Memorial Tournament (Literature)', 'NASAT', 'PADAWAN', 'Penn Bowl', 'SUBMIT'], 2015: ['ACF Fall', 'ACF Regionals', 'Delta Burke', 'MUT', 'Missouri Open', 'NASAT', 'Penn Bowl', 'SHEIKH', 'STIMPY'], 2016: ['"stanford housewrite"', 'ACF Fall', 'ACF Nationals', 'ACF Regionals', 'Delta Burke', 'Early Fall Tournament (EFT)', 'Listory', 'MLK', 'MUT', 'MYSTERIUM', 'NASAT', 'Penn Bowl', 'Terrapin Invitational Tournament'], 2017: ['ACF Fall', 'ACF Nationals', 'ACF Regionals', 'EMT', 'Early Fall Tournament (EFT)', 'JAKOB', 'MASSOLIT', 'NASAT', 'Penn Bowl', 'Sivakumar Day Inter-Nationals', 'WAO', 'XENOPHON'], 2018: ['ACF Regionals']}}


export default class User extends React.Component<Props, State> {
  state: State = {
    username: "",
    edits: [],
    autocorrect: [],
    autocorrect_advanced: [],
    advanced_value: "",
    random_topic: "",
    value: "",
    category_option: 'Literature',
    random_difficulty_option: 'High School',
    difficulty_option: 'High School',
    year_option: 2015,
    tournament_option: 'Maryland Fall',
    option_open: false,
    button_clicked: "",
    advanced_search: false,
    advanced_difficulty: 'High School',
    advanced_year: 2015,
    advanced_category: 'Literature',
    advanced_tournament: 'Maryland Fall',
  }
  
  logout = () => {
    setCookie("token","");
    this.setState({username: ""});
  }
  
  get_user_info = () => {
    fetch(
      address+"/user/"+getCookie("token")
      ).then(res=>res.json())
      .then(res => {
        this.setState({username: res['username'],
        edits: res['edits']});        
      })
    
  }
  
  componentDidMount = ()=> {
    if(getCookie("token") !== "") {
      this.get_user_info();
    }
    setCookie("packet","");
    setCookie("entity","");
    
    let random_topics = ["Frasch Process", "Charlie Parker", "Harold Pinter", "Lolita","Hull House","Claude Debussy","Jacques Derrida"];
    let random_topic = random_topics[Math.floor(Math.random()*random_topics.length)];
    this.setState({random_topic});
  }
  
  updateAutocorrect = (event: React.ChangeEvent<{}>, value: any) => {
    this.setState({
      value: value,
    });

        
    
    let current_target = toNormalString(value);
    let tagged_word = current_target; 
   
    if (current_target !== "") {
      
      fetch(
        address+"/autocorrect/" +
            encodeURIComponent(current_target.replace(" ","_"))
      )
        .then((res) => res.json())
        .then((res) => {
          
          let suggestions = res;
            for(var i = 0;i<suggestions.length;i++) {
              suggestions[i] = toNiceString(suggestions[i][0]+" ");
            }
            
          if(suggestions.length<5 && current_target.length>0) {
            let target_string = "";
            let split_string = current_target.replace(/_$/,'').split("_");
            for(var i = 0;i<split_string.length;i++) {
              target_string+="%2B"+split_string[i];
              if(i+1<split_string.length) {
                target_string+="%20";
              }
            }
            target_string+="&nhits=5";
            fetch("/api/?q="+target_string).then((res2)=>res2.json()).then((res2)=>{
              for(var i = 0;i<5-suggestions.length;i++) {
                if(i<res2["hits"].length) {
                  let name = res2["hits"][i].doc.clean_name;
                  if(!suggestions.includes(name)){
                    suggestions.push(name);
                  }
                  
                }
              }          
              for(var i = 0;i<suggestions.length;i++) {
                suggestions[i] = toNiceString(suggestions[i]+" ");
              }
              
              suggestions = Array.from(new Set(suggestions));
              this.setState({ autocorrect: suggestions },function() {
                return 0;
              });
            });
          }
          else {
            if(suggestions.length == 0) {
              suggestions = ["No Entity Found"]
            }
            else {
              suggestions.push("No Entity Found");
            }
            this.setState({ autocorrect: suggestions },function() {
              return 0;
            });
          }
        });
    }
    else {
       this.setState({ autocorrect: [] });
    }
  };

  updateAutocorrectAdvanced = (event: React.ChangeEvent<{}>, value: any) => {
    this.setState({
      advanced_value: value,
    });

        
    
    let current_target = toNormalString(value);
    let tagged_word = current_target; 
   
    if (current_target !== "") {
      
      fetch(
        address+"/autocorrect/" +
            encodeURIComponent(current_target.replace(" ","_"))
      )
        .then((res) => res.json())
        .then((res) => {
          
          let suggestions = res;
            for(var i = 0;i<suggestions.length;i++) {
              suggestions[i] = toNiceString(suggestions[i][0]+" ");
            }
            
          if(suggestions.length<5 && current_target.length>0) {
            let target_string = "";
            let split_string = current_target.replace(/_$/,'').split("_");
            for(var i = 0;i<split_string.length;i++) {
              target_string+="%2B"+split_string[i];
              if(i+1<split_string.length) {
                target_string+="%20";
              }
            }
            target_string+="&nhits=5";
            fetch("/api/?q="+target_string).then((res2)=>res2.json()).then((res2)=>{
              for(var i = 0;i<5-suggestions.length;i++) {
                if(i<res2["hits"].length) {
                  let name = res2["hits"][i].doc.clean_name;
                  if(!suggestions.includes(name)){
                    suggestions.push(name);
                  }
                  
                }
              }          
              for(var i = 0;i<suggestions.length;i++) {
                suggestions[i] = toNiceString(suggestions[i]+" ");
              }
              
              suggestions = Array.from(new Set(suggestions));
              this.setState({ autocorrect_advanced: suggestions },function() {
                return 0;
              });
            });
          }
          else {
            if(suggestions.length == 0) {
              suggestions = ["No Entity Found"]
            }
            else {
              suggestions.push("No Entity Found");
            }
            this.setState({ autocorrect_advanced: suggestions },function() {
              return 0;
            });
          }
        });
    }
    else {
       this.setState({ autocorrect_advanced: [] });
    }
  };


  explore_topic = () => {
    if(this.state.value!="") {
      setCookie("topic",this.state.value);
      this.setState({});
    }
  }
  
  explore_random_category = () => {
    setCookie("random_category",this.state.random_category);
    setCookie("random_difficulty_option",this.state.random_difficulty_option);
    this.setState({});
  }
  
  explore_random_tournament = () => {
    setCookie("tournament_option",this.state.tournament_option);
    setCookie("year_option",this.state.year_option);
    setCookie("difficulty_option",this.state.difficulty_option);
    this.setState({});
  }
  
  advanced_search = () => {
    
  }
  
  render() {
    if(getCookie("token") == "") {
      return <Redirect to="/login" />;
    }
    
    if(getCookie("topic")!="") {
      return <Redirect to="/entitysearch" />
    }
    else if(getCookie("random_difficulty_option")!=="") {
      //return <Redirect to="/entitysearch" />
    }
    else if(getCookie("tournament_option")!=="") {
      return <Redirect to="/packetsearch" />
    }
    

        
    return <div> 
    
    <div style={{marginTop: 20, marginLeft: 50, marginBottom: 30, fontSize: 30}}> 
  <header> <span> <a href="/"  style={{fontSize: 60, color: "black", textDecoration: 'none'}}> QUEL </a> </span> <span style={{fontSize: 16}}> Entity and topic exploration made easy </span> </header>
      
      <div style={{marginBottom: "2%"}}> Allowing Quizbowl players to explore <span style={{color: 'blue', fontSize: 40}}> {this.state.random_topic} </span> </div> 
      
      <div> What would you like to explore? </div>
      
      <div style={{marginBottom: "2%"}}> I would like to explore <Autocomplete
            style={{ fontSize: 30, width: 400,display: 'inline-block',verticalAlign: 'middle' }}
            value={this.state.value}
            onInputChange={this.updateAutocorrect}  
            getOptionLabel={(option) => option}
            options={this.state.autocorrect}
            renderInput={(params) => <TextField {...params}
            />}
            onKeyDown={({key})=>{if(key=='Enter'){this.explore_topic()}}} 
            openOnFocus={true}
          />      
          
        <Button style={{marginLeft: 20}} onClick={this.explore_topic} variant="contained" color="primary"> Go! </Button>
      </div>
      
      <div style={{marginBottom: "1%"}}> 
        Not sure what to explore? <br />
        Try a random 
          <Select
          style={{marginLeft: 20, marginRight: 20, fontSize: 36}}
          labelId="demo-simple-select-label"
          value={this.state.category_option}
          onChange={(event)=>{this.setState({category_option:event.target.value})}}
          >
            {categories.map((option, index) => (
              <MenuItem
                value={option}
              >
                {option}
              </MenuItem>
            ))}
          </Select>
        question at 
         <Select
          style={{marginLeft: 20, marginRight: 20, fontSize: 36}}
          labelId="demo-simple-select-label"
          value={this.state.random_difficulty_option}
          onChange={(event)=>{this.setState({random_difficulty_option:event.target.value}) }}

        >
          {difficulties.map((option, index) => (
            <MenuItem
              value={option}
            >
              {option}
            </MenuItem>
          ))}
        </Select> 
        difficulty 
        <Button style={{marginLeft: 20}} onClick={this.explore_random_category} variant="contained" color="primary"> Go! </Button> <br /> 
        Or a random question at  
        <Select
          style={{marginLeft: 20, marginRight: 20, fontSize: 36}}
          labelId="demo-simple-select-label"
          value={this.state.difficulty_option}
          onChange={(event)=>{this.setState({difficulty_option:event.target.value, tournament_option: tournaments[event.target.value][this.state.year_option][0]}) }}

        >
          {difficulties.map((option, index) => (
            <MenuItem
              value={option}
            >
              {option}
            </MenuItem>
          ))}
        </Select> difficulty from
<Select
          style={{marginLeft: 20, marginRight: 20, fontSize: 36}}
          labelId="demo-simple-select-label"
          value={this.state.year_option}
          onChange={(event)=>{this.setState({year_option:parseInt(event.target.value),
          tournament_option: tournaments[this.state.difficulty_option][parseInt(event.target.value)][0]})}}

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
          style={{marginLeft: 20, marginRight: 20, fontSize: 36}}
          labelId="demo-simple-select-label"
          value={this.state.tournament_option}
          onChange={(event)=>{this.setState({tournament_option:event.target.value})}}

        >
          {tournaments[this.state.difficulty_option][this.state.year_option]!=undefined && tournaments[this.state.difficulty_option][this.state.year_option].map((option, index) => (
            <MenuItem
              value={option}
            >
              {option}
            </MenuItem>
          ))}
        </Select>        
       
        <Button style={{marginLeft: 20}} onClick={this.explore_random_tournament} variant="contained" color="primary"> Go! </Button>        
      </div>

      <div style={{color: 'blue', cursor: 'pointer', textDecoration: 'underline'}} onClick={()=>{this.setState({advanced_search: !this.state.advanced_search})}}> Advanced Search </div>
      
      {this.state.advanced_search && 
        <div>
          Topic (blank for any topic): <Autocomplete
            style={{ fontSize: 30, width: 400,display: 'inline-block',verticalAlign: 'middle' }}
            value={this.state.advanced_value}
            onInputChange={this.updateAutocorrectAdvanced}  
            getOptionLabel={(option) => option}
            options={this.state.autocorrect_advanced}
            renderInput={(params) => <TextField {...params}
            />}
            onKeyDown={({key})=>{if(key=='Enter'){this.advanced_search()}}} 
            openOnFocus={true}
          /> 
          <br />
          Difficulty: <Select
            style={{marginLeft: 20, marginRight: 20, fontSize: 36}}
            labelId="demo-simple-select-label"
            value={this.state.advanced_difficulty}
            onChange={(event)=>{this.setState({advanced_difficulty:event.target.value}) }}

          >
            {difficulties.map((option, index) => (
                <MenuItem
                  value={option}
                >
                  {option}
                </MenuItem>
              ))}
            </Select> <br />
          Category: <Select
              style={{marginLeft: 20, marginRight: 20, fontSize: 36}}
              labelId="demo-simple-select-label"
              value={this.state.advanced_category}
              onChange={(event)=>{this.setState({advanced_category:event.target.value})}}
              >
                {categories.map((option, index) => (
                  <MenuItem
                    value={option}
                  >
                    {option}
                  </MenuItem>
                ))}
              </Select> <br />
              
         Tournament: <Select
          style={{marginLeft: 20, marginRight: 20, fontSize: 36}}
          labelId="demo-simple-select-label"
          value={this.state.advanced_year}
          onChange={(event)=>{this.setState({advanced_year:parseInt(event.target.value),
          advanced_tournament: tournaments[this.state.advanced_difficulty][parseInt(event.target.value)][0]})}}

        >
          {Object.keys(tournaments[this.state.advanced_difficulty]).map((option, index) => (
            <MenuItem
              value={option}
            >
              {option}
            </MenuItem>
          ))}
        </Select>
        <Select
          style={{marginLeft: 20, marginRight: 20, fontSize: 36}}
          labelId="demo-simple-select-label"
          value={this.state.advanced_tournament}
          onChange={(event)=>{this.setState({advanced_tournament:event.target.value})}}

        >
          {tournaments[this.state.advanced_difficulty][this.state.advanced_year]!=undefined && tournaments[this.state.advanced_difficulty][this.state.advanced_year].map((option, index) => (
            <MenuItem
              value={option}
            >
              {option}
            </MenuItem>
          ))}
        </Select>    
          <Button style={{marginLeft: 20}} onClick={this.advanced_search} variant="contained" color="primary"> Go! </Button>
        </div>
      }
      <div style={{textAlign: 'center', fontSize: 48}}> 
        Explore questions and <a target="_blank" href="https://docs.google.com/document/d/1ndk13ZvBAezTlb_z1QofvJg8qmlOCRvgm3fY9ExcBaA/edit?usp=sharing"> Win Prizes! </a> 
      </div>

      </div> 
    
    </div>
    
  }
}
