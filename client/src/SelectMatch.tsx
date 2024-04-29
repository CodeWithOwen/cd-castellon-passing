import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormHelperText from '@mui/material/FormHelperText';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { SelectMatchProps } from "./types"

const SelectMatch: React.FC<SelectMatchProps> = ({ matches, currentMatch, handleChange }) => {
  return (
    <Grid item xs={12} container justifyContent="center">
      <Grid item xs={12} >
        <FormControl sx={{ width: "100%" }}>
          <InputLabel id="match-select-label" sx={{
            color: "#000000",
            '.Mui-focused &': {
              color: '#000000 !important',
            }
          }}>
            Match
          </InputLabel>
          <Select
            id="match-select"
            value={currentMatch}
            label="Match"
            onChange={(e: any) => {
              handleChange(e)
            }}
          >
            {[...matches, { id: "0", away_team_name: "", home_team_name: "", human_readable_date: "" }].map(match => {
              const label: string = match.id === "0" ? `View all matches` : `${match.away_team_name} at ${match.home_team_name} on ${match.human_readable_date}`
              return <MenuItem key={label} value={match.id}>{label}</MenuItem>
            })}
          </Select>
          <FormHelperText>Choose a match</FormHelperText>
        </FormControl>
      </Grid>
    </Grid>

  )


}

export default SelectMatch