import { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import { Player, PassingVisualizationProps, PassingVisualizationState } from './types';
import PlayerSelections from './PlayerSelections';
import SelectMatch from './SelectMatch';
import { Chart, ChartConfiguration, BubbleDataPoint, BubbleController, CategoryScale, LinearScale, PointElement, Tooltip } from 'chart.js';
Chart.register(BubbleController, CategoryScale, LinearScale, PointElement, Tooltip);

const id: string = 'passing-visualization';
const canvasWindowId: string = id + '-chart-config';
const aspectRatio: number = 3 / 2
const canvasWidth: number = 600;
const canvasHeight: number = canvasWidth / aspectRatio;

const PassingVisualization: React.FC<PassingVisualizationProps> = ({ matches }) => {
  const [currentMatch, setCurrentMatch] = useState<string>("0");
  const [state, setState] = useState<PassingVisualizationState>({
    isLoading: true,
    arrayOfPlayers: [],
    filteredPlayers: [],
    passMap: {},
    activePasser: "0",
    activeReceiver: "0"
  })
  let horizontalLinePlugin: any;

  useEffect(() => {
    setState({
      ...state,
      isLoading: true
    })
    fetch(`/passing-data/${currentMatch}`).then((res) => res.json()).then((data) => {
      let arrayOfPlayers: Player[] = Object.keys(data.players).map(playerID => ({
        id: playerID,
        x: data.players[playerID].avg_x,
        y: data.players[playerID].avg_y,
        r: data.players[playerID].count,
        name: data.players[playerID].player_name,
        count: data.players[playerID].count
      }));
      const maxRadius: number = Math.max(...arrayOfPlayers.map(player => player.r))
      arrayOfPlayers = arrayOfPlayers.map(player => {
        player.r = (player.r / maxRadius) * 10
        return player
      })
      setState({
        ...state,
        isLoading: false,
        arrayOfPlayers,
        filteredPlayers: arrayOfPlayers,
        passMap: data.passMap
      })
    }).catch(err => {
      console.error(err)
    })
  }, [currentMatch])


  useEffect(() => {
    const ctx = document.getElementById(id) as HTMLCanvasElement;
    let chartInstance = (window as any)[canvasWindowId];

    if (chartInstance) {
      chartInstance.destroy();
    }


    horizontalLinePlugin = {
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
        ctx.moveTo(bottomX, topY + nonPenaltyBoxDistance);
        ctx.lineTo(bottomX + penaltyBoxHorizontalDistance, topY + nonPenaltyBoxDistance);
        ctx.lineTo(bottomX + penaltyBoxHorizontalDistance, bottomY - nonPenaltyBoxDistance)
        ctx.lineTo(bottomX, bottomY - nonPenaltyBoxDistance)
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.stroke();


        ctx.beginPath();
        ctx.moveTo(topX, topY + nonPenaltyBoxDistance);
        ctx.lineTo(topX - penaltyBoxHorizontalDistance, topY + nonPenaltyBoxDistance);
        ctx.lineTo(topX - penaltyBoxHorizontalDistance, bottomY - nonPenaltyBoxDistance)
        ctx.lineTo(topX, bottomY - nonPenaltyBoxDistance)
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(bottomX, topY);
        ctx.lineTo(topX, topY);
        ctx.lineTo(topX, bottomY)
        ctx.lineTo(bottomX, bottomY)
        ctx.lineTo(bottomX, topY)
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo((bottomX + topX) / 2, topY);
        ctx.lineTo((bottomX + topX) / 2, bottomY);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.stroke();



        const passMap = state.passMap
        state.filteredPlayers.forEach((player, index) => {
          const currentPlayerId = player.id
          const matchingPasserKeys = Object.keys(passMap).filter(key => key.split("-")[0] === currentPlayerId)
          matchingPasserKeys.forEach(passerKey => {
            const passes = passMap[passerKey].passes
            const numberOfPasses = passes.length
            const passingPlayerObject = state.filteredPlayers.find(player => player.id === passerKey.split("-")[0])
            const averageStartX = passingPlayerObject?.x || 0
            const averageStartY = passingPlayerObject?.y || 0

            const receivingPlayerObject = state.filteredPlayers.find(player => player.id === passerKey.split("-")[1])
            const averageEndX = receivingPlayerObject?.x || 0
            const averageEndY = receivingPlayerObject?.y || 0
            //draw a line for one pass
            const xPercentageStart = averageStartX / 120
            const xLocationStart = xPercentageStart * (topX - bottomX)
            const yPercentageStart = averageStartY / 80
            const yLocationStart = yPercentageStart * (topY - bottomY)

            const xPercentageEnd = averageEndX / 120
            const xLocationEnd = xPercentageEnd * (topX - bottomX)
            const yPercentageEnd = averageEndY / 80
            const yLocationEnd = yPercentageEnd * (topY - bottomY)


            ctx.beginPath();
            ctx.moveTo(xLocationStart + bottomX, yLocationStart + bottomY);
            ctx.lineTo(xLocationEnd + bottomX, yLocationEnd + bottomY);
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 1;
            ctx.stroke();

          })
        })

        ctx.restore();
      }
    };

    Chart.register(horizontalLinePlugin);

    const chartData = {
      datasets: [{
        label: 'Player Locations',
        data: state.filteredPlayers,
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
            type: 'linear',
            position: 'bottom',
            min: 0,
            max: 120,
            display: true,
          },
          y: {
            min: 80,
            max: 0,
            display: true,
            reverse: true
          }
        },
        plugins: {
          tooltip: {
            enabled: true,
            callbacks: {
              label: function (context: any) {
                const index = context.dataIndex;
                const player: Player = context.dataset.data[index];
                return player.name
              }
            }
          }
        }
      },
    };

    chartInstance = new Chart(ctx, config);
    (window as any)[canvasWindowId] = chartInstance;


    return () => {
      if (horizontalLinePlugin) {
        Chart.unregister(horizontalLinePlugin);
      }
      if (chartInstance) {
        chartInstance.destroy();
      }
    };
  }, [state])
  return (
    <Grid container spacing={2} alignItems="center" direction="column">
      <Grid item xs={12} container justifyContent="center">
        <Grid item xs={12} sm={6} md={4}>
          <SelectMatch currentMatch={currentMatch} matches={matches} />

        </Grid>
      </Grid>
      <Grid item>
        <canvas id={id} width={canvasWidth} height={canvasHeight}></canvas>
      </Grid>
      <Grid item container justifyContent="center">
        <PlayerSelections arrayOfPlayers={state.arrayOfPlayers} state={state} />
      </Grid>
    </Grid>
  )

}
export default PassingVisualization;