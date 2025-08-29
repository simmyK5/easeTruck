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
import HighSpeed from '../HighSpeed/highSpeed';
import SecurityAlertGraph from './securityAlertGraph';

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

      {userDetails && (
        <div className="graph-container">
          <div className="graph-item">
            <HighSpeed userId={userDetails._id} userRole={userDetails.userRole} />
          </div>
          <div className="graph-item">
            <AccelerationGraph userId={userDetails._id} userRole={userDetails.userRole} />
          </div>
          <div className="graph-item">
            <IdleTimeGraph userId={userDetails._id} userRole={userDetails.userRole} />
          </div>
          <div className="graph-item">
            <BrakeGraph userId={userDetails._id} userRole={userDetails.userRole} />
          </div>
          <div className="graph-item">
            <SteeringGraph userId={userDetails._id} userRole={userDetails.userRole} />
          </div>
           <div className="graph-item">
            <SecurityAlertGraph userId={userDetails._id} userRole={userDetails.userRole} />
          </div>
          <div className="graph-item">
            <LoadNumGraph userId={userDetails._id} userRole={userDetails.userRole} />
          </div>
          <div className="graph-item">
            <ServiceDueGraph userId={userDetails._id} userRole={userDetails.userRole} />
          </div>
          <div className="graph-item">
            <TruckNumGraph userId={userDetails._id} userRole={userDetails.userRole} />
          </div>
          <div className="graph-item">
            <TaskGraph userId={userDetails._id} userRole={userDetails.userRole} />
          </div>

          <div className="graph-item">
            <VoucherGraph userId={userDetails._id} userRole={userDetails.userRole} />
          </div>

        </div>
      )}
    </Container>
  );
};

export default Dashboard;
