import * as React from "react";
import Search from "./Search";
import Span from './Span';
import './Dragbox.css';
import { DropTarget } from "react-dnd";
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Grid from "@material-ui/core/Grid";
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import wikipediaIcon from './images/wikipedia_icon.png';

let address = "/quel";

interface Props {
  entity_number: number;
  total_entities: number;
  update_spans: any;
  current_spans: any;
  color: string;
  update_entity_name: any;
  delete_span: any;
  add_bolded: any;
  remove_bolded: any;
  delete_entity: any;
  merge_entity: any;
  entity_name: string; 
  dragged: boolean;
  toggle_drag: any;
  update_clicked: any;
  clicked: any;
  class_name: string;
}

interface State {
  show_search: boolean;
  entity_search: string;
  merge_value: number;
  entity_number: number;
  entity_id: number;
}

const boxTarget = {
    canDrop(props, monitor) {
        const isOver = monitor.isOver();
        return isOver;
    },

    drop(props, monitor) {    
      let item = monitor.getItem();
      props.update_spans({'content': item.content, 'start': item.start, 'end': item.end},props.entity_number);
    }
};

const collect = (connect, monitor) => ({
    dropTarget: connect.dropTarget(),
    canDrop: monitor.canDrop(),
    isOver: monitor.isOver()
});



class Dragbox extends React.Component<Props, State> {
  state: State = {
    show_search: false,
    entity_name: "No Entity",
    entity_search: "No Entity",
    merge_value: this.props.entity_number,
    entity_id: 0,
  }
  
  componentDidMount = () => {
    if(this.props.entity_name!=""){
      fetch(address+"/get_id/"+this.props.entity_name.replaceAll(" ","_")).then((res) => res.json())
        .then((res) => {
        this.setState({entity_id: res})});
    }        
  }
    
  update_tags = (tags) => {
    setTimeout(() => {this.props.update_tags(tags,this.props.entity_number)},250);
  }
  
  entity_number_to_string = () => {
    if(this.props.entity_number>=10) {
      return String.fromCharCode(this.props.entity_number-10+97);
    }
    
    return this.props.entity_number;
  }
  
  get_height = () => {
    let total_tag_length = 0;
    /*for(var i = 0;i<this.props.current_spans.length;i++) {
      total_tag_length+=this.props.current_spans[i]['content'].length;
    }
    console.log("Total tag length "+total_tag_length);*/
    return 150+Math.floor(total_tag_length);
  }
  
  close_search = () => {
    this.setState({show_search: false});
  }
  
  update_entity_name = (entity_search,number) => {
    if(entity_search !== null) {
      this.setState({entity_search});
    }
  }
  
  num_spans = () => {
    let i = 0;
    for(var j = 0;j<this.props.current_spans.length;j++) {
      if(this.props.current_spans[j].start>=0 && 
      this.props.current_spans[j].end>=0) {
        i++;
      }
      
    }
    
    return i;
  }
  
  save_search_results = () => {
    this.setState({show_search: false, entity_name: this.state.entity_search.toLowerCase()},()=>{this.props.update_entity_name(this.state.entity_search.toLowerCase(),this.props.entity_number);});
  }
  
  delete_entity = () => {
    this.props.delete_entity(this.props.entity_number);
  }
  
  componentDidUpdate = (prevProps, prevState, snapshot) => {
    if(JSON.stringify(prevProps)!==JSON.stringify(this.props)) {
        this.setState({merge_value: this.props.entity_number});
    }
  }
  
  render_entity = () => {
    if(this.props.entity_number>0) {
      let confidence = 0.1;
      for(var i = 0;i<this.props.current_spans.length;i++) { 
        if(!("confidence" in this.props.current_spans[i])) {
          confidence = 1;
        } else {
          confidence = Math.max(confidence,this.props.current_spans[i]['confidence']);
        }
      }
      
      if(this.props.entity_name == "") {
        confidence = 0.1
      }
      
      let alpha = Math.min(confidence+0.25,1);
      
      console.log(this.props.entity_name + " "+alpha);
      
      

      
      return (<div> <span className={this.props.entity_number == 1? "entity_opacity": ""} style={{backgroundColor: this.props.entity_number>0?this.props.color:"white", opacity: alpha,textAlign: "center", fontSize: "2vh"}}>  {this.props.entity_number > 0?this.entity_number_to_string()+": "+this.props.entity_name.replaceAll("_", " "):"Unassigned tags (2. Drag to entity cluster on right)"}
          </span>  {this.state.entity_id!=0 && <a style={{textDecoration: 'none'}} target="_blank" style={{color: 'black'}} href={"https://wikipedia.org/wiki?curid="+this.state.entity_id}> <img src={wikipediaIcon} style={{width: 16, height: 16}} />   </a>} </div> );
    }
    return (<span style={{backgroundColor: this.props.entity_number>0?this.props.color:"white", textAlign: "center", fontSize: this.props.entity_number > 0?"3vh":"2.5vh"}} > {this.props.entity_number > 0?this.entity_number_to_string()+": "+this.props.entity_name.replaceAll("_", " "):(<span> 2. Move unassigned spans on right to entity </span> )}
          </span> );
  }
  
