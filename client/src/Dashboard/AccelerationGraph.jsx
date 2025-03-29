import React, { useEffect, useState,useCallback } from 'react';
import axios from 'axios';
import { Grid, Typography } from '@mui/material';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AccelerationGraph = ({ userId, period }) => {
  const [accelerationData, setAccelerationData] = useState(null);

  // Fetch acceleration data based on userId and period
  const fetchAcceleration = useCallback(async () => {
    try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/dashboard/acceleration`, {
            params: {
                userId: userId,
                period: period
            }
        });

        // Check if the response data is not empty or null
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
            setAccelerationData(response.data);
        } else {
            console.warn('No acceleration data found.');
            setAccelerationData([]); // Optionally set to an empty array or a default value
        }
    } catch (error) {
        console.error('Error fetching acceleration data:', error);
        setAccelerationData([]); // Optionally set to an empty array or a default value in case of error
    }
}, [userId, period]);


  useEffect(() => {
    if (userId && period) {
        console.log(userId)
        console.log(period)
      fetchAcceleration();
    }
  }, [userId, period,fetchAcceleration]);

  // Count the items in the data
  const countItems = (data) => {
    return Array.isArray(data) ? data.length : 0;
  };

  return (
    <Grid item xs={12} sm={6} md={12} style={{ height: 300 }}>
      {accelerationData ? (
        <>
          <Typography variant="h6" gutterBottom>
            Acceleration Data - Number of Data Points: {countItems(accelerationData)}
          </Typography>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={accelerationData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="speed" stroke="#8884d8" activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="steeringAngle" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        </>
      ) : (
        <>
        <Typography variant="h6" gutterBottom>
            Acceleration Data
          </Typography>
        <Typography variant="h8" gutterBottom>
          No data available
        </Typography>
        </>
        
      )}
    </Grid>
  );
};

export default AccelerationGraph;
