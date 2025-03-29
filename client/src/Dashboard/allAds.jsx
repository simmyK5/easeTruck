import React, { useEffect, useState,useCallback } from 'react';
import axios from 'axios';
import { Grid, CircularProgress, Typography, Card, CardContent } from '@mui/material';

const AllAds = ({ userId, period }) => {
    const [adNumData, setAdNumData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch ad data based on userId and period
    const fetchAdNum =  useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/dashboard/allAd`, {
                params: { userId, period }
            });
            setAdNumData(response.data);
        } catch (error) {
            console.error('Error fetching ad data:', error);
            setAdNumData(null);
        } finally {
            setLoading(false);
        }
    },[userId, period]);

    useEffect(() => {
        if (userId && period) {
            fetchAdNum();
        }
    }, [userId, period,fetchAdNum]);

    return (
        <Grid item xs={12} sm={6} md={3}>
            <Card>
                <CardContent>
                    {loading ? (
                        <CircularProgress />
                    ) : (
                        <>
                            <Typography variant="h6" gutterBottom>
                            Number of ads
                            </Typography>
                            {adNumData ? (
                                adNumData.adCount !== undefined ? (
                                    <Typography variant="body1">
                                        <strong>Number of ads:</strong> {adNumData.adCount}
                                    </Typography>
                                ) : (
                                    <Typography variant="body1" color="textSecondary">
                                        No ad data available
                                    </Typography>
                                )
                            ) : (
                                <Typography variant="body1" color="textSecondary">
                                    No ad data available
                                </Typography>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </Grid>
    );
};

export default AllAds;
