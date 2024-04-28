import Grid from '@mui/material/Grid';
import { PlayerSelectionsProps } from "./types"
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormHelperText from '@mui/material/FormHelperText';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { PassingVisualizationState } from './types'

import { useStyles } from './App'

const playerSelectionObjects = [
  {
    name: "activePasser",
    label: "Passer",
    helerText: "Choose a passer"

  },
  {
    name: "activeReceiver",
    label: "Receiver",
    helerText: "Choose a receiver"
  }
]
const PlayerSelections: React.FC<PlayerSelectionsProps> = ({ arrayOfPlayers, state }) => {
  const classes = useStyles()
  return (
    <Grid item xs={12} sm={8} md={6} container justifyContent="space-around">
      {playerSelectionObjects.map(playerSelectionObject => {
        return (
          <Grid item xs={5} key={playerSelectionObject.name}>
            <FormControl className={classes.formControl}>
              <InputLabel>{playerSelectionObject.label}</InputLabel>
              <Select
                value={state[playerSelectionObject.name as keyof PassingVisualizationState]}
                label={playerSelectionObject.label}
                onChange={(e: any) => {
                  // handleChange(e)
                  console.log(typeof e.target.value)

                }}
              >
                {[{ id: "0", name: "View all players" }, ...arrayOfPlayers].map(player => {
                  let label = player.id === null ? `View all players` : `${player.name}`
                  return <MenuItem key={label} value={player.id}>{label}</MenuItem>
                })}
              </Select>
              <FormHelperText>{playerSelectionObject.helerText}</FormHelperText>
            </FormControl>



          </Grid>
        )
      })}
    </Grid>
  )
}
export default PlayerSelections;