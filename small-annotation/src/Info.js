import * as React from "react";
import {getCookie,setCookie, categories} from "./Util";
import {Redirect} from 'react-router-dom';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import {Bar} from 'react-chartjs-2';
import Button from '@material-ui/core/Button';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import CircularProgress from '@material-ui/core/CircularProgress';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Grid from "@material-ui/core/Grid";
import Dropdown from './Dropdown';
import Carousel from './Carousel';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import BarGraph from './BarGraph';

interface State {

}

let address = "/quel";


export default class Info extends React.Component<Props, State> {
  state: State = {
    username: "",
    category_option: "Any",
    categories: {},
    leaderboard: [],
    loading_text: "",
    leaderboard_loading: false,
    value: 'one',
  }
  
  get_top_categories = () => {
        fetch(
      address+"/topics/"+getCookie("token")
      ).then(res=>res.json())
      .then(res => {
        this.setState({categories: res['topics'],common_entities: res['common_entities'],
        common_entity_definitions: res['common_entity_definitions']});
      })
  }
  
  get_user_info = () => {
    fetch(
      address+"/user/"+getCookie("token")
      ).then(res=>res.json())
      .then(res => {
        this.setState({username: res['username']},()=>{this.get_top_categories();});
      })
  }
  
  get_leaderboard = () => {
    this.setState({leaderboard_loading: true});
        fetch(
      address+"/leaderboard"
      ).then(res=>res.json())
      .then(res => {
        this.setState({leaderboard: res,leaderboard_loading: false});
      })
  }
  
  componentDidMount = ()=> {
    if(getCookie("token") !== "") {
      this.get_user_info();
      this.get_leaderboard();

    }
  }
  
  download_questions = () => {
    this.setState({loading_text: "Loading PDF"});
    fetch(
      address+"/pdf/"+getCookie("token")+"_"+this.state.category_option
      ).then(res => {
        return res.blob();
      })
      .then((blob)=>{
        this.setState({loading_text: ""});
        const href = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = href;
        a.download = 'question.pdf';
        a.click();
      });
  }
  
  download_facts = () => {
    this.setState({loading_text: "Loading Facts"});
    fetch(
      address+"/factbook/"+getCookie("token")+"_"+this.state.category_option
      ).then(res => {
        return res.blob();
      })
      .then((blob)=>{
        this.setState({loading_text: ""});
        const href = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = href;
        a.download = 'facts.pdf';
        a.click();
      });
  }
  
  render_chart = () => {
    
    let value_sum = 0;
    for(var el in this.state.categories) {
      value_sum+=this.state.categories[el];
    }
    
    if(value_sum == 0){
      return <div> No questions annotated! </div>
    }

    return <BarGraph data={this.state.categories} height={100} title={'Questions annotated by Category'} /> 
  }
  
  render_entities = () => {
    let entities = [];
    for(var i = 0;i<this.state.common_entities.length;i++) {
      let entity = this.state.common_entities[i];
      let searchButton = (<Button style={{marginRight: 30}} onClick={()=>{setCookie("topic",entity); this.setState({});}} variant="contained"> Search </Button>);
      let definition = this.state.common_entity_definitions[entity].substring(0,200)+"...";
      let card = (<div style={{marginBottom: 20, width: "100%"}}> <Card>
      <CardContent>
        <Typography variant="h5" component="h2">
        {entity}
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
    
    return <Carousel cards={entities} /> 
  }
  
  get_info = () => {
    if(this.state.leaderboard_loading) {
      return <CircularProgress />;
    }
    else {
      return <div> 
                {this.state.loading_text!=''?<CircularProgress />:''}

       <br /> 
       <b> Leaderboard </b>
     <Table aria-label="simple table" style={{width: 500}}>
        <TableHead>
          <TableRow>
            <TableCell><b>Username</b></TableCell>
            <TableCell align="right"><b>Mentions annotated</b></TableCell>
            <TableCell align="right"><b>Questions annotated</b></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {this.state.leaderboard.map((row) => (
            <TableRow key={row[0]}>
              <TableCell component="th" scope="row">
                {row[0]}
              </TableCell>
              <TableCell align="right">{row[1]}</TableCell>
              <TableCell align="right">{row[2]}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </div>
    }
  }
  
    handleChange = (event, value) => {
    this.setState({ value });
  };
  
  render_stats = () => {
    if(Object.keys(this.state.categories).length == 0) {
      return <div style={{marginTop: 20}}> 
    {this.state.username} <br /> <br />
    <b> No entities annotated </b>
    </div> 
    }

    return <div style={{marginTop: 20}}> 
    {this.state.username} <br /> <br />
    <div style={{textAlign: 'center'}}> 
      Top Entities:
    </div>
    {this.render_entities()}
    <Grid container> 
      <Grid item xs={6}> 
        Top Categories: 
        {this.render_chart()}

      </Grid>
      <Grid item xs={6}> 
            <button style={{marginRight: 20}} onClick={this.download_questions}> Download PDF </button>  Category: <Dropdown update_value={(category_option)=>{this.setState({category_option})}} default_value={"Any"} options={categories.concat(['Any'])} />  <br />
            <button style={{marginRight: 20}} onClick={this.download_facts}> Download Wikipedia Book </button>  Category: <Dropdown update_value={(category_option)=>{this.setState({category_option})}} default_value={"Any"} options={categories.concat(['Any'])} />  <br />
      </Grid>
    </Grid>
    </div> 
  }

  
  render() {
    if(getCookie("token") == "") {
      return <Redirect to="/login" />;
    }
    else if(getCookie("topic") !== "") {
      return <Redirect to="/entity" />;
    }

    let main_menu = <div  style={{marginTop: 100}}> <Button variant="contained" ><a href="/user"> Main Menu </a> </Button> </div>; 
 
    return <div style={{marginLeft: 30}}> 
            <AppBar>
                          
          <Tabs value={this.state.value} onChange={this.handleChange}>
            <Tab value="one" label="Leaderboard" />
            <Tab value="two" label="Personal Stats" />
          </Tabs>
        </AppBar>
        {this.state.value === 'one' && <div>  {main_menu} {this.get_info()} </div>}
        {this.state.value  === 'two' && <Typography>{main_menu} {this.render_stats()} </Typography>}
   </div>
    
  }
}
