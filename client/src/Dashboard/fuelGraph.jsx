import React, { useEffect, useState ,useCallback} from 'react';
import axios from 'axios';
import { Grid, Typography } from '@mui/material';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const FuelGraph = ({ userId, period,userRole }) => {
  const [fuelData, setFuelData] = useState(null);

  // Fetch fuel data based on userId and period
  const fetchFuel = useCallback(async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/dashboard/fuel`, {
        params: {
          userId: userId,
          period: period
        }
      });
      setFuelData(response.data);
    } catch (error) {
      console.error('Error fetching fuel data:', error);
    }
  }, [userId, period]);

  useEffect(() => {
    if (userId && period) {
      console.log(userId)
      console.log(period)
      fetchFuel();
    }
  }, [userId, period,fetchFuel]);

  // Count the items in the data
  const countItems = (data) => {
    return Array.isArray(data) ? data.length : 0;
  };

  return (
    <Grid item xs={12} sm={6} md={12} style={{ height: 300 }}> {/* Fixed height */} 
      {fuelData ? (
        <>
          <Typography variant="h6" gutterBottom>
            Fuel Data - Number of Data Points: {countItems(fuelData)}
          </Typography>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={fuelData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="fuelLiters" stroke="#8884d8" activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="steeringAngle" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        </>
      ) : (
        <>
          <Typography variant="h6" gutterBottom>
            Fuel Data
          </Typography>
          <Typography variant="h8" gutterBottom>
            No data available
          </Typography>
        </>
      )}
    </Grid>
  );
};


export default FuelGraph;
