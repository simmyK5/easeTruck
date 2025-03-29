import React, { useState, useEffect } from 'react';
import { Container, Typography, CircularProgress, Button, Select, MenuItem, FormControl, InputLabel, Grid, Card, CardContent } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Bar, BarChart } from 'recharts';
import axios from 'axios';
import { useAuth0 } from '@auth0/auth0-react';
import TechnicianTotalInstallations from './technicianTotalInstallations';
import TechnicianInstallationProvince from './technicianInstallationProvince';
import TechnicianInstallationType from './technicianInstallationType';
import { useAuth0 } from '@auth0/auth0-react';
import './technicianDashboard.css'

const TechnicianDashboard = () => {
    const { user, isAuthenticated, isLoading } = useAuth0();
    const [totalInstallation, setTotalInstallationData] = useState(null);
    const [period, setPeriod] = useState('today');

    const [userDetails, setUserDetails] = useState(null);

    useEffect(() => {
      if (user?.email) {
        fetchUserDetails(user.email);
      }
    }, [user.email]);
  
    const fetchUserDetails = async (email) => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/user/users/${email}`);
        setUserDetails(response.data);
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };

    const handleDownload = () => {
        // Implement your download logic here
    };




    return (
        <Container className="container">
            <div className="dashboard-header">
                <Typography variant="h4" gutterBottom>Real-Time Dashboard</Typography>
            </div>

            <div className="dashboard-form">
                <FormControl fullWidth data-testid="periodFormControl">
                    <InputLabel>Period</InputLabel>
                    <Select value={period} onChange={(e) => setPeriod(e.target.value)} data-testid="period">
                        <MenuItem value="today" data-testid="periodToday">Today</MenuItem>
                        <MenuItem value="week" data-testid="periodWeek">This Week</MenuItem>
                        <MenuItem value="month" data-testid="periodMonth">This Month</MenuItem>
                        <MenuItem value="4months" data-testid="periodFourMonth">Last 4 Months</MenuItem>
                        <MenuItem value="year" data-testid="periodFourMonth">This Year</MenuItem>
                    </Select>
                </FormControl>
                <Button variant="contained" color="primary" onClick={handleDownload} style={{ marginTop: 16 }} data-testid="reportButton">
                    Download Report
                </Button>
            </div>

            { period && (
                <div className="graph-container">
                     <div className="graph-item">
                        <TechnicianTotalInstallations period={period} userId={userDetails._id}/>
                    </div>
                    <div className="graph-item">
                        <TechnicianInstallationProvince period={period} userId={userDetails._id}/>
                    </div>
                    <div className="graph-item">
                        <TechnicianInstallationType period={period} userId={userDetails._id}/>
                    </div>
                    
                </div>

            )}

        </Container>
    );
};

export default TechnicianDashboard;

