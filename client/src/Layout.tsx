import React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import { Link, useLocation } from 'react-router-dom'
import { LayoutProps } from './types'
import clsx from 'clsx';
import { makeStyles } from '@mui/styles'
const useStyles = makeStyles({
  link: {
    color: "white",
    marginLeft: "0.8rem",
    textDecoration: "none"
  },
  activeLink: {
    fontWeight: 700
  },
  appBar: {
    backgroundColor: "#000000 !important"
  }
})
const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const classes = useStyles();
  return (
    <div >
      <Box sx={{ flexGrow: 1 }} >
        <AppBar position="static" className={classes.appBar}>
          <Toolbar sx={{
            justifyContent: "space-between"
          }}>
            <div>
              <Link to="/" className={classes.link}>
                <img id="logo" src="https://www.cdcastellon.com/wp-content/uploads/2018/09/logoHeader.png" />
              </Link>
            </div>
            <div>
              <Link to="/passing" className={clsx(classes.link, location.pathname === "/passing" && classes.activeLink)}>Passing</Link>
              <Link to="/leaders" className={clsx(classes.link, location.pathname === "/leaders" && classes.activeLink)}>Leaders</Link>
            </div>
          </Toolbar>
        </AppBar>
      </Box>
      <div>
        {children}
      </div>
    </div>
  );
}

export default Layout