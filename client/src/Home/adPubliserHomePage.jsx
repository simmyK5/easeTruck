import React, { useEffect, useState } from 'react';
import {  Typography,  Button,  Box,Container, Select, MenuItem, FormControl, InputLabel, Grid } from '@mui/material'
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth0 } from '@auth0/auth0-react';
import AccelerationGraph from '../Dashboard/AccelerationGraph';
import FuelGraph from '../Dashboard/fuelGraph';
import IdleTimeGraph from '../Dashboard/idleTimeGraph';
import LoadNumGraph from '../Dashboard/loadNumGraph';
import RecentActivity from '../recentActivity/recentActivity';
import ServiceCalender from '../recentActivity/serviceCalender';
import NotificationAlert from '../notification/notificationAlert';
import Ad from '../Ad/ad';
import AdDashboard from '../Dashboard/adDashboard';



const AdPublisherHomePage = () => {
    const location = useLocation();
    const { currentUsername } = location.state || {};
    const { user, isAuthenticated } = useAuth0();
    const [period, setPeriod] = useState('today');
    const [userDetails, setUserDetails] = useState(null);
    const navigate = useNavigate();



    useEffect(() => {
        console.log("what's happening")
        console.log(user)
        if (user?.email) {
            console.log(user.email)
            fetchUserDetails(user.email);
        }
    }, [user]);

    const fetchUserDetails = async (email) => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/user/users/${email}`);
            console.log(response.data)
            setUserDetails(response.data);
        } catch (error) {
            console.error('Error fetching user details:', error);
        }
    };
    const handleDownload = () => {
        // Implement your download logic here
    };
    const goToNotifications = () => {
        console.log(isAuthenticated)
        if (isAuthenticated) {
           // navigate("/allNotifications", userDetails.id); // Navigate to the notifications page
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
                        <Typography variant="h4">Welcome {currentUsername ? currentUsername : 'Guest'} to Streamlined Trucking</Typography>
                        <Typography variant="body1" paragraph>
                            This is the homepage of the Streamlined Trucking app. Here you can manage your fleet, track shipments, and more.
                        </Typography>
                        <Ad/>
                    </Container>

                    <Container className="dashboard-section">
                        <Typography variant="h4" gutterBottom>Real-Time Dashboard</Typography>

                        {userDetails && (
                            <Grid container spacing={3} style={{ width: '100%' }}>
                                <Grid item xs={12} sm={12} md={12} style={{ height: 600 }}>
                                    <AdDashboard userId={userDetails._id} userRole={userDetails.userRole}/>
                                </Grid>
                                
                            </Grid>
                        )}
                    </Container>
                </Box>

                <Box className="right-section">
                    <Container className="notification-section">
                        {userDetails && <NotificationAlert userId={userDetails._id} />}
                        <Button onClick={goToNotifications} variant="contained" color="primary" data-testid="downloadBtn">
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

export default AdPublisherHomePage;