  create_dropdown = () => {
    let menu_items = [];
    for(var i = 1;i<this.props.total_entities;i++) {
      let text = i;
      if(i>=10) {
        text = String.fromCharCode(i-10+97)
      }
      menu_items.push(<MenuItem value={i}>{text}</MenuItem>);
    }
    return menu_items;
  }

  merge_entity = () => {
  this.props.merge_entity(this.props.entity_number,this.state.merge_value);
  }

  render = () => {
    let spans = [];
    for(var i = 0;i<this.props.current_spans.length;i++) {
      if(this.props.current_spans[i].start<0 || 
          this.props.current_spans[i].end<0) {
            continue;
      }
      
      let json_string = JSON.stringify({start: this.props.current_spans[i].start, end: this.props.current_spans[i].end, number: i, entity_number: this.props.entity_number});
      spans.push(<Span remove_bolded={this.props.remove_bolded} add_bolded={this.props.add_bolded} content={this.props.current_spans[i].content} start={this.props.current_spans[i].start} end={this.props.current_spans[i].end} delete_span={this.props.delete_span} update_clicked={()=>{this.props.update_clicked(json_string)}} toggle_drag={this.props.toggle_drag} number={i} clicked={this.props.clicked === json_string} />);
    }
    
    if(this.props.entity_number == 0) {
      return <div> 
      
      {this.render_entity()} 
      <div style={{width: "80%", minHeight: 40, padding: 5, borderRadius: 4,border: this.props.dragged?"2px dashed #000000":"1px solid #444444"}}> 
          

          <div> {spans} </div> 
          <br /> 
          </div>
      </div>
    }
    
    return this.props.dropTarget(
      <div className={this.props.entity_number == 1? "entity_box": ""}>  
        <br /> 
        <Grid container spacing={this.props.entity_number>0?4:6}>

                    <Grid item xs={this.props.entity_number>0?4:6} > 
                      {this.render_entity()}
         {this.props.entity_number>0?<br />:<div />}
        {this.props.entity_number>0?<button className={this.props.entity_number == 1? "change": ""} style={{marginTop: 10, fontSize: "2vh", width: "50%"}} onClick={(e)=>{e.currentTarget.blur(); this.setState({show_search: true})}} > {this.props.entity_name ==""? 'Select':'Change'}
        </button> :''} {this.props.entity_number>0?<span />:<div />}
        {this.props.entity_number>0?<button className={this.props.entity_number == 1? "delete": ""} style={{marginTop: 10, fontSize: "2vh", width: "45%", textAlign: "center"}} onClick={this.delete_entity} > Delete
        </button>:''} <br />
        </Grid> 
        <Grid item xs={this.props.entity_number>0?8:6}>
        <Modal size="lg" show={this.state.show_search} onHide={this.close_search} animation={false}>
          <Modal.Header closeButton>
            <Modal.Title>Search</Modal.Title>
          </Modal.Header>
          <Modal.Body> <Search close={this.close_search} save={this.save_search_results} update_entity_name={this.update_entity_name} entity_number={this.props.entity_number} default_search={this.props.entity_name!==""?this.props.entity_name:this.num_spans() == 1?this.props.current_spans[this.props.current_spans.length-1]['content']:""} /> </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={this.save_search_results}>
              Save
            </Button>
            <Button variant="secondary" onClick={this.close_search}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
          <div style={{width: "80%", marginLeft: "10%", minHeight: 40, padding: 5, borderRadius: 4,border: this.props.dragged?"2px dashed #000000":"1px solid #444444"}}> 
          

          <div> {spans} </div> 
          <br /> 
          </div> 
          </Grid>
          </Grid>
        </div>);
  }
}

export default DropTarget("span", boxTarget, collect)(Dragbox);
