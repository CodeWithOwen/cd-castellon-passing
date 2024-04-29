import './App.css';
import Grid from '@mui/material/Grid';
import { useEffect, useState } from 'react';
import PassingVisualization from './PassingVisualization';
import Layout from './Layout';
import Dashboard from './Dashboard';
import Leaders from "./Leaders"
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";
import { Match } from './types';
const App: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([])
  useEffect(() => {
    fetch("api/matches").then((res) => res.json()).then((data) => {
      setMatches(data)
    })
  }, [])

  return (
    <Router>
      <Layout>
        <Grid container sx={{
          paddingTop: (theme) => theme.spacing(3),
        }}>
          <Grid item xs={12}>
            <Switch>
              <Route exact path="/">
                <Dashboard />
              </Route>
              <Route exact path="/passing">
                <PassingVisualization matches={matches} />
              </Route>
              <Route exact path="/leaders">
                <Leaders matches={matches} />
              </Route>
            </Switch>
          </Grid>
        </Grid>
      </Layout>
    </Router>
  );
};
export default App;