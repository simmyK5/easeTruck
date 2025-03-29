import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Container, Typography, Grid, Button, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import AccelerationGraph from '../Dashboard/AccelerationGraph';
import FuelGraph from '../Dashboard/fuelGraph';
import IdleTimeGraph from '../Dashboard/idleTimeGraph';
import NotificationAlert from '../notification/notificationAlert';
import ServiceCalender from '../recentActivity/serviceCalender';
import RecentActivity from '../recentActivity/recentActivity';
import './vehicleOwnerHomePage.css';
import OverLoadGraph from '../Dashboard/overLoadGraph';

const VehicleOwnerHomePage = () => {
  const {  user, isAuthenticated } = useAuth0();
  const [userDetails, setUserDetails] = useState(null);
  const [period, setPeriod] = useState('today');
  const navigate = useNavigate();
  const location = useLocation();
  const currentUsername = location.state?.currentUsername || 'Guest';

  useEffect(() => {
    // Check if data is already fetched from sessionStorage
    if (!sessionStorage.getItem('userDetailsFetched') && isAuthenticated && user?.email) {
      fetchUserDetails(user.email);
    } else {
      setUserDetails(JSON.parse(sessionStorage.getItem('userDetails'))); // Load from sessionStorage if already fetched
    }
  }, [isAuthenticated, user?.email]);

  const fetchUserDetails = async (email) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/user/users/${email}`);
      setUserDetails(response.data);

      // Store user details in sessionStorage to avoid re-fetching on future visits
      sessionStorage.setItem('userDetails', JSON.stringify(response.data));
      sessionStorage.setItem('userDetailsFetched', 'true');
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  const handleDownload = () => {
    // Implement your download logic here
  };

  const goToNotifications = () => {
    if (isAuthenticated && userDetails) {
      navigate('/allNotifications', { state: { userId: userDetails._id } });
    } else {
      navigate("/"); // Redirect to home if not authenticated
    }
  };

  return (
    <div className="main-container">
      <div className="content-container">
        <Box className="left-section">
          <Container className="welcome-section">
            <Typography variant="h4">Welcome {currentUsername} to Streamlined Trucking</Typography>
            <Typography variant="body1" paragraph>
              This is the homepage of the Streamlined Trucking app. Here you can manage your fleet, track shipments, and more.
            </Typography>
          </Container>

          <Container className="dashboard-section">
            <Typography variant="h4" gutterBottom>Real-Time Dashboard</Typography>
            <Box className="dashboard-form">
              <FormControl fullWidth data-testid="periodFormControl">
                <InputLabel>Period</InputLabel>
                <Select value={period} onChange={(e) => setPeriod(e.target.value)}  label="period" data-testid="periodSelect">
                  <MenuItem value="today" data-testid="Today">Today</MenuItem>
                  <MenuItem value="week" data-testid="This Week">This Week</MenuItem>
                  <MenuItem value="month" data-testid="This Month">This Month</MenuItem>
                  <MenuItem value="4months" data-testid="Last 4 Months">Last 4 Months</MenuItem>
                  <MenuItem value="year" data-testid="This Year">This Year</MenuItem>
                </Select>
              </FormControl>
              <Button variant="contained" color="primary" onClick={handleDownload} className="download-button" data-testid="downloadBtn">
                Download Report
              </Button>
            </Box>

            {userDetails && period && (
              <Grid container spacing={3} style={{ width: '100%' }}>
                <Grid item xs={12} sm={12} md={12} style={{ height: 600 }}>
                  <AccelerationGraph userId={userDetails._id} period={period} />
                </Grid>
                <Grid item xs={12} sm={12} md={12} style={{ height: 600 }}>
                  <FuelGraph userId={userDetails._id} period={period} />
                </Grid>
                <Grid item xs={12} sm={12} md={12} style={{ height: 600 }}>
                  <IdleTimeGraph userId={userDetails._id} period={period} />
                </Grid>
                <Grid item xs={12} sm={12} md={12} style={{ height: 600 }}>
                  <OverLoadGraph userId={userDetails._id} period={period} />
                </Grid>
              </Grid>
            )}
          </Container>
        </Box>

        <Box className="right-section">
          <Container className="notification-section">
            {userDetails && <NotificationAlert userId={userDetails._id} />}
            <Button onClick={goToNotifications} variant="contained" color="primary" data-testid="notificationBtn">
              Go to Notifications
            </Button>
          </Container>
          <Container>
            {userDetails && <ServiceCalender userId={userDetails._id} />}
            {userDetails && <RecentActivity userId={userDetails._id} />}
          </Container>
        </Box>
      </div>
    </div>
  );
};

export default VehicleOwnerHomePage;
