import * as React from "react";
import {DraggableArea,DraggableAreasGroup} from 'react-draggable-tags';
import Search from "./Search";
interface Props {
  entity_number: number;
  drag_group: any;
  update_tags: any;
  current_tags: any;
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
    this.props.update_tags(tags,this.props.entity_number);
  }
  
  componentDidMount = () => {
    DraggableArea1 = this.props.drag_group.addArea();
  }
  
  componentDidUpdate = (oldProps) => {
    if(oldProps.current_tags!==this.props.current_tags) {
      this.setState({tags:this.props.current_tags});
    }
  }

  render = () => {
    let drag_box_1 = <div> </div>
    if(DraggableArea1!=null) {
      drag_box_1 = (<DraggableArea1
      tags={this.state.tags}
      render={({tag, index}) => (
        <div style={{fontSize: 13,margin: 3,border: "1px dashed #cccccc", borderRadius: 4, padding: "0 8px", lineHeight: 1,color: "#666666", background: "rgba(255, 255, 255, 0.7)"}}>
          {tag.content}
        </div>
      )}
      onChange={tags => {this.setState({tags}); this.update_tags(tags);}}
      />); 
    }

    return <div> {this.props.entity_number>0?<Search />:''} <br /> <div style={{width: 294, height: 220, padding: 5, borderRadius: 4,border: "1px solid #E9E9E9"}}> {this.props.entity_number > 0?this.props.entity_number:"Unassigned tags"} : {drag_box_1} <br /> </div> </div>;
  }
}
