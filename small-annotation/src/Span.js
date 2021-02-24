 import * as React from "react";
import Autocomplete from '@material-ui/lab/Autocomplete';
import Typography from "@material-ui/core/Typography";
import TextField from '@material-ui/core/TextField';
import {toNormalString,toNiceString} from "./Util";
import { DragSource } from "react-dnd";

interface Props {content: string, start: number, end: number}

interface State {
}

const Types = {
 SPAN: "span"
}
const spanSource = {
 beginDrag(props) {
   return { 'content':props.content, 'start': props.start, 'end': props.end };
 },
 endDrag(props) {
   return { 'content':props.content, 'start': props.start, 'end': props.end };
 }
}
function collect(connect, monitor) {
 return {
 connectDragSource: connect.dragSource(),
 isDragging: monitor.isDragging()
 }
}


class Span extends React.Component<Props, State> {
  state: State = {
  }
  
  
  render() {
     const { isDragging, connectDragSource, src } = this.props;
     return connectDragSource(
       <div style={{fontSize: 16,margin: 3,border: "1px dashed #cccccc", borderRadius: 4, padding: "0 8px", lineHeight: 1,color: "#666666", background: "rgba(255, 255, 255, 0.7)", display: "inline"}}>
        {this.props.content}
      </div>
     )
    
  }
}

export default DragSource(Types.SPAN, spanSource, collect)(Span)
