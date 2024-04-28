import './App.css';
import Grid from '@mui/material/Grid';
import { useEffect, useState } from 'react';
import PassingVisualization from './PassingVisualization';
import Layout from './Layout';
import Dashboard from './Dashboard';
import { makeStyles } from '@mui/styles'
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";
import { Match } from './types';
export const useStyles = makeStyles({
  formControl: {
    width: "100%"
  },
});
const App: React.FC = () => {
  const classes = useStyles();
  const [matches, setMatches] = useState<Match[]>([])
  // const handleChange = (event: React.ChangeEvent<{ name?: string; value: string }>) => {
  //   setCurrentMatch(event.target.value);
  // }
  useEffect(() => {
    fetch("/matches").then((res) => res.json()).then((data) => {
      setMatches(data)
    })
  }, [])

  return (
    <Router>
      <Layout>
        <Grid container sx={{
          paddingTop: (theme) => theme.spacing(4),
        }}>
          <Grid item xs={12}>
            <Switch>
              <Route exact path="/">
                <Dashboard />
              </Route>
              <Route exact path="/passing">
                <PassingVisualization matches={matches} />
              </Route>
            </Switch>
          </Grid>
        </Grid>
      </Layout>

    </Router>
  );
};
export default App;