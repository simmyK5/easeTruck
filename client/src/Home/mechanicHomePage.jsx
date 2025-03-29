import React, { useEffect, useState } from 'react';
import {  Typography, Button,  Container, Select, MenuItem, FormControl, InputLabel, Grid } from '@mui/material';
import {useLocation } from 'react-router-dom';
import Ad from '../Ad/ad';
import axios from 'axios';
import { useAuth0 } from '@auth0/auth0-react';
import BreakDown from '../Dashboard/breakDown';
import TruckBreakDown from '../Dashboard/truckBreakDown';
import RecentBreakDown from '../recentActivity/recentBreakDown';



const MechanicHomePage = () => {
    const location = useLocation();
    const { currentUsername } = location.state || {};
    const { user} = useAuth0();
    const [period, setPeriod] = useState('today');
    const [userDetails, setUserDetails] = useState(null);



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

    return (
        <div className="main-container">

            <div className="content-container">
                <div className="left-section">
                    <Container className="welcome-section">
                        <Typography variant="h4">Welcome {currentUsername ? currentUsername : 'Guest'} to Streamlined Trucking</Typography>
                        <Typography variant="body1" paragraph>
                            This is the homepage of the Streamlined Trucking app. Here you can manage your fleet, track shipments, and more.
                        </Typography>
                        <Ad />
                    </Container>



                    <Container className="dashboard-section">
                        <Typography variant="h4" gutterBottom>Real-Time Dashboard</Typography>
                        <div className="dashboard-form">
                            <FormControl fullWidth data-testid="periodFormControl">
                                <InputLabel>Period</InputLabel>
                                <Select value={period} onChange={(e) => setPeriod(e.target.value)} data-testid="periodSelect">
                                    <MenuItem value="today" data-testid="periodToday">Today</MenuItem>
                                    <MenuItem value="week" data-testid="periodWeek">This Week</MenuItem>
                                    <MenuItem value="month" data-testid="periodMonth">This Month</MenuItem>
                                    <MenuItem value="4months" data-testid="periodFourMonth">Last 4 Months</MenuItem>
                                    <MenuItem value="year" data-testid="periodYear">This Year</MenuItem>
                                </Select>
                            </FormControl>
                            <Button variant="contained" color="primary" onClick={handleDownload} className="download-button" data-testid="downloadBtn">
                                Download Report
                            </Button>
                        </div>


                        {userDetails && period && (
                            <Grid container spacing={3} style={{ width: '100%' }}>
                                <Grid item xs={12} sm={12} md={12} style={{ height: 600 }}>
                                    <BreakDown userId={userDetails._id} period={period} />
                                </Grid>
                                <Grid item xs={12} sm={12} md={12} style={{ height: 600 }}>
                                    <TruckBreakDown userId={userDetails._id} period={period} />
                                </Grid>
                            </Grid>
                        )}
                    </Container>
                </div>

                <div className="right-section">
                    <Container>
                        {userDetails && <RecentBreakDown userId={userDetails._id} />}

                    </Container>
                </div>
            </div>
        </div>
    );
};

export default MechanicHomePage;


