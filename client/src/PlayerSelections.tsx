import Grid from '@mui/material/Grid';
import { PlayerSelectionsProps, AllowablePasserKeys } from "./types"
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormHelperText from '@mui/material/FormHelperText';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { PassingVisualizationState, PlayerSelectionObject } from './types'

const playerSelectionObjects: PlayerSelectionObject[] = [
  {
    name: "activePasser",
    label: "Passer",
    helperText: "Choose a passer"
  },
  {
    name: "activeReceiver",
    label: "Receiver",
    helperText: "Choose a receiver"
  }
]
const PlayerSelections: React.FC<PlayerSelectionsProps> = ({ arrayOfPlayers, state, handlePlayerSelectionChange }) => {
  return (
    <Grid item xs={12} sm={10} md={8} container justifyContent="space-around">
      {playerSelectionObjects.map((playerSelectionObject: PlayerSelectionObject) => {
        return (
          <Grid item xs={5} key={playerSelectionObject.name}>
            <FormControl sx={{ width: "100%" }}>
              <InputLabel>{playerSelectionObject.label}</InputLabel>
              <Select
                value={state[playerSelectionObject.name as keyof PassingVisualizationState]}
                label={playerSelectionObject.label}
                onChange={(e: any) => handlePlayerSelectionChange(e, playerSelectionObject.name as AllowablePasserKeys)}
              >
                {[{ id: "0", name: "View all players" }, ...arrayOfPlayers].map(player => {
                  const label: string = player.id === null ? `View all players` : `${player.name}`
                  const disabled: boolean = (player.id !== "0" && (player.id === state.activePasser || player.id === state.activeReceiver)) ? true : false
                  return <MenuItem key={label} value={player.id} disabled={disabled}>{label}</MenuItem>
                })}
              </Select>
              <FormHelperText>{playerSelectionObject.helperText}</FormHelperText>
            </FormControl>
          </Grid>
        )
      })}
    </Grid>
  )
}
export default PlayerSelections;