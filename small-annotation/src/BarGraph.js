import {Bar} from 'react-chartjs-2';
import * as React from "react";


export default class BarGraph extends React.Component<Props, State> {

  render = () => {
       let data = {labels: Object.keys(this.props.data).concat(['']),
  datasets: [
    {
      label: 'Questions',
      backgroundColor: 'rgba(75,192,192,1)',
      borderColor: 'rgba(0,0,0,1)',
      borderWidth: 2,
      data: Object.values(this.props.data).concat([0]),
    }
    ]};
    
    
    return      <Bar
          data={data}
          height={50}
          options={{
            title:{
              display:true,
              text:this.props.title,
              fontSize:20
            },
            scales: {
              xAxes: [{
              barPercentage: 0.4
              }]
            },
            legend:{
              display:true,
              position:'right'
            }
          }}
        /> 
  }

}