import * as React from "react";
import {getCookie,setCookie} from "./Util";
import {Redirect} from 'react-router-dom';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import CircularProgress from '@material-ui/core/CircularProgress';
import {toNormalString,toNiceString} from "./Util";
import Autocomplete from '@material-ui/lab/Autocomplete';


interface State {

}

let address = "/quel";

let tournaments ={'High School': {2016: ['A Bit of Lit', 'BHSAT', 'HFT XI', 'PACE NSC', 'SCOP', 'WHAQ'], 2017: ['BHSAT', 'Ladue Invitational Sprint Tournament (LIST)', 'PACE NSC', 'Prison Bowl'], 1998: ['PACE NSC'], 2000: ['PACE NSC'], 2001: ['PACE NSC'], 2002: ['PACE NSC'], 2003: ['Delta Burke', 'PACE NSC'], 2004: ['Illinois Earlybird', 'PACE NSC'], 2005: ['Crusader Cup', 'Illinois Earlybird', 'Maryland Spring Classic', 'PACE NSC'], 2006: ['Illinois Earlybird', 'Maryland Spring Classic', 'PACE NSC', 'WUHSAC VIII'], 2007: ['Maggie Walker GSAC XV', 'Maryland Spring Classic', 'WUHSAC IX'], 2008: ['Bulldog High School Academic Tournament (BHSAT)', 'Chitin', 'HAVOC', 'HFT', 'HSAPQ 4Q 1', 'HSAPQ ACF 1', 'HSAPQ ACF 2', 'HSAPQ ACF 3', 'HSAPQ NSC 1', 'HSAPQ NSC 2', 'Maggie Walker GSAC XVI', 'NNT', 'NTV', 'New Trier Scobol Solo', 'PACE NSC', 'Prison Bowl', 'QuAC I', 'UIUC High School Solo'], 2009: ['BATE', 'BHSAT', 'DAFT', 'Fall Kickoff Tournament', 'Fall Kickoff Tournament (FKT)', 'Fall Novice', 'From Here To Eternity', 'HAVOC II', 'HFT', 'HSAPQ 4Q1', 'HSAPQ 4Q2', 'HSAPQ NASAT Tryout Set', 'HSAPQ Tournament 10', 'HSAPQ Tournament 11', 'HSAPQ Tournament 8', 'HSAPQ Tournament 9', 'MOHIT (Thomas Jefferson)', 'MW GSAC XVII', 'NTV', 'New Trier Scobol Solo', 'PACE NSC', 'Prison Bowl', 'U. of Georgia CCC', 'WUHSAC XI', 'Weekend of Quizbowl Saturday Event'], 2010: ['BATE', 'BHSAT', 'Fall Kickoff Tournament', 'Fall Kickoff Tournament (FKT)', 'Fall Novice', 'GDS Ben Cooper Memorial', 'Harvard Fall Tournament', 'Maggie Walker GSAC', 'Maggie Walker GSAC XVIII', 'Maryland Spring Classic', 'NTSS', 'PACE NSC', 'Prison Bowl', 'SCOP Novice', 'TJ NAREN', 'Vanderbilt ABC/2011 VCU Winter'], 2011: ['BDAT I', 'BHSAT', 'Centennial (MD) Housewrite', 'Fall Kickoff Tournament (FKT)', 'HSAPQ Colonia 2', 'HSAPQ National History Bowl', 'HSAPQ Tournament 15', 'HSAPQ Tournament 16', 'HSAPQ Tournament 17', 'HSAPQ VHSL Districts', 'HSAPQ VHSL Regionals', 'HSAPQ VHSL Regular Season', 'HSAPQ VHSL States', 'Ladue Invitational Spring Tournament', 'Maggie Walker GSAC', 'Maggie Walker GSAC XIX', 'Minnesota Novice Set', 'New Trier Scobol Solo', 'OLEFIN', 'PACE NSC', 'Prison Bowl', 'SCOP Novice', 'St. Anselms and Torrey Pines'], 2012: ['BHSAT', 'Fall Kickoff Tournament (FKT)', 'Harvard Fall Tournament', 'Harvard Fall Tournament VII', 'LIST', 'LIST (Ladue Invitational Spring Tournament)', 'Ladue Invitational Spring Tournament', 'Ladue Invitational Sprint Tournament (LIST)', 'MSU/UD Housewrite', 'Maggie Walker GSAC', 'Maryland Spring', 'New Trier Scobol Solo', 'Ohio State/VCU housewrite', 'PACE NSC', 'Prison Bowl', 'RAVE', 'SCOP 3', 'SCOP Novice'], 2013: ['BHSAT', 'BISB', 'Brookwood Invitational Scholars Bowl', 'FKT', 'JAMES', 'LIST', 'LIST (Ladue Invitational Spring Tournament)', 'Ladue Invitational Sprint Tournament (LIST)', 'Maggie Walker GSAC', 'NTSS', 'New Trier Scobol Solo', 'PACE NSC', 'Prison Bowl', 'SASS', 'SCOP Novice', 'Scobol Solo'], 2014: ['BELLOCO', 'BHSAT', 'LIST', 'LIST (Ladue Invitational Spring Tournament)', 'Ladue Invitational Sprint Tournament (LIST)', 'Masonic', 'New Trier Scobol Solo', 'PACE NSC', 'Prison Bowl', 'SCOP Novice'], 2015: ["BISB (Brookwood Invitational Scholars' Bowl)", 'GSAC XXIII', 'HFT X', 'JAMES', 'Maryland Fall', 'PACE NSC', 'Prison Bowl']}, 'Middle School': {2010: ['Collaborative MS Tournament'], 2011: ['Collaborative MS Tournament'], 2012: ['Collaborative MS Tournament'], 2013: ['Collaborative MS Tournament'], 2015: ['SCOP 6 MS']}, 'Open': {2016: ['A Culture of Improvement', 'CLEAR II', 'Chicago Open', 'Christmas Present', 'GRAPHIC', 'Geography Monstrosity'], 2017: ['(This) Tournament is a Crime', 'Chicago Open', 'FRENCH', 'Fine Arts Common Links', 'GRAB BAG', 'Geography Monstrosity', "It's Lit", 'Jordaens Visual Arts', 'Letras', 'Math Monstrosity', 'Naveed Bork Memorial Tournament', 'Scattergories'], 1998: ['Virginia Open'], 1999: ['ACF Nationals'], 2000: ['ACF Nationals', 'Chicago Open', 'St. Louis Open'], 2001: ['ACF Nationals', 'Michigan Artaud', 'St. Louis Open'], 2002: ['ACF Nationals', 'Chicago Open'], 2003: ['ACF Nationals', 'Chicago Open', 'Illinois Open'], 2004: ['ACF Nationals', 'Chicago Open', 'Chicago Open Lit', 'Science Monstrosity'], 2005: ['ACF Nationals', 'Illinois Open', 'Jacopo Pontormo (history tournament)', 'Michigan Manu Ginobili Open', 'Science Monstrosity', 'Teitler Myth Singles', 'Toby Keith Hybrid'], 2006: ['ACF Nationals', 'Chicago Open', 'Chicago Open History Doubles', 'Illinois Open Literature Tournament', 'Toby Keith Hybrid'], 2007: ['ACF Nationals', 'Chicago Open', 'Chicago Open Lit', 'The Experiment'], 2008: ['ACF Nationals', 'Cardinal Classic XVII', 'Chicago Open', 'Chicago Open Literature', 'Gaddis I', 'Gunpei Yokoi Memorial Open (side event)', 'Illinois Open', 'Minnesota Open', "Sun 'n' Fun", 'The Experiment II', 'VCU Open'], 2009: ['ACF Nationals', 'Cardinal Classic XVIII', 'Chicago Open', 'Chicago Open Literature', 'Gaddis II', 'Geography Monstrosity', 'Illinois Open/(Fall) Terrapin Invitational', 'Minnesota Open KLEE Fine Arts', 'Minnesota Open Lederberg Memorial Science Tournament', 'Minnesota Open Lit', 'Science Non-Strosity', 'The Experiment II', 'Tyrone Slothrop Lit', 'Tyrone Slothrop Literature Singles', 'VCU Open'], 2010: ['ACF Nationals', 'ANGST', 'BELFAST Arts', 'Chicago Open', 'Chicago Open Arts', 'Chicago Open Literature', 'Geography Monstrosity', 'Julius Civilis Classics Tournament', 'MELD', 'Minnesota Open', 'Spring Offensive (history tournament)', 'VCU Open (Saturday)'], 2011: ['ACF Nationals', 'Chicago Open', 'Chicago Open History', 'Geography Monstrosity', 'Guerrilla at ICT', 'Illinois Open', 'Illinois Wissenschaftslehre', 'Law Bowl', 'Minnesota Open', 'The Bob Loblaw Law Bowl'], 2012: ['ANFORTAS', 'Chicago Open', 'College History Bowl', 'Geography Monstrosity', 'Geography Monstrosity 4', 'History Doubles at Chicago Open', 'Minnesota Open', 'The Questions Concerning Technology', 'VETO'], 2013: ['Arrabal', 'Chicago Open', 'Fernando Arrabal Tournament of the Absurd', 'Geography Monstrosity', "Schindler's Lit", 'VCU Open', 'VETO'], 2014: ['3M: Chicago Open History', 'Cane Ridge Revival', 'Chicago Open', 'Geography Monstrosity', 'Gorilla Lit', 'Lederberg Memorial Science Tournament 2: Daughter Cell', 'Oxford Open', 'VCU Open'], 2015: ['ACF Nationals', 'BHSAT', 'Chicago Open', 'Chicago Open History', 'Chicago Open Visual Arts', 'Claude Shannon Memorial Tournament', 'Geography Monstrosity', 'George Oppen', 'RILKE', 'VCU Open', 'VICO', 'We Have Never Been Modern']}, 'College': {1997: ['ACF Nationals', 'ACF Regionals', 'Virginia Wahoo War'], 1998: ['ACF Nationals', 'ACF Regionals', 'Terrapin Invitational Tournament', 'Virginia Wahoo War'], 1999: ['ACF Regionals'], 2000: ['ACF Regionals', 'Illinois Novice'], 2001: ['ACF Fall', 'ACF Regionals', 'Illinois Novice', 'Kentucky Wildcat'], 2002: ['ACF Fall', 'ACF Regionals', 'Illinois Novice', 'Kentucky Wildcat', 'Penn Bowl'], 2003: ['ACF Fall', 'ACF Regionals', 'Kentucky Wildcat', 'Michigan Auspicious Incident', 'The New Tournament at Cornell'], 2004: ['ACF Fall', 'ACF Regionals', 'Aztlan Cup', 'Berkeley WIT XII'], 2005: ['ACF Fall', 'ACF Regionals', 'Terrapin Invitational Tournament', "Virginia J'ACCUSE!"], 2006: ['ACF Fall', 'ACF Regionals', 'Aztlan Cup II/Brown UTT/UNC AWET', 'Chicago John Stuart Mill', 'Early Fall Tournament (EFT)', 'MLK', 'Terrapin Invitational Tournament'], 2007: ['ACF Fall', 'ACF Regionals', 'Early Fall Tournament (EFT)', 'MLK', 'Matt Cvijanovich Memorial Novice Tournament', 'Penn Bowl', 'Titanomachy'], 2008: ['ACF Fall', 'ACF Regionals', 'Early Fall Tournament (EFT)', 'FEUERBACH', 'FICHTE', 'MUT', 'Matt Cvijanovich Memorial Novice Tournament', 'Minnesota Undergraduate Tournament (MUT)', 'Penn Bowl', 'RMP Fest', 'Terrapin Invitational Tournament', 'Zot Bowl'], 2009: ['ACF Fall', 'ACF Regionals', 'ACF Winter', 'Chipola Lit + Fine Arts', 'Delta Burke', 'FICHTE', 'FIST', 'MUT', 'Mahfouz Memorial Lit', 'Penn Bowl', 'RMP Fest', 'THUNDER'], 2010: ['ACF Fall', 'ACF Novice', 'ACF Regionals', 'ACF Winter', 'Delta Burke', 'EFT', 'Early Fall Tournament (EFT)', 'Geography Monstrosity 2', 'Guerrilla at ICT', 'Harvard International', 'MUT', 'NASAT', 'Penn Bowl', 'Princeton Buzzerfest', 'Sun n Fun', 'T-Party', 'THUNDER II', 'VCU Open (Sunday)', 'Wild Kingdom'], 2011: ['ACF Fall', 'ACF Regionals', 'Cheyne 1980s American History', 'Cheyne American History', 'Collegiate Novice', 'Delta Burke', 'MAGNI', 'MUT', 'Missiles of October', 'NASAT', 'Penn Bowl', 'SACK', 'Terrapin Invitational', 'Terrapin Invitational Tournament', 'VCU Open'], 2012: ['ACF Fall', 'ACF Nationals', 'ACF Regionals', 'BARGE', 'Cheyne American History', 'Collegiate Novice', 'Delta Burke', 'Illinois Fall', 'Illinois Fall Tournament', 'KABO', 'MUT', 'NASAT', 'NHBB College Nationals', 'Peaceful Resolution', 'Penn Bowl', 'Penn-ance', 'QUARK', 'WELD', 'YMIR'], 2013: ['ACF Fall', 'ACF Nationals', 'ACF Regionals', 'Angels in the Architecture', 'Cheyne American History', 'Collegiate Novice', 'DRAGOON', 'Delta Burke', 'Delta Burke 2013', 'MUT', 'Michigan Fall Tournament', 'NASAT', 'Penn Bowl', 'Terrapin', 'Terrapin Invitational Tournament', 'VCU Closed', 'WIT', 'Western Invitational Tournament'], 2014: ['ACF Fall', 'ACF Nationals', 'ACF Regionals', 'Cheyne American History People', 'Cheyne American Thought', 'College History Bowl', 'DEES', 'Delta Burke', 'ICCS', 'MUT', 'Mavis Gallant Memorial Tournament (Literature)', 'NASAT', 'PADAWAN', 'Penn Bowl', 'SUBMIT'], 2015: ['ACF Fall', 'ACF Regionals', 'Delta Burke', 'MUT', 'Missouri Open', 'NASAT', 'Penn Bowl', 'SHEIKH', 'STIMPY'], 2016: ['"stanford housewrite"', 'ACF Fall', 'ACF Nationals', 'ACF Regionals', 'Delta Burke', 'Early Fall Tournament (EFT)', 'Listory', 'MLK', 'MUT', 'MYSTERIUM', 'NASAT', 'Penn Bowl', 'Terrapin Invitational Tournament'], 2017: ['ACF Fall', 'ACF Nationals', 'ACF Regionals', 'EMT', 'Early Fall Tournament (EFT)', 'JAKOB', 'MASSOLIT', 'NASAT', 'Penn Bowl', 'Sivakumar Day Inter-Nationals', 'WAO', 'XENOPHON'], 2018: ['ACF Regionals']}}
const categories = ['Any','Literature', 'Social Science', 'History', 'Science', 'Fine Arts', 'Trash', 'Religion', 'Philosophy', 'Geography', 'Mythology', 'Current Events'];

