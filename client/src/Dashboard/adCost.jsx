import React, { useEffect, useState,useCallback } from 'react';
import axios from 'axios';
import { Grid, CircularProgress, Typography, Card, CardContent } from '@mui/material';

const AdCost = ({ userId, period }) => {
    const [adCostData, setAdCostData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch ad data based on userId and period
    const fetchAdCost = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/dashboard/adCost`, {
                params: { userId, period }
            });
            setAdCostData(response.data);
        } catch (error) {
            console.error('Error fetching ad data:', error);
            setAdCostData(null);
        } finally {
            setLoading(false);
        }
    }, [userId, period]);

    useEffect(() => {
        if (userId && period) {
            fetchAdCost();
        }
    }, [userId, period,fetchAdCost]);

    return (
        <Grid item xs={12} sm={6} md={3}>
            <Card>
                <CardContent>
                    {loading ? (
                        <CircularProgress />
                    ) : (
                        <>
                            <Typography variant="h6" gutterBottom>
                            Total Amount of ads
                            </Typography>
                            {adCostData ? (
                                adCostData.totalAmount !== undefined ? (
                                    <Typography variant="body1">
                                        <strong>Total Amount of ads:</strong> {adCostData.totalAmount}
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

export default AdCost;
