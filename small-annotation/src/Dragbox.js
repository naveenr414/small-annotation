import * as React from "react";
import Search from "./Search";
import Span from './Span';
import './Dragbox.css';
import { DropTarget } from "react-dnd";
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

interface Props {
  entity_number: number;
  update_spans: any;
  current_spans: any;
  color: string;
  update_entity_name: any;
  delete_span: any;
  add_bolded: any;
  remove_bolded: any;
  delete_entity: any;
  entity_name: string; 
  dragged: boolean;
  toggle_drag: any;
  update_clicked: any;
  clicked: any;
}

interface State {
  show_search: boolean;
  entity_search: string;
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
  }
  
  update_tags = (tags) => {
    setTimeout(() => {this.props.update_tags(tags,this.props.entity_number)},250);
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
    this.setState({show_search: false, entity_name: this.state.entity_search},()=>{this.props.update_entity_name(this.state.entity_search,this.props.entity_number);});
  }
  
  delete_entity = () => {
    this.props.delete_entity(this.props.entity_number);
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
    

    return this.props.dropTarget(
      <div style={{marginBottom: 20}}>  
        <br /> 
        <span style={{backgroundColor: this.props.entity_number>0?this.props.color:"white", textAlign: "center"}}> {this.props.entity_number > 0?this.props.entity_number+": "+this.props.entity_name:"Unassigned tags (2. Drag spans to associated entity cluster on right)"} 
        </span> 
        {this.props.entity_number>0?<button style={{marginLeft: "10%"}} onClick={(e)=>{e.currentTarget.blur(); this.setState({show_search: true})}} > Change Entity
        </button> :''}
        {this.props.entity_number>0?<button style={{marginLeft: "10%"}} onClick={this.delete_entity} > Delete Entity Cluster
        </button>:''}
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
        

        <div> {spans} </div> <br /> </div> </div>);
  }
}

export default DropTarget("span", boxTarget, collect)(Dragbox);
