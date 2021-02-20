import * as React from "react";
import {DraggableArea,DraggableAreasGroup} from 'react-draggable-tags';
import Search from "./Search";
interface Props {
  entity_number: number;
  drag_group: any;
  update_tags: any;
  current_tags: any;
  color: string;
  update_entity_name: any;
}

interface State {
  tags: any;
  entity: string;
}

let DraggableArea1 = null;

export default class Dragbox extends React.Component<Props, State> {
  state: State = {
  tags: this.props.current_tags,
    entity: "Placeholder Entity",
  }
  
  update_tags = (tags) => {
    setTimeout(() => {this.props.update_tags(tags,this.props.entity_number)},250);
  }
  
  componentDidMount = () => {
    DraggableArea1 = this.props.drag_group.addArea();
  }
  
  componentDidUpdate = (oldProps) => {
    if(oldProps.current_tags!==this.props.current_tags) {
      this.setState({tags:this.props.current_tags});
    }
  }

  get_height = () => {
    let total_tag_length = 0;
    for(var i = 0;i<this.state.tags.length;i++) {
      total_tag_length+=this.state.tags[i]['content'].length;
    }
    console.log("Total tag length "+total_tag_length);
    return 150+Math.floor(total_tag_length);
  }
  
  render = () => {
    let drag_box_1 = <div> </div>
    if(DraggableArea1!=null) {
      drag_box_1 = (<DraggableArea1
      tags={this.state.tags}
      render={({tag, index}) => (
        <div style={{fontSize: 16,margin: 3,border: "1px dashed #cccccc", borderRadius: 4, padding: "0 8px", lineHeight: 1,color: "#666666", background: "rgba(255, 255, 255, 0.7)"}}>
          {tag.content}
        </div>
      )}
      onChange={
      tags => {this.setState({tags});this.update_tags(tags)}}
      />); 
    }

    return <div style={{marginBottom: 20}}>  {this.props.entity_number>1?<Search update_entity_name={this.props.update_entity_name} entity_number={this.props.entity_number} />:''} <br /> <div style={{width: 400, height: this.get_height(), padding: 5, borderRadius: 4,border: "1px solid #E9E9E9"}}> <span style={{backgroundColor: this.props.entity_number>1?this.props.color:"white"}}> {this.props.entity_number > 1?this.props.entity_number+":":this.props.entity_number == 0?"Unassigned tags":"Recycle Bin"} </span> {drag_box_1} <br /> </div> </div>;
  }
}
