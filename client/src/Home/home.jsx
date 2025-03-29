import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Drawer, List, ListItem, ListItemText, Button, Divider } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate } from 'react-router-dom';
import Ad from '../Ad/ad';

const HomePage = () => {
  const [open, setOpen] = useState(false); // State for drawer (sidebar) toggle
  const navigate = useNavigate();

  // Toggle the drawer
  const toggleDrawer = () => {
    setOpen(!open);
  };

  // Navigate to different pages based on menu selection
  const handleNavigation = (page) => {
    navigate(page);
    setOpen(false); // Close the drawer after navigation
  };

  return (
    <div>
      {/* AppBar - Top Menu */}
      <AppBar position="fixed">
        <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="menu" onClick={toggleDrawer}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Dealut Streamlined Trucking
          </Typography>
          <Button color="inherit" onClick={() => handleNavigation('/editProfile')}>Profile</Button>
        </Toolbar>
      </AppBar>

      {/* Drawer - Side Menu */}
      <Drawer anchor="left" open={open} onClose={toggleDrawer}>
        <div role="presentation" onClick={toggleDrawer} onKeyDown={toggleDrawer} style={{ width: 250 }}>
          <List>
            <ListItem button onClick={() => handleNavigation('/home')}>
              <ListItemText primary="Home" />
            </ListItem>
            <Divider />
            
            <ListItem button onClick={() => handleNavigation('/installation')}>
              <ListItemText primary="Installation" />
            </ListItem>
            
          </List>
        </div>
      </Drawer>

      {/* Main Content Area */}
      <div style={{ marginTop: '64px', padding: '20px' }}>
        <Typography variant="h4">Welcome to Streamlined Trucking</Typography>
        <Typography variant="body1" paragraph>
          This is the homepage of the Streamlined Trucking app. Here you can manage your fleet, track shipments, and more.
        </Typography>
       <Ad/>
      </div>
    </div>
  );
};

export default HomePage;
