import * as React from "react";
import Autocomplete from '@material-ui/lab/Autocomplete';
import Typography from "@material-ui/core/Typography";
import TextField from '@material-ui/core/TextField';
import {toNormalString,toNiceString} from "./Util";
import { DragSource } from "react-dnd";
import deleteImage from './images/delete.png';

interface Props {content: string, 
start: number, 
end: number, 
delete_span: any,
add_bolded: any,
remove_bolded: any,
}

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
       <div onMouseOver={()=>{this.props.add_bolded([this.props.start,this.props.end])}} onMouseLeave={()=>{this.props.remove_bolded([this.props.start,this.props.end])}} style={{fontSize: 16,margin: 3,border: "1px dashed #111111", borderRadius: 4, padding: "0 8px", lineHeight: 1,color: "#666666", background: "rgba(255, 255, 255, 0.7)", display: "inline", marginTop: 10}}>

        {this.props.content}
         <img
            style={{marginTop: -8, marginRight: -9, top: -1, right: -1, width: 20, height: 20, cursor: "pointer", userDrag: "none", userSelect: "none"}}
            src={deleteImage}
            onClick={() => this.props.delete_span({ 'content':this.props.content, 'start': this.props.start, 'end': this.props.end })}
         />
      </div>
     )
    
  }
}

export default DragSource(Types.SPAN, spanSource, collect)(Span)
