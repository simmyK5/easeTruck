import React, { useEffect, useState ,useCallback} from 'react';
import axios from 'axios';
import { Grid, Typography } from '@mui/material';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const OverLoadGraph = ({ userId, period }) => {
  const [overLoadData, setOverLoadData] = useState(null);

  // Fetch acceleration data based on userId and period
  const fetchOverload =useCallback( async () => {

    try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/dashboard/overLoad`, {
            params: {
                userId: userId,
                period: period
            }
        });

        console.log(response.data)

        // Check if the response data is not empty or null
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
            setOverLoadData(response.data);
        } else {
            console.warn('No overload data found.');
            setOverLoadData([]); // Optionally set to an empty array or a default value
        }
    } catch (error) {
        console.error('Error fetching acceleration data:', error);
        setOverLoadData([]); // Optionally set to an empty array or a default value in case of error
    }
}, [userId,period]);


  useEffect(() => {
    if (userId && period) {
        console.log(userId)
        console.log(period)
        fetchOverload();
    }
  }, [userId, period,fetchOverload]);

  // Count the items in the data
  const countItems = (data) => {
    return Array.isArray(data) ? data.length : 0;
  };
  console.log(overLoadData)

  return (
    <Grid item xs={12} sm={6} md={12}>
      {overLoadData ? (
        <>
          <Typography variant="h6" gutterBottom>
          Overload Data - Number of Data Points: {countItems(overLoadData)}
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={overLoadData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="loadCapacity" stroke="#8884d8" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </>
      ) : (
        <>
        <Typography variant="h6" gutterBottom>
            Overload Data
          </Typography>
        <Typography variant="h8" gutterBottom>
          No data available
        </Typography>
        </>
        
      )}
    </Grid>
  );
};

export default OverLoadGraph;
