import * as React from "react";
import Search from "./Search";
import Span from './Span';
import './Dragbox.css';
import { DropTarget } from "react-dnd";

interface Props {
  entity_number: number;
  update_spans: any;
  current_spans: any;
  color: string;
  update_entity_name: any;
  delete_span: any;
}

interface State {
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
  
  

  render = () => {
    let spans = [];
    for(var i = 0;i<this.props.current_spans.length;i++) {
      spans.push(<Span content={this.props.current_spans[i].content} start={this.props.current_spans[i].start} end={this.props.current_spans[i].end} delete_span={this.props.delete_span} />);
    }

    return this.props.dropTarget(
      <div style={{marginBottom: 20}}>  
        {this.props.entity_number>1?<Search update_entity_name={this.props.update_entity_name} entity_number={this.props.entity_number} />:''}

        <br /> 
        <div style={{width: 400, height: this.get_height(), padding: 5, borderRadius: 4,border: "1px solid #E9E9E9"}}> 
        
        <span style={{backgroundColor: this.props.entity_number>0?this.props.color:"white"}}> {this.props.entity_number > 0?this.props.entity_number+":":"Unassigned tags"} 
        </span> 
        
        <div> {spans} </div> <br /> </div> </div>);
  }
}

export default DropTarget("span", boxTarget, collect)(Dragbox);
