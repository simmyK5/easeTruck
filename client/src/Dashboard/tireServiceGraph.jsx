import React, { useEffect, useState,useCallback } from 'react';
import axios from 'axios';
import { Grid,  Typography, Card, CardContent } from '@mui/material';

const TireServiceGraph = ({ userId, period }) => {
    const [tireServiceData, setTireServiceData] = useState(null);

    // Fetch acceleration data based on userId and period
    const fetchTireService =useCallback(async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/dashboard/tireService`, {
                params: {
                    userId: userId,
                    period: period
                }
            });
            setTireServiceData(response.data);
        } catch (error) {
            console.error('Error fetching tire service data:', error);
        }
    }, [userId,period]);

    useEffect(() => {
        if (userId && period) {
            console.log(userId)
            console.log(period)
            fetchTireService();
        }
    }, [userId, period,fetchTireService]);

  

    return (
        <Grid item xs={12} sm={6} md={3}>
            <Card>
                <CardContent>
                    {tireServiceData ? (
                        <>
                            <Typography variant="h6" gutterBottom>
                                Tire Service Summary
                            </Typography>
                            {Array.isArray(tireServiceData) ? (
                                tireServiceData.length > 0 ? (
                                    <>
                                        <Typography variant="body1">
                                            <strong>Number of Data Points:</strong> {tireServiceData.length}
                                        </Typography>
                                        <Typography variant="body1">
                                            <strong>Mileage:</strong> {tireServiceData[0]?.mileage || 'N/A'}
                                        </Typography>
                                        <Typography variant="body1">
                                            <strong>Interval:</strong> {tireServiceData[0]?.serviceInterval || 'N/A'}
                                        </Typography>
                                        <Typography variant="body1">
                                            <strong>Last Service:</strong> {tireServiceData[0]?.lastServiceDate || 'N/A'}
                                        </Typography>
                                        <Typography variant="body1">
                                            <strong>Next Service:</strong> {tireServiceData[0]?.nextServiceDate || 'N/A'}
                                        </Typography>
                                        <Typography variant="body1">
                                            <strong>Last Update:</strong>{' '}
                                            {new Date(tireServiceData[0]?.timestamp).toLocaleString() || 'N/A'}
                                        </Typography>
                                    </>
                                ) : (
                                    <Typography variant="body1" color="textSecondary">
                                        No service data available
                                    </Typography>
                                )
                            ) : (
                                <>
                                    <Typography variant="body1">
                                        <strong>Mileage:</strong> {tireServiceData.mileage || 'N/A'}
                                    </Typography>
                                    <Typography variant="body1">
                                        <strong>Interval:</strong> {tireServiceData.serviceInterval || 'N/A'}
                                    </Typography>
                                    <Typography variant="body1">
                                        <strong>Last Service:</strong> {tireServiceData.lastServiceDate || 'N/A'}
                                    </Typography>
                                    <Typography variant="body1">
                                        <strong>Next Service:</strong> {tireServiceData.nextServiceDate || 'N/A'}
                                    </Typography>
                                    <Typography variant="body1">
                                        <strong>Last Update:</strong>{' '}
                                        {new Date(tireServiceData.timestamp).toLocaleString() || 'N/A'}
                                    </Typography>
                                </>
                            )}
                        </>
                    ) : (
                        <>
                        <Typography variant="h6" gutterBottom>
                            Tire Service Data
                          </Typography>
                        <Typography variant="h8" gutterBottom>
                          No data available
                        </Typography>
                        </>
                    )}

                </CardContent>
            </Card>
        </Grid>
    );
};

export default TireServiceGraph;
