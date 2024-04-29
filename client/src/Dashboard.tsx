import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { Link } from 'react-router-dom'
import { styled } from '@mui/material/styles';

const StyledLink = styled(Link)(({ theme }) => ({
  width: "100%",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  textDecoration: "none",
  paddingTop: "1rem",
  paddingBottom: "1rem",
  border: "2px solid #444444",
  borderRadius: 10,
  [theme.breakpoints.up('sm')]: {
    height: "100%"
  }
}));
const Dashboard: React.FC = () => {
  return (
    <Grid container justifyContent="space-around" alignItems="stretch" spacing={4} sx={{ paddingTop: "24px !important" }}>
      <Grid item xs={10} sm={5} >
        <StyledLink to="/passing" >
          <Typography align="center" sx={{ color: "#000000" }} variant="h4">Passing Visualizations</Typography>
        </StyledLink>
      </Grid>
      <Grid item xs={10} sm={5}>
        <StyledLink to="/leaders">
          <Typography align="center" sx={{ color: "#000000" }} variant="h4">Match Leaders</Typography>
        </StyledLink>
      </Grid>
    </Grid>
  )
}
export default Dashboard