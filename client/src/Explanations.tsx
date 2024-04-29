import { ExplanationsProps } from './types'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

const typographyStyles = {
  letterSpacing: "0.0rem",
  fontSize: "0.60rem",
}
const Explanations: React.FC<ExplanationsProps> = ({ lowAddedValueColor, highAddedValueColor }) => {
  return (
    <Grid container justifyContent="center" >
      <Grid item xs={8} sm={4} container direction="column">
        <Grid item
          style={{
            width: "100%",
            height: "30px",
            background: `linear-gradient(to right, rgb(${lowAddedValueColor[0]}, ${lowAddedValueColor[1]}, ${lowAddedValueColor[2]}), rgb(${highAddedValueColor[0]}, ${highAddedValueColor[1]}, ${highAddedValueColor[2]})`
          }}
        >
        </Grid>
        <Grid item sx={{ width: "100%" }} container justifyContent="space-between">
          <Grid item>
            <Typography variant="overline" sx={typographyStyles}>
              Lower Added Value
            </Typography>
          </Grid>
          <Grid item>
            <Typography variant="overline" sx={typographyStyles}>
              Higher Added Value
            </Typography>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default Explanations