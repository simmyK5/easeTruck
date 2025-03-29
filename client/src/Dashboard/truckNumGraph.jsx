import React, { useEffect, useState,useCallback } from 'react';
import axios from 'axios';
import { Grid, CircularProgress, Typography,Card,CardContent } from '@mui/material';

const TruckNumGraph = ({ userId, period }) => {
    const [truckNumData, setTruckNumData] = useState(null);

    // Fetch acceleration data based on userId and period
    const fetchTruckNum = useCallback(async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/dashboard/trucks`, {
                params: {
                    userId: userId,
                    period: period
                }
            });
            setTruckNumData(response.data);
        } catch (error) {
            console.error('Error fetching turning data:', error);
        }
    }, [userId, period]);

    useEffect(() => {
        if (userId && period) {
            console.log(userId)
            console.log(period)
            fetchTruckNum();
        }
    }, [userId, period,fetchTruckNum]);

  

    return (
        <Grid item xs={12} sm={6} md={3}>
            <Card>
                <CardContent>
                    {truckNumData ? (
                        <>
                            <Typography variant="h6" gutterBottom>
                                Trucks
                            </Typography>
                            {Array.isArray(truckNumData) ? (
                                truckNumData.length > 0 ? (
                                    <>
                                        <Typography variant="body1">
                                            <strong>Number of trucks</strong> {truckNumData.length}
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
                                        <strong>Number of Data Points:</strong> {truckNumData.length}
                                    </Typography>
                                </>
                            )}
                        </>
                    ) : (
                        <CircularProgress />
                    )}

                </CardContent>
            </Card>
        </Grid>
    );
};

export default TruckNumGraph;
