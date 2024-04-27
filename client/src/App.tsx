import './App.css';
import Grid from '@mui/material/Grid';
import { useEffect, useState } from 'react';
import PassingVisualization from './PassingVisualization';
const App: React.FC = () => {
  return (
    <Grid container>
      <Grid item xs={12}>
        <PassingVisualization />
      </Grid>
    </Grid>
  );
};
export default App;