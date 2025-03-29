import React, { useEffect, useState ,useCallback} from 'react';
import axios from 'axios';
import { Grid, Typography, Card, CardContent } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const TruckBreakDown = ({ period, userId }) => {
    const [breakDownData, setBreakDownData] = useState([]);

    const fetchTruckBreakDown = useCallback(async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/dashboard/truckBreakDown`, {
                params: { period, userId }
            });

            // Transform the response data into the format required by the BarChart
            const transformedData = Object.entries(response.data).map(([key, value]) => ({
                name: key,
                value
            }));

            setBreakDownData(transformedData);
        } catch (error) {
            console.error('Error fetching truck breakdown data:', error);
            setBreakDownData([]);
        }
    }, [period, userId]);

    useEffect(() => {
        if (period && userId) {
            fetchTruckBreakDown();
        }
    }, [period, userId,fetchTruckBreakDown]);

    return (
        <Grid item xs={12} sm={6} md={12}>
            <Card>
                <CardContent>
                    {breakDownData.length > 0 ? (
                        <>
                            <Typography variant="h6" gutterBottom>
                                Breakdown
                            </Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={breakDownData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="value" fill="#8884d8" name="Number of Breakdowns" />
                                </BarChart>
                            </ResponsiveContainer>
                        </>
                    ) : (
                        <Typography variant="body2" gutterBottom>
                            No breakdown data available.
                        </Typography>
                    )}
                </CardContent>
            </Card>
        </Grid>
    );
};

export default TruckBreakDown;
