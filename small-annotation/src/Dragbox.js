import * as React from "react";
import {DraggableArea,DraggableAreasGroup} from 'react-draggable-tags';


const initialTags = [
  {id: 1, content: 'apple'}, {id: 2, content: 'olive'}, {id: 3, content: 'banana'},
  {id: 4,  content: 'lemon'}, {id: 5, content: 'orange'}, {id: 6, content: 'grape'},
  {id: 7, content: 'strawberry'}, {id: 8, content: 'cherry'}, {id: 9, content: 'peach'}
];

const initialTags_2 = [
  {id: 10, content: 'mango'}
];


interface Props {
  entity_number: number;
  drag_group: any;
  update_tags: any;
  current_tags: any;
}

interface State {
  tags: any;
  entity: string;
  drag_box: any;
  drag_box_2: any;
  tags2: any;
}

let DraggableArea1 = null;

export default class Dragbox extends React.Component<Props, State> {
  state: State = {
  tags: initialTags,
    tags2: initialTags_2,
    entity: "Placeholder Entity",
    drag_box: null,
    drag_box_2: null,
  }
  
  update_tags = (tags) => {
    alert(tags);
    this.props.update_tags(tags,this.props.entity_number);
  }
  
  componentDidMount = () => {
    DraggableArea1 = this.props.drag_group.addArea();
  }
  
  

  render = () => {
    let drag_box_1 = <div> Hello World </div>
    if(DraggableArea1!=null) {
      drag_box_1 = ( <DraggableArea1
      tags={this.state.tags}
      render={({tag, index}) => (
        <div style={{fontSize: 13,margin: 3,border: "1px dashed #cccccc", borderRadius: 4, padding: "0 8px", lineHeight: 1,color: "#666666", background: "rgba(255, 255, 255, 0.7)"}}>
          {tag.content}
        </div>
      )}
      onChange={tags => this.setState({tags})}
      />); 
    }

    return <div> {this.props.entity_number}: {drag_box_1} <br /> </div>;
  }
}
