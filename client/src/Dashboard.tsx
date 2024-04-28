import Grid from '@mui/material/Grid'
import { Link } from 'react-router-dom'
import { makeStyles } from '@mui/styles'

const useStyles = makeStyles({
  link: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    textDecoration: "none",
    paddingTop: "2rem",
    paddingBottom: "2rem",
    border: "2px solid #444444",
    borderRadius: 10,
    fontSize: "3rem",
    color: "#000000"
  },
  linkWrapper: {
    marginTop: "4rem !important"
  }
})
const Dashboard: React.FC = () => {
  const classes = useStyles();
  return (
    <Grid container justifyContent="space-around">
      <Grid item xs={4} className={classes.linkWrapper}>
        <Link to="/passing" className={classes.link}>Passing</Link>
      </Grid>
      <Grid item xs={4} className={classes.linkWrapper}>
        <Link to="/leaders" className={classes.link}>Leaders</Link>
      </Grid>
    </Grid>
  )
}
export default Dashboard