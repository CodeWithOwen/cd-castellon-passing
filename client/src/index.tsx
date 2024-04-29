import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { createTheme, ThemeProvider } from '@mui/material';

const theme = createTheme({
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#000000',
          },
        },
        notchedOutline: {
          borderColor: '#000000',
          '&:hover': {
            borderColor: '#000000',
          }
        }
      }
    }
  }
});

ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
