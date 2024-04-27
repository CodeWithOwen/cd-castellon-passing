import { useEffect } from 'react';
import Grid from '@mui/material/Grid';
import { Chart, ChartConfiguration, BubbleDataPoint, BubbleController, CategoryScale, LinearScale, PointElement, Tooltip } from 'chart.js';
Chart.register(BubbleController, CategoryScale, LinearScale, PointElement, Tooltip);
type abc = {
  x: number,
  y: number,
  r: number,
  name: string


}
const PassingVisualization: React.FC = () => {

  const id: string = 'passing-visualization';
  const canvasWindowId: string = id + '-chart-config';
  const aspectRatio: number = 3 / 2
  const canvasWidth: number = 400;
  const canvasHeight: number = canvasWidth / aspectRatio;
  useEffect(() => {
    fetch("/passing-data").then((res) => res.json()).then((data) => {
      let arrayOfPlayers: abc[] = []
      for (const playerID in data) {
        arrayOfPlayers.push({ x: data[playerID].avg_x, y: data[playerID].avg_y, r: 10, name: data[playerID].player_name })
      }
      const ctx = document.getElementById(id) as HTMLCanvasElement;
      if ((window as any)[canvasWindowId] !== undefined) {
        try {
          (window as any)[canvasWindowId].destroy();
        } catch (e) {
          console.log("canvas error", e)
        }
      }
      console.log("arrayOfPlayers", arrayOfPlayers)
      const chartData = {
        datasets: [{
          label: 'Player Locations',
          data: arrayOfPlayers,
          backgroundColor: 'rgb(255, 99, 132)'
        }]
      };
      const config: ChartConfiguration<'bubble', (number | BubbleDataPoint)[], number> = {
        type: 'bubble',
        data: chartData,
        options: {
          responsive: false,
          scales: {
            x: {
              display: false,
            },
            y: {
              display: false,
            }
          },
          plugins: {
            tooltip: {
              enabled: true,
              callbacks: {
                label: function (context: any) {
                  console.log("context", context)
                  const index = context.dataIndex;
                  const player: abc = context.dataset.data[index];
                  console.log("player", player)
                  // return "abv"
                  return player.name
                }
              }
            }
          }
        },
      };
      const customLinePlugin = {
        id: 'customLine',
        afterDraw: (chart: any) => {
          // const ctx = chart.ctx;
          // const datasets = chart.data.datasets;
          // if (datasets.length > 0) {
          //   const meta = chart.getDatasetMeta(0);
          //   const point1 = meta.data[0].getCenterPoint();
          //   const point2 = meta.data[1].getCenterPoint();
          //   ctx.save();
          //   ctx.beginPath();
          //   ctx.moveTo(point1.x, point1.y);
          //   ctx.lineTo(point2.x, point2.y);
          //   ctx.strokeStyle = '#FF0000';
          //   ctx.lineWidth = 2;
          //   ctx.stroke();
          //   ctx.restore();
          // }
        }
      };
      const horizontalLinePlugin = {
        id: 'horizontalLine',
        afterDraw: (chart: any) => {
          const ctx = chart.ctx;
          const yAxis = chart.scales.y;
          const xAxis = chart.scales.x;
          const midX = xAxis.getPixelForValue((xAxis.max + xAxis.min) / 2);
          // const midY = yAxis.getPixelForValue((yAxis.max + yAxis.min) / 2);

          const topX = xAxis.getPixelForValue(xAxis.max);
          const topY = yAxis.getPixelForValue(yAxis.max);

          const bottomX = xAxis.getPixelForValue(xAxis.min);
          const bottomY = yAxis.getPixelForValue(yAxis.min);

          const nonPenaltyBoxVertPercentage: number = 18 / 80
          const penaltyBoxHorizontalPercentage: number = 18 / 120

          const verticalPixelDistance: number = bottomY - topY
          const horizontalPixelDistance: number = topX - bottomX

          const nonPenaltyBoxDistance: number = verticalPixelDistance * nonPenaltyBoxVertPercentage
          const penaltyBoxHorizontalDistance: number = horizontalPixelDistance * penaltyBoxHorizontalPercentage

          ctx.save();

          ctx.beginPath();
          ctx.moveTo(0, topY + nonPenaltyBoxDistance);
          ctx.lineTo(penaltyBoxHorizontalDistance, topY + nonPenaltyBoxDistance);
          ctx.lineTo(penaltyBoxHorizontalDistance, bottomY - nonPenaltyBoxDistance);
          ctx.lineTo(0, bottomY - nonPenaltyBoxDistance);
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 2;
          ctx.stroke();



          ctx.beginPath();
          ctx.moveTo(topX + bottomX, topY + nonPenaltyBoxDistance);
          ctx.lineTo(topX + bottomX - penaltyBoxHorizontalDistance, topY + nonPenaltyBoxDistance);
          ctx.lineTo(topX + bottomX - penaltyBoxHorizontalDistance, bottomY - nonPenaltyBoxDistance);
          ctx.lineTo(topX + bottomX, bottomY - nonPenaltyBoxDistance);
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 2;
          ctx.stroke();



          ctx.beginPath();
          ctx.moveTo(midX, 0);
          ctx.lineTo(midX, chart.height);
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 2;
          ctx.stroke();


          ctx.restore();
        }
      };

      Chart.register(customLinePlugin, horizontalLinePlugin);

      (window as any)[canvasWindowId] = new Chart(ctx, config);

    }).catch((e) => {
      console.log("error", e)
    })
  }, [])
  return (
    <Grid container spacing={2} justifyContent="center">
      <Grid item>
        <canvas id={id} width={canvasWidth} height={canvasHeight}></canvas>
      </Grid>
    </Grid>
  )

}
export default PassingVisualization;