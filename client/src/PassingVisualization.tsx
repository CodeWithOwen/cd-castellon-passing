import { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import { Player, PassingVisualizationProps, PassingVisualizationState, ChartDataType, AllowablePasserKeys } from './types';
import PlayerSelections from './PlayerSelections';
import Explanations from './Explanations';
import SelectMatch from './SelectMatch';
import Typography from '@mui/material/Typography';
import { Chart, ChartConfiguration, BubbleDataPoint, BubbleController, CategoryScale, LinearScale, PointElement, Tooltip } from 'chart.js';
Chart.register(BubbleController, CategoryScale, LinearScale, PointElement, Tooltip);

//graph setup
const id: string = 'passing-visualization';
const canvasWindowId: string = id + '-chart-config';
const aspectRatio: number = 3 / 2
//keeping field/canvas width fixed for now
const canvasWidth: number = 540;
const fieldLengthInYards: number = 120;
const fieldWidthInYards: number = 80;
const canvasHeight: number = canvasWidth / aspectRatio;
const lowAddedValueColor: number[] = [26, 188, 156]
const highAddedValueColor: number[] = [155, 89, 182]

const PassingVisualization: React.FC<PassingVisualizationProps> = ({ matches }) => {
  const [currentMatch, setCurrentMatch] = useState<string>("0");
  const [state, setState] = useState<PassingVisualizationState>({
    isLoading: true,
    arrayOfPlayers: [],
    filteredPlayers: [],
    passMap: {},
    filteredPassMap: {},
    activePasser: "0",
    activeReceiver: "0"
  })
  let drawFieldAndPassesPlugin: any;
  const handleMatchChange = (event: React.ChangeEvent<{ name?: string; value: string }>) => {
    setCurrentMatch(event.target.value);
  }

  const handlePlayerSelectionChange = (event: React.ChangeEvent<{ name?: string; value: unknown }>, selectName: AllowablePasserKeys) => {
    setState({
      ...state,
      [selectName]: event.target.value as string
    })
  }

  useEffect(() => {
    //if no activePasser and no activeReceiver, the filteredPassMap and filteredPlayers should be equivalent to the unfiltered values
    if (state.activePasser === "0" && state.activeReceiver === "0") {
      setState({
        ...state,
        filteredPassMap: state.passMap,
        filteredPlayers: state.arrayOfPlayers
      })
    }

    //if there is an activePasser and no activeReceiver, only include passes in the filteredPassMap that match the activePasser
    if (state.activePasser !== "0" && state.activeReceiver === "0") {
      let filteredPassMap: any = {}
      let recieversObject: any = {}
      for (const key in state.passMap) {
        const [passerId, receiverId] = key.split("-")
        if (passerId === state.activePasser) {
          recieversObject[receiverId] = true
          filteredPassMap[key] = state.passMap[key]
        }
      }
      setState({
        ...state,
        filteredPassMap,
        filteredPlayers: state.arrayOfPlayers
      })
    }

    //if there is an activePasser and an activeReceiver, only include passes in the filteredPassMap that match the activePasser and activeReceiver
    //only show those two players in the filteredPlayers array
    if (state.activePasser !== "0" && state.activeReceiver !== "0") {
      let filteredPassMap: any = {}

      for (const key in state.passMap) {
        const [passerId, receiverId] = key.split("-") as [string, string]
        if (passerId === state.activePasser && receiverId === state.activeReceiver) {
          filteredPassMap[key] = state.passMap[key]
        }
      }
      const filteredPlayers: Player[] = state.arrayOfPlayers.filter(player => player.id === state.activePasser || player.id === state.activeReceiver)
      setState({
        ...state,
        filteredPassMap,
        filteredPlayers
      })
    }

    //if there is an activeReceiver and no activePasser, only include passes in the filteredPassMap that match the activeReceiver
    if (state.activePasser === "0" && state.activeReceiver !== "0") {
      let filteredPassMap: any = {}

      for (const key in state.passMap) {
        const [_, receiverId] = key.split("-") as [string, string]
        if (receiverId === state.activeReceiver) {
          filteredPassMap[key] = state.passMap[key]
        }
      }
      setState({
        ...state,
        filteredPassMap,
        filteredPlayers: state.arrayOfPlayers
      })
    }
  }, [state.activePasser, state.activeReceiver])

  useEffect(() => {
    setState({
      ...state,
      isLoading: true,
      activePasser: "0",
      activeReceiver: "0"
    })
    fetch(`api/passing-data/${currentMatch}`).then((res) => res.json()).then((data: { players: Player[], passMap: any }) => {
      let arrayOfPlayers: Player[] = data.players.map((player: Player) => {
        player.r = player.totalPasses
        return player
      })
      const maxRadius: number = Math.max(...arrayOfPlayers.map(player => player.r))
      arrayOfPlayers = arrayOfPlayers.map((player: Player) => {
        player.r = (player.r / maxRadius) * 20
        return player
      })
      setState({
        ...state,
        isLoading: false,
        arrayOfPlayers,
        filteredPlayers: arrayOfPlayers,
        passMap: data.passMap,
        filteredPassMap: data.passMap
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

    drawFieldAndPassesPlugin = {
      id: 'draw-field-and-passes',
      afterDatasetsDraw: (chart: any) => {
        const ctx: any = chart.ctx;
        const yAxis = chart.scales.y;
        const xAxis = chart.scales.x;

        //get pixel values of four corners of field
        const topX: number = xAxis.getPixelForValue(xAxis.max);
        const topY: number = yAxis.getPixelForValue(yAxis.max);
        const bottomX: number = xAxis.getPixelForValue(xAxis.min);
        const bottomY: number = yAxis.getPixelForValue(yAxis.min);
        const verticalPixelDistance: number = bottomY - topY
        const horizontalPixelDistance: number = topX - bottomX

        //prepare for penalty box drawing
        const nonPenaltyBoxVertPercentage: number = 18 / fieldWidthInYards
        const penaltyBoxHorizontalPercentage: number = 18 / fieldLengthInYards
        const nonPenaltyBoxDistance: number = verticalPixelDistance * nonPenaltyBoxVertPercentage
        const penaltyBoxHorizontalDistance: number = horizontalPixelDistance * penaltyBoxHorizontalPercentage

        ctx.save();

        //draw field borders
        ctx.beginPath();
        ctx.moveTo(bottomX, topY);
        ctx.lineTo(topX, topY);
        ctx.lineTo(topX, bottomY)
        ctx.lineTo(bottomX, bottomY)
        ctx.lineTo(bottomX, topY)
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.stroke();

        //draw center line
        ctx.beginPath();
        ctx.moveTo((bottomX + topX) / 2, topY);
        ctx.lineTo((bottomX + topX) / 2, bottomY);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.stroke();

        //draw right penalty box
        ctx.beginPath();
        ctx.moveTo(topX, topY + nonPenaltyBoxDistance);
        ctx.lineTo(topX - penaltyBoxHorizontalDistance, topY + nonPenaltyBoxDistance);
        ctx.lineTo(topX - penaltyBoxHorizontalDistance, bottomY - nonPenaltyBoxDistance)
        ctx.lineTo(topX, bottomY - nonPenaltyBoxDistance)
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.stroke();

        //draw left penalty box
        ctx.beginPath();
        ctx.moveTo(bottomX, topY + nonPenaltyBoxDistance);
        ctx.lineTo(bottomX + penaltyBoxHorizontalDistance, topY + nonPenaltyBoxDistance);
        ctx.lineTo(bottomX + penaltyBoxHorizontalDistance, bottomY - nonPenaltyBoxDistance)
        ctx.lineTo(bottomX, bottomY - nonPenaltyBoxDistance)
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.stroke();

        //draw center circle
        const centerCircleRadius: number = 10
        const centerCircleRadiusPercentage: number = centerCircleRadius / fieldLengthInYards
        const centerCircleRadiusPixels: number = centerCircleRadiusPercentage * horizontalPixelDistance

        ctx.beginPath();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc((bottomX + topX) / 2, (bottomY + topY) / 2, centerCircleRadiusPixels, 0, 2 * Math.PI);
        ctx.stroke();

        const passMap: any = state.filteredPassMap
        state.filteredPlayers.forEach((player: Player) => {
          const currentPlayerId: string = player.id
          const matchingPasserKeys: string[] = Object.keys(passMap).filter(key => key.split("-")[0] === currentPlayerId)
          matchingPasserKeys.forEach((passerKey) => {
            //draw a line for each pass
            //TO-DO: find a way to offset lines so they don't overlap
            //TO-DO: make boldness of line correspond to number of passes
            const passingPlayerObject: Player = state.filteredPlayers.find(player => player.id === passerKey.split("-")[0])!
            const averageStartX: number = passingPlayerObject.x
            const averageStartY: number = passingPlayerObject.y

            const receivingPlayerObject: Player = state.filteredPlayers.find(player => player.id === passerKey.split("-")[1])!
            const averageEndX: number = receivingPlayerObject.x
            const averageEndY: number = receivingPlayerObject.y

            const xPercentageStart: number = averageStartX / fieldLengthInYards
            const xLocationStart: number = xPercentageStart * (topX - bottomX)
            const yPercentageStart: number = averageStartY / fieldWidthInYards
            const yLocationStart: number = yPercentageStart * (topY - bottomY)

            const xPercentageEnd: number = averageEndX / fieldLengthInYards
            const xLocationEnd: number = xPercentageEnd * (topX - bottomX)
            const yPercentageEnd: number = averageEndY / fieldWidthInYards
            const yLocationEnd: number = yPercentageEnd * (topY - bottomY)

            const startX: number = xLocationStart + bottomX
            const startY: number = yLocationStart + bottomY
            const endX: number = xLocationEnd + bottomX
            const endY: number = yLocationEnd + bottomY

            const arrowLength: number = 6;
            const greyColor: string = "#666666"
            const angle: number = Math.atan2(endY - startY, endX - startX);
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.strokeStyle = greyColor;
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(endX, endY);
            ctx.lineTo(endX - arrowLength * Math.cos(angle - Math.PI / 6), endY - arrowLength * Math.sin(angle - Math.PI / 6));
            ctx.lineTo(endX - arrowLength * Math.cos(angle + Math.PI / 6), endY - arrowLength * Math.sin(angle + Math.PI / 6));
            ctx.lineTo(endX, endY);
            ctx.lineTo(endX - arrowLength * Math.cos(angle - Math.PI / 6), endY - arrowLength * Math.sin(angle - Math.PI / 6));

            ctx.strokeStyle = greyColor;
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.fillStyle = greyColor;
            ctx.fill();

          })
        })
        ctx.restore();
      }
    };

    Chart.register(drawFieldAndPassesPlugin);
    //get range of valueAdded so we can color bubbles accordingly
    const minAverageValueAdded: number = Math.min(...state.arrayOfPlayers.map(player => player.averageValueAdded || 0))
    const maxAverageValueAdded: number = Math.max(...state.arrayOfPlayers.map(player => player.averageValueAdded || 0))

    const chartData: ChartDataType = {
      datasets: [{
        label: 'Player Locations',
        data: state.filteredPlayers,
        backgroundColor: state.filteredPlayers.map((player: Player) => {
          return interpolateColor(player.averageValueAdded as number, minAverageValueAdded, maxAverageValueAdded, lowAddedValueColor, highAddedValueColor)
        }
        )
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
            max: fieldLengthInYards,
            display: false,
          },
          y: {
            min: fieldWidthInYards,
            max: 0,
            display: false,
            reverse: true
          }
        },
        plugins: {
          tooltip: {
            enabled: true,
            callbacks: {
              label: function (context: any) {
                const index: number = context.dataIndex;
                const player: Player = context.dataset.data[index];
                if (state.activePasser === "0" && state.activeReceiver === "0") {
                  return [player.name, `Made ${player.totalPasses} passes in this match.`, `Average Value Added: ${player.averageValueAdded?.toFixed(4)}`]
                }
                if (state.activePasser !== "0" && state.activeReceiver === "0") {
                  if (player.id === state.activePasser) {
                    return [player.name, `Made ${player.totalPasses} passes in this match.`, `Average Value Added: ${player.averageValueAdded?.toFixed(4)}`]
                  }
                  const count: number = state.passMap[`${state.activePasser}-${player.id}`]?.passes.length || 0
                  const passer: Player = state.arrayOfPlayers.find(player => player.id === state.activePasser)!
                  return [player.name, `Received ${count} passes from ${passer?.name}.`]
                }
                if (state.activePasser !== "0" && state.activeReceiver !== "0") {
                  const isPasser: boolean = player.id === state.activePasser
                  const receiver: Player = state.filteredPlayers.find(player => player.id === state.activeReceiver)!
                  const passer: Player = state.filteredPlayers.find(player => player.id === state.activePasser)!
                  const count: number = state.passMap[`${state.activePasser}-${state.activeReceiver}`]?.passes.length || 0
                  if (isPasser) {
                    return [player.name, `Made ${count} passes to ${receiver?.name}.`]
                  } else {
                    return [player.name, `Received ${count} passes from ${passer?.name}.`]
                  }
                }
                if (state.activePasser === "0" && state.activeReceiver !== "0") {
                  if (player.id === state.activeReceiver) {
                    let count: number = 0
                    for (const key in state.passMap) {
                      const [_, receiverId] = key.split("-") as [string, string]
                      if (receiverId === state.activeReceiver) {
                        count += state.passMap[key].passes.length
                      }
                    }
                    return [player.name, `Received ${count} passes from these players.`]
                  } else {
                    const count: number = state.passMap[`${player.id}-${state.activeReceiver}`]?.passes.length || 0
                    const activeReceiver: Player = state.arrayOfPlayers.find(player => player.id === state.activeReceiver)!
                    return [player.name, `Made ${count} passes to ${activeReceiver?.name}.`]
                  }
                }

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
      if (drawFieldAndPassesPlugin) {
        Chart.unregister(drawFieldAndPassesPlugin);
      }
      if (chartInstance) {
        chartInstance.destroy();
      }
    };
  }, [state.arrayOfPlayers, state.filteredPlayers, state.filteredPassMap])
  return (
    <Grid container spacing={2} alignItems="center" direction="column">
      <Grid item xs={12} container justifyContent="center">
        <Grid item xs={12} sm={6} md={4}>
          <SelectMatch currentMatch={currentMatch} matches={matches} handleChange={handleMatchChange} />
        </Grid>
      </Grid>
      <Grid item xs={12} container justifyContent="center" sx={{ paddingTop: "8px !important" }}>
        <Grid item xs={10} sm={8} md={8}>
          <Typography sx={{ lineHeight: "1.2", color: "#444444" }}>
            Showing the 11 most-used players from the selected timeframe. Players shown at their average position on passes made. Size of bubbles corresponds to number of passes made.
            <span style={{ fontStyle: "italic", fontWeight: 600, color: "#000000" }}>Select specific players at the bottom of screen.</span> Hover over bubbles for more information.
          </Typography>
        </Grid>
      </Grid>
      <Grid item sx={{ paddingTop: "0px !important" }}>
        <canvas id={id} width={canvasWidth} height={canvasHeight}></canvas>
      </Grid>
      <Grid item xs={12} container sx={{ paddingTop: "0 !important" }}>
        <Explanations lowAddedValueColor={lowAddedValueColor} highAddedValueColor={highAddedValueColor} />
      </Grid>
      <Grid item container justifyContent="center">
        <PlayerSelections arrayOfPlayers={state.arrayOfPlayers} state={state} handlePlayerSelectionChange={handlePlayerSelectionChange} />
      </Grid>
    </Grid>
  )
}
export default PassingVisualization;



function interpolateColor(value: number, min: number, max: number, color1: number[], color2: number[]): string {
  const [r1, g1, b1] = color1;
  const [r2, g2, b2] = color2;

  const ratio = (value - min) / (max - min);

  const r = Math.round(r1 + (r2 - r1) * ratio);
  const g = Math.round(g1 + (g2 - g1) * ratio);
  const b = Math.round(b1 + (b2 - b1) * ratio);

  return `rgb(${r}, ${g}, ${b})`;
}

