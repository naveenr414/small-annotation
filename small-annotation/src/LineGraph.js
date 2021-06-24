import { Line } from "react-chartjs-2";
import * as React from "react";

export default class LineGraph extends React.Component<Props, State> {
  render = () => {
    let data = {
         labels: this.props.labels,
         datasets: [
           {
            label: this.props.label,
            data: this.props.data,
            fill: true,
            backgroundColor: "rgba(75,192,192,0.2)",
            borderColor: "rgba(75,192,192,1)",
           }
         ]
         };
       return <Line width={1500} height={200} data={data} />;
  }
}