import * as React from "react";
import ItemsCarousel from 'react-items-carousel';

export default class LineGraph extends React.Component<Props, State> {
  state: State = {
      current_question: 0,
  }
  
  update_current_question = (current_question) => {
   this.setState({current_question});
  }

  componentWillReceiveProps(nextProps) {
    console.log(nextProps);
    console.log(this.props.cards);
    if (nextProps !== this.props.cards) {
      this.setState({ current_question: 0 });
    }
  }

  
  render = () => {
      return <div style={{padding: '0 40px', marginRight: 20, marginLeft: 20}}> <ItemsCarousel
        requestToChangeActive={this.update_current_question}
        activeItemIndex={this.state.current_question}
        numberOfCards={4}
        gutter={20}
        leftChevron={<button>{'<'}</button>}
        rightChevron={<button>{'>'}</button>}
        outsideChevron
        chevronWidth={40}
      >
      {this.props.cards}
      </ItemsCarousel> </div>
  }
}