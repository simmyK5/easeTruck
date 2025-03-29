import React, { useEffect, useState,useCallback } from 'react';
import axios from 'axios';
import { Grid, Typography } from '@mui/material';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const BrakeGraph = ({ userId, period }) => {
    const [brakeData, setBrakeData] = useState(null);

    // Fetch braking data based on userId and period
    const fetchBraking =useCallback( async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/dashboard/braking`, {
                params: {
                    userId: userId,
                    period: period
                }
            });
            setBrakeData(response.data);
        } catch (error) {
            console.error('Error fetching turning data:', error);
        }
    }, [userId, period]);

    useEffect(() => {
        if (userId && period) {
            console.log(userId)
            console.log(period)
            fetchBraking();
        }
    }, [userId, period,fetchBraking]);

    // Count the items in the data
    const countItems = (data) => {
        return Array.isArray(data) ? data.length : 0;
    };


    return (
        <Grid item xs={12} sm={6} md={12}>
            {brakeData ? (
                <>
                    <Typography variant="h6" gutterBottom>
                        Brake - Number of Data Points: {countItems(brakeData)}
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={brakeData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="timestamp" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="brakeForce" stroke="#8884d8" />
                        </LineChart>
                    </ResponsiveContainer>
                </>
            ) : (
                <>
                <Typography variant="h6" gutterBottom>
                    Brake Data
                  </Typography>
                <Typography variant="h8" gutterBottom>
                  No data available
                </Typography>
                </>
            )}
        </Grid>
    );
};

export default BrakeGraph;