const subcategories = {'Any': ['Any'],'Fine Arts': ['Any', 'Music', 'Art', 'Other', 'Audiovisual', 'Visual', 'Auditory'], 'Literature': ['Any', 'American', 'European', 'World', 'Other', 'British', 'Europe', 'Classic', 'Classical'], 'Mythology': ['Any'], 'Social Science': ['Any', 'Anthropology', 'Philosophy', 'Religion/Mythology', 'Geography', 'Economics', 'Psychology'], 'Current Events': ['Any'], 'Trash': ['Any', 'Other', 'Pop Culture'], 'Philosophy': ['Any'], 'Religion': ['Any'], 'Geography': ['Any'], 'History': ['Any', 'American', 'European', 'World', 'Ancient', 'Other', 'Europe', 'Classic', 'British', 'Classical'], 'Science': ['Any', 'Biology', 'Chemistry', 'Math', 'Physics', 'Astronomy', 'Earth Science', 'Other', 'Computer Science']};

let questions_per_page = 5;


export default class PacketSearch extends React.Component<Props, State> {
  state: State = {
    username: "",
    difficulty_option: "High School", 
    year_option: 2015,
    tournament_option: tournaments['High School'][2015][0],
    summary_stats: [],
    results: [],
    search_entity: "",
    loading_info: false,
      loading_search: false,
    value: "",
    autocorrect: [],
    category_option: "Any",
    subcategory_option: "Any",
    start:0,
  }
  
