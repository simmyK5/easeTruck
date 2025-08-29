import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Button,
  Divider,
  Box,
  Backdrop,
  CircularProgress
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';
import Logo from './logo/logo';
import NavbarLogo from './logo/navbarLogo';

const Layout = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [userRole, setUserRole] = useState(null); // Set initial state to null
  const [loading, setLoading] = useState(true); // Loading state
  const navigate = useNavigate();
  const { user, isAuthenticated, getAccessTokenSilently, logout } = useAuth0();

  // Initialize user session and fetch role
  useEffect(() => {
    const initializeUserAndRole = async () => {
      setLoading(true);
      try {
        if (user?.email) {
          const email = user.email;
          const token = await getAccessTokenSilently();
          localStorage.setItem('user_email', email);
          const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/auth/user-role/${email}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUserRole(response.data.role);
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeUserAndRole();
  }, [user, isAuthenticated, getAccessTokenSilently]);

  const toggleDrawer = () => setOpen(!open);

  const handleNavigation = (page) => {

    if (page === 'logout') {
      logout();
    } else if (page === 'home') {
      navigate('/');
    } else {
      navigate(page);
      setOpen(false);
    }
  };

  {
    loading && (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 1300,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.5)', // semi-transparent background
          pointerEvents: 'auto', // blocks interaction with page
        }}
      >
        <CircularProgress color="primary" />
      </div>
    )
  }

  console.log("not mad", userRole)
  return (
    <div>
      <AppBar position="fixed">
        <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="menu" onClick={toggleDrawer}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Ease Truck
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Button color="inherit" onClick={() => logout()}>
              Logout
            </Button>
            <Logo />
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer anchor="left" open={open} onClose={toggleDrawer}>
        <List>
          <ListItem button onClick={() => handleNavigation('home')}>
            <ListItemText primary="Home" />
          </ListItem>
          <ListItem button onClick={() => handleNavigation('/aboutUs')}>
            <ListItemText primary="About Us" />
          </ListItem>
          <ListItem button onClick={() => handleNavigation('/howItWorks')}>
            <ListItemText primary="How It Works" />
          </ListItem>
          <ListItem button onClick={() => handleNavigation('/voucher')} data-testid="voucher">
            <ListItemText primary="voucher" />
          </ListItem>
          <Divider />

          {userRole === 'vehicleOwner' && (
            <>
              <ListItem button onClick={() => handleNavigation('/editProfile')} data-testid="editProfileButton" >
                <ListItemText primary="Profile" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/outstandingInstallation')} data-testid="outstanding Installation" >
                <ListItemText primary="Installation Payment" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/adDashboard')} data-testid="adDashboard">
                <ListItemText primary="Ad Dashboard" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/driverList')} data-testid="driverList">
                <ListItemText primary="Driver List" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/driverPool')} data-testid="driverPool">
                <ListItemText primary="Driver Pool" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/task')} data-testid="task">
                <ListItemText primary="Task" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/createAd')} data-testid="createAd">
                <ListItemText primary="Create Ad" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/adList')} data-testid="adList">
                <ListItemText primary="Ad List" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/installation')} data-testid="installation">
                <ListItemText primary="Installation" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/chat')} data-testid="chat">
                <ListItemText primary="chat" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/vehicleOwnerMap')} data-testid="vehicleOwnerMap">
                <ListItemText primary="VehicleOwner Map" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/mechanic')} data-testid="mechanic">
                <ListItemText primary="Mechanic" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/truck')} data-testid="truck">
                <ListItemText primary="Truck" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/dashboard')} data-testid="dashboard">
                <ListItemText primary="Dashboard" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/allNotifications')} data-testid="allNotifications">
                <ListItemText primary="Notifications" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/feedback')} data-testid="feedback">
                <ListItemText primary="Feedback" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/breakDownList')} data-testid="breakDownList">
                <ListItemText primary="BreakDown List" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/termAndCondtionContent')} data-testid="termAndCondtionContent">
                <ListItemText primary="Term And Condtion" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/allServiceSummary')} data-testid="allServiceSummary">
                <ListItemText primary="Service Summary" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/hijack')} data-testid="hijack">
                <ListItemText primary="Hijack" />
              </ListItem>
               <ListItem button onClick={() => handleNavigation('/highSpeed')} data-testid="High Speed">
                <ListItemText primary="High Speed" />
              </ListItem>
            </>
          )}

          {userRole === 'driver' && (
            <>

              <ListItem button onClick={() => handleNavigation('/editProfile')} data-testid="editProfile">
                <ListItemText primary="Profile" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/adDashboard')} data-testid="adDashboard">
                <ListItemText primary="Ad Dashboard" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/driveTask')} data-testid="driveTask">
                <ListItemText primary="Task" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/createAd')} data-testid="createAd">
                <ListItemText primary="Create Ad" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/adList')} data-testid="adList">
                <ListItemText primary="Ad List" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/installation')} data-testid="installation">
                <ListItemText primary="Installation" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/chat')} data-testid="chat">
                <ListItemText primary="chat" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/driverMap')} data-testid="driverMap">
                <ListItemText primary="Driver Map" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/dashboard')} data-testid="dashboard">
                <ListItemText primary="Dashboard" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/allNotifications')} data-testid="allNotifications">
                <ListItemText primary="Notifications" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/feedback')} data-testid="feedback">
                <ListItemText primary="Feedback" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/termAndCondtionContent')} data-testid="termAndCondtionContent">
                <ListItemText primary="Term And Condtion" />
              </ListItem>
            </>
          )}

          {userRole === 'adPublisher' && (
            <>

              <ListItem button onClick={() => handleNavigation('/editProfile')} data-testid="editProfile">
                <ListItemText primary="Profile" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/adDashboard')} data-testid="adDashboard">
                <ListItemText primary="Ad Dashboard" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/createAd')} data-testid="createAd">
                <ListItemText primary="Create Ad" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/adList')} data-testid="adList">
                <ListItemText primary="Ad List" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/feedback')} data-testid="feedback">
                <ListItemText primary="Feedback" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/termAndCondtionContent')} data-testid="termAndCondtionContent">
                <ListItemText primary="Term And Condtion" />
              </ListItem>
            </>
          )}

          {userRole === 'admin' && (
            <>
              <ListItem button onClick={() => handleNavigation('/editProfile')} data-testid="editProfile">
                <ListItemText primary="Profile" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/adminDashboard')} data-testid="adminDashboard">
                <ListItemText primary="Admin Dashboard" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/technician')} data-testid="technician">
                <ListItemText primary="Technician" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/adminAd')} data-testid="adminAd">
                <ListItemText primary="Admin Ad" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/adminList')} data-testid="adminList">
                <ListItemText primary="Admin List" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/admin')} data-testid="admin">
                <ListItemText primary="Admin" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/createAd')} data-testid="createAd">
                <ListItemText primary="Create Ad" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/adList')} data-testid="adList">
                <ListItemText primary="Ad List" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/adminInstallation')} data-testid="adminInstallation">
                <ListItemText primary="Admin Installation" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/technicianInstallation')} data-testid="technicianInstallation">
                <ListItemText primary="Technician Installation" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/breakDownList')} data-testid="breakDownList">
                <ListItemText primary="breakDownList" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/adminFeedback')} data-testid="adminFeedback">
                <ListItemText primary="Admin Feedback" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/termAndCondtionContent')} data-testid="termAndCondtionContent">
                <ListItemText primary="Term And Condtion" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/hijackAdmin')} data-testid="hijack admin">
                <ListItemText primary="Hijack Admin" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/adminLocation')} data-testid="Admin Location">
                <ListItemText primary="Admin Location" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/adminHighSpeed')} data-testid="Admin High Speed">
                <ListItemText primary="Admin High Speed" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/adminSupport')} data-testid="Admin Support">
                <ListItemText primary="Support" />
              </ListItem>
               <ListItem button onClick={() => handleNavigation('/leadInfo')} data-testid="Lead Info">
                <ListItemText primary="Lead Info" />
              </ListItem>
            </>
          )}
          {userRole === 'technician' && (
            <>
              <ListItem button onClick={() => handleNavigation('/editProfile')} data-testid="editProfile">
                <ListItemText primary="Profile" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/technicianInstallation')} data-testid="technicianInstallation">
                <ListItemText primary="Technician Installation" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/technician')} data-testid="technician">
                <ListItemText primary="Technician" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/adList')} data-testid="adList">
                <ListItemText primary="Ad List" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/admin')} data-testid="admin">
                <ListItemText primary="Admin" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/installation')} data-testid="installation">
                <ListItemText primary="Installation" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/feedback')} data-testid="feedback">
                <ListItemText primary="Feedback" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/termAndCondtionContent')} data-testid="termAndCondtionContent">
                <ListItemText primary="Term And Condtion" />
              </ListItem>
            </>
          )}

          {userRole === 'mechanic' && (
            <>
              <ListItem button onClick={() => handleNavigation('/editProfile')} data-testid="editProfile">
                <ListItemText primary="Profile" />
              </ListItem>

              <ListItem button onClick={() => handleNavigation('/adList')} data-testid="adList">
                <ListItemText primary="Ad List" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/feedback')} data-testid="feedback">
                <ListItemText primary="Feedback" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/breakDownList')} data-testid="breakDownList">
                <ListItemText primary="BreakDown" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/termAndCondtionContent')} data-testid="termAndCondtionContent">
                <ListItemText primary="Term And Condtion" />
              </ListItem>
            </>
          )}

          {userRole === 'superAdmin' && (
            <>
              <ListItem button onClick={() => handleNavigation('/editProfile')} data-testid="editProfileButton" >
                <ListItemText primary="Profile" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/outstandingInstallation')} data-testid="outstanding Installation" >
                <ListItemText primary="Installation Payment" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/adDashboard')} data-testid="adDashboard">
                <ListItemText primary="Ad Dashboard" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/driverList')} data-testid="driverList">
                <ListItemText primary="Driver List" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/driverPool')} data-testid="driverPool">
                <ListItemText primary="Driver Pool" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/task')} data-testid="task">
                <ListItemText primary="Task" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/createAd')} data-testid="createAd">
                <ListItemText primary="Create Ad" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/adList')} data-testid="adList">
                <ListItemText primary="Ad List" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/installation')} data-testid="installation">
                <ListItemText primary="Installation" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/chat')} data-testid="chat">
                <ListItemText primary="chat" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/vehicleOwnerMap')} data-testid="vehicleOwnerMap">
                <ListItemText primary="VehicleOwner Map" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/mechanic')} data-testid="mechanic">
                <ListItemText primary="Mechanic" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/truck')} data-testid="truck">
                <ListItemText primary="Truck" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/dashboard')} data-testid="dashboard">
                <ListItemText primary="Dashboard" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/allNotifications')} data-testid="allNotifications">
                <ListItemText primary="Notifications" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/feedback')} data-testid="feedback">
                <ListItemText primary="Feedback" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/termAndCondtionContent')} data-testid="termAndCondtionContent">
                <ListItemText primary="Term And Condtion" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/allServiceSummary')} data-testid="allServiceSummary">
                <ListItemText primary="Service Summary" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/driveTask')} data-testid="driveTask">
                <ListItemText primary="Task" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/driverMap')} data-testid="driverMap">
                <ListItemText primary="Driver Map" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/adminDashboard')} data-testid="adminDashboard">
                <ListItemText primary="Admin Dashboard" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/technician')} data-testid="technician">
                <ListItemText primary="Technician" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/adminAd')} data-testid="adminAd">
                <ListItemText primary="Admin Ad" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/adminList')} data-testid="adminList">
                <ListItemText primary="Admin List" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/admin')} data-testid="admin">
                <ListItemText primary="Admin" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/adminInstallation')} data-testid="adminInstallation">
                <ListItemText primary="Admin Installation" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/technicianInstallation')} data-testid="technicianInstallation">
                <ListItemText primary="Technician Installation" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/breakDownList')} data-testid="breakDownList">
                <ListItemText primary="breakDownList" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/adminFeedback')} data-testid="adminFeedback">
                <ListItemText primary="Admin Feedback" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/termAndCondtionContent')} data-testid="termAndCondtionContent">
                <ListItemText primary="Term And Condtion" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/technicianInstallation')} data-testid="technicianInstallation">
                <ListItemText primary="Technician Installation" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/technician')} data-testid="technician">
                <ListItemText primary="Technician" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/admin')} data-testid="admin">
                <ListItemText primary="Admin" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/mechanic')} data-testid="mechanic">
                <ListItemText primary="Mechanic" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/hijackAdmin')} data-testid="hijack admin">
                <ListItemText primary="Hijack Admin" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/adminLocation')} data-testid="Admin Location">
                <ListItemText primary="Admin Location" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/adminSupport')} data-testid="Admin Support">
                <ListItemText primary="Support" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/leadInfo')} data-testid="Lead Info">
                <ListItemText primary="Lead Info" />
              </ListItem>
            </>
          )}
          {/* Add more roles as needed */}
          <ListItem button onClick={() => handleNavigation('logout')}>
            <ListItemText primary="Logout" />
          </ListItem>
        </List>
        <NavbarLogo style={{ alignSelf: 'flex-end' }} />
      </Drawer>

      <main style={{ marginTop: '64px' }}>{children}</main>
    </div>
  );
};

export default Layout;
