import React, { useState, useEffect } from 'react';
import { Container, Typography, Button, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import axios from 'axios';
import { useAuth0 } from '@auth0/auth0-react';
import AllAds from './allAds';
import AdCost from './adCost';
import ActiveAd from './activeAd';
import './adDashboard.css'


const AdDashboard = () => {
  const { user } = useAuth0();
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


  return (
    <Container className="container">
      <div className="dashboard-header">
        <Typography variant="h4" gutterBottom>Real-Time Dashboard</Typography>
      </div>

      {userDetails && (
        <div className="graph-container">
          <div className="graph-item">
            <AllAds userEmail={userDetails.email} userRole={userDetails.userRole} />
          </div>
          <div className="graph-item">
            <ActiveAd userEmail={userDetails.email} userRole={userDetails.userRole} />
          </div>

        </div>
      )}
    </Container>
  );
};

export default AdDashboard;