  get_results = () => {
    this.setState({loading_search: true,start:0});
    let entity = this.state.value.replaceAll(" ","_");
    let year = this.state.year_option;
    let tournament = this.state.tournament_option;
    let category = this.state.category_option;
    let subcategory = this.state.subcategory_option;
        fetch(
      address+"/tournament_entity/"+entity+"_"+year+"_"+tournament+"_"+category+"_"+subcategory
      ).then(res=>res.json())
      .then(res => {
        this.setState({results: res, loading_search: false});
        setCookie("packet","");
      })
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

  search = () => {

    if(this.state.difficulty_option!="" &&
    this.state.year_option>0 &&
    this.state.tournament_option!="") {
    this.setState({loading_info: true});

      fetch(
      address+"/tournament/"+this.state.year_option+"_"+this.state.tournament_option
      ).then(res=>res.json())
      .then(res => {
        this.setState({summary_stats: res,loading_info: false});
      })
    }
  }
  

  
  render_top_entities = () => {
    if(this.state.loading_info) {
      return <CircularProgress />
    }
    
    let top_entities = [];
    for(var i = 0;i<this.state.summary_stats.length;i++) {
      top_entities.push(<li> {this.state.summary_stats[i][0].replaceAll("_"," ")} ({this.state.summary_stats[i][1]} mentions) </li>);
    }
    
    
    return top_entities;
  }
  
  render_results = () => {
    if(this.state.loading_search) {
      return <div> <CircularProgress /> </div>
    }
    else if(this.state.results.length == 0) {
      return <div> No results found </div> 
    }
    else {
      let ret = [];
      let ids = [];
      for(var i = 0;i<this.state.results.length;i++) {
        ids.push(this.state.results[i].question_id);
      }
      
      function arrayRotate(arr, n) {
        let dup = arr.slice();
        for(var i = 0;i<n;i++) {
          dup.push(dup.shift());
        }
        return dup;
      }
    let entity = this.state.value.replaceAll("_"," ");
    let year = this.state.year_option;
    let tournament = this.state.tournament_option;
    let category = this.state.category_option;
    let subcategory = this.state.subcategory_option;

                  
      let end = Math.min(this.state.start+questions_per_page,this.state.results.length);
      for(let i = this.state.start; i<end;i++) {
        ret.push(<div style={{width: 500, marginBottom: 50}}> <b> Question: </b> {this.state.results[i]['question']} <br /> <b> Answer: </b> {this.state.results[i]['answer']} 
        <Button style={{marginLeft: 30, marginRight: 30}} onClick={()=>{setCookie("questions",JSON.stringify(arrayRotate(ids,i))); setCookie("packet",entity+"_"+year+"_"+tournament+"_"+category+"_"+subcategory); setCookie("entity","");}} variant="contained"><a href="/selected"> Annotate Question</a></Button> 

        
        <br /> </div>);
                  
      }
      
      return ret;
    }
  }
  
  decrement = () => {
    if(this.state.start-questions_per_page>=0){
      this.setState({start: this.state.start-questions_per_page});
    }
  }
  
    

  increment = () => {
    if(this.state.start+questions_per_page<=this.state.results.length ){ 
      this.setState({start: this.state.start+questions_per_page});
    }
  }
  
  render_directions = () => {
    if(this.state.results.length>0) {
      return      <div> <div> Showing {this.state.start+1}-{Math.min(this.state.start+questions_per_page,this.state.results.length)} of {this.state.results.length} </div>  
        <Button style={{'border': '1px solid black'}} onClick={this.decrement}>
              Previous 
        </Button> 
        <Button style={{'border': '1px solid black'}} onClick={this.increment}>
              Next 
        </Button> 
        </div> 
    }
    else {
      return <div> </div>
    }
  }

  componentDidMount = () => {
    if(getCookie("packet")!="") {
      //entity+"_"+year+"_"+tournament+"_"+category+"_"+subcategory
      let packet_vals = getCookie("packet").split("_");
      this.setState({value: packet_vals[0],year_option: parseInt(packet_vals[1]),
                      tournament_option: packet_vals[2], 
      category_option: packet_vals[3], subcategory_option: packet_vals[4]},()=>{this.get_results();});
    }
  }
  
  render() {
    if(getCookie("token") == "") {
      return <Redirect to="/login" />;
    }

    return <div style={{marginLeft: 30}}> <h1> Tournament Search </h1> 
          <div style={{marginBottom: 50}}> <Button style={{marginLeft: 30}} variant="contained" ><a href="/user"> Main Menu </a> </Button>
        </div>
     
    <br />
        <Select
          style={{marginLeft: 20, marginRight: 20}}
          labelId="demo-simple-select-label"
          value={this.state.difficulty_option}
          onChange={(event)=>{this.setState({difficulty_option:event.target.value, year_option: tournaments[event.target.value][this.state.year_option]!=undefined?this.state.year_option:2015,
          tournament_option: tournaments[event.target.value][2015][0]})}}
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
          style={{marginLeft: 20, marginRight: 20}}
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
        <Button style={{'border': '1px solid black'}} onClick={this.search}> Find Info </Button>
        <br />
        <b> Top Entities </b> 
        <ol> {this.render_top_entities()} </ol> <br />
        <Autocomplete
          style={{ fontSize: 24, width: 400, marginBottom: 30 }}
          value={this.state.value}
          onInputChange={this.updateAutocorrect}  
          getOptionLabel={(option) => option}
          options={this.state.autocorrect}
          renderInput={(params) => <TextField {...params} label="Entity" 
          />}
          openOnFocus={true}
        />      
        Category: <Select
          style={{marginLeft: 20, marginRight: 20}}
          labelId="demo-simple-select-label"
          value={this.state.category_option}
          onChange={(event)=>{this.setState({category_option:event.target.value, subcategory_option: "Any"})}}
        >
          {categories.map((option, index) => (
            <MenuItem
              value={option}
            >
              {option}
            </MenuItem>
          ))}
        </Select>
        Subcategory: <Select
          style={{marginLeft: 20, marginRight: 20}}
          labelId="demo-simple-select-label"
          value={this.state.subcategory_option}
          onChange={(event)=>{this.setState({subcategory_option:event.target.value}) }}

        >
          {subcategories[this.state.category_option].map((option, index) => (
            <MenuItem
              value={option}
            >
              {option}
            </MenuItem>
          ))}
        </Select>
        
        <Button style={{'border': '1px solid black'}} onClick={this.get_results}>
          Search 
        </Button> 
        {this.render_directions()}
        {this.render_results()}
    </div>
    
  }
}
