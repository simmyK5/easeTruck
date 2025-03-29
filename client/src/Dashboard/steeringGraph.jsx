import React, { useEffect, useState,useCallback } from 'react';
import axios from 'axios';
import { Grid, Typography } from '@mui/material';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const SteeringGraph = ({ userId, period }) => {
    const [steeringData, setSteeringData] = useState(null);

    // Fetch acceleration data based on userId and period
    const fetchSteering = useCallback(async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/dashboard/steering`, {
                params: {
                    userId: userId,
                    period: period
                }
            });
            setSteeringData(response.data);
        } catch (error) {
            console.error('Error fetching turning data:', error);
        }
    }, [userId,period]);

    useEffect(() => {
        if (userId && period) {
            console.log(userId)
            console.log(period)
            fetchSteering();
        }
    }, [userId, period,fetchSteering]);

    // Count the items in the data
    const countItems = (data) => {
        return Array.isArray(data) ? data.length : 0;
    };


    return (
        <Grid item xs={12} sm={6} md={3}>
            {steeringData ? (
                <>
                    <Typography variant="h6" gutterBottom>
                        Turning Data - Number of Data Points: {countItems(steeringData)}
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={steeringData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="timestamp" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="steeringAngle" stroke="#8884d8" />
                        </LineChart>
                    </ResponsiveContainer>
                </>
            ) : (
                <>
                <Typography variant="h6" gutterBottom>
                    Steering Data
                  </Typography>
                <Typography variant="h8" gutterBottom>
                  No data available
                </Typography>
                </>
            )}
        </Grid>
    );
};

export default SteeringGraph;
