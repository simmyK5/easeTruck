import React, { useEffect, useState,useCallback} from 'react';
import axios from 'axios';
import { Grid, Typography } from '@mui/material';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const IdleTimeGraph = ({ userId, period }) => {
    const [idleTimeData, setIdleTimeData] = useState(null);

    // Fetch acceleration data based on userId and period
    const fetchIdleTime = useCallback(async () => {

        try {
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/dashboard/idleTime`, {
                params: {
                    userId: userId,
                    period: period
                }
            });
            setIdleTimeData(response.data);
        } catch (error) {
            console.error('Error fetching idle time data:', error);
        }
    }, [userId, period]);

    useEffect(() => {
        if (userId && period) {
            console.log(userId)
            console.log(period)
            fetchIdleTime();
        }
    }, [userId, period,fetchIdleTime]);

    // Count the items in the data
    const countItems = (data) => {
        return Array.isArray(data) ? data.length : 0;
    };



    return (
        <Grid item xs={12} sm={6} md={12}>
            {idleTimeData ? (
                <>
                    <Typography variant="h6" gutterBottom>
                        Idle Time Data - Number of Data Points: {countItems(idleTimeData)}
                    </Typography>
                    <ResponsiveContainer width="100%" height={400}> {/* Adjusted height here */}
                        <LineChart data={idleTimeData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="timestamp" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="idleTime" stroke="#8884d8" />
                        </LineChart>
                    </ResponsiveContainer>

                </>
            ) : (
                <>
                    <Typography variant="h6" gutterBottom>
                        Idle Time Data
                    </Typography>
                    <Typography variant="h8" gutterBottom>
                        No data available
                    </Typography>
                </>
            )}
        </Grid>
    );
};

export default IdleTimeGraph;