import React, { useState, useEffect } from 'react';
import { Container, Typography, Button, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import axios from 'axios';
import { useAuth0 } from '@auth0/auth0-react';
import AccelerationGraph from './AccelerationGraph';
import FuelGraph from './fuelGraph';
import IdleTimeGraph from './idleTimeGraph';
import SteeringGraph from './steeringGraph';
import ServiceDueGraph from './serviceDueGraph';
import TireServiceGraph from './tireServiceGraph';
import TruckNumGraph from './truckNumGraph';
import BrakeGraph from './brakeGraph';
import TaskGraph from './taskGraph';
import VoucherGraph from './voucherGraph';
import LoadNumGraph from './loadNumGraph';
import OverLoadGraph from './overLoadGraph';
import './dashboard.css'

const Dashboard = () => {
  const { user } = useAuth0();
  const [userDetails, setUserDetails] = useState(null);
  const [period, setPeriod] = useState('today');

  useEffect(() => {
    if (user?.email) {
      fetchUserDetails(user.email);
    }
  }, [user?.email]);

  const fetchUserDetails = async (email) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/user/users/${email}`);
      setUserDetails(response.data);
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  const handleDownload = () => {
    // Implement download logic here
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
            <MenuItem value="month" data-testid="periodWeek">This Month</MenuItem>
            <MenuItem value="4months" data-testid="periodFourMonth">Last 4 Months</MenuItem>
            <MenuItem value="year" data-testid="periodYear">This Year</MenuItem>
          </Select>
        </FormControl>

        <Button variant="contained" color="primary" onClick={handleDownload} style={{ marginTop: 16 }}  data-testid="reportButton">
          Download Report
        </Button>
      </div>

      {userDetails && period && (
        <div className="graph-container">
          <div className="graph-item">
            <AccelerationGraph userId={userDetails._id} period={period} />
          </div>
          <div className="graph-item">
            <FuelGraph userId={userDetails._id} period={period} />
          </div>
          <div className="graph-item">
            <IdleTimeGraph userId={userDetails._id} period={period} />
          </div>
          <div className="graph-item">
            <BrakeGraph userId={userDetails._id} period={period} />
          </div>
          <div className="graph-item">
            <SteeringGraph userId={userDetails._id} period={period} />
          </div>
          <div className="graph-item">
            <LoadNumGraph userId={userDetails._id} period={period} />
          </div>
          <div className="graph-item">
            <OverLoadGraph userId={userDetails._id} period={period} />
          </div>
          <div className="graph-item">
            <ServiceDueGraph userId={userDetails._id} period={period} />
          </div>
          <div className="graph-item">
            <TireServiceGraph userId={userDetails._id} period={period} />
          </div>
          <div className="graph-item">
            <TruckNumGraph userId={userDetails._id} period={period} />
          </div>
          <div className="graph-item">
            <TaskGraph userId={userDetails._id} period={period} />
          </div>
          
          <div className="graph-item">
            <VoucherGraph userId={userDetails._id} period={period} />
          </div>
          
        </div>
      )}
    </Container>
  );
};

export default Dashboard;
