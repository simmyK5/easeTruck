import React, { useEffect, useState,useCallback } from 'react';
import axios from 'axios';
import { Grid, CircularProgress, Typography, Card, CardContent } from '@mui/material';

const AdCost = ({ userId, period }) => {
    const [activeAdData, setActiveAdData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch ad data based on userId and period
    const fetchAdCost = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/dashboard/activeAd`, {
                params: { userId, period }
            });
            setActiveAdData(response.data);
        } catch (error) {
            console.error('Error fetching ad data:', error);
            setActiveAdData(null);
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
                            Number of active
                            </Typography>
                            {activeAdData ? (
                                activeAdData.activeAdCount !== undefined ? (
                                    <Typography variant="body1">
                                      <strong>Number of active ads</strong> {activeAdData.activeAdCount}
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
/*import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Grid, CircularProgress, Typography,Card,CardContent } from '@mui/material';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ActiveAd = ({ userId, period }) => {
    const [activeAdData, setActiveAdData] = useState(null);

    // Fetch acceleration data based on userId and period
    const fetchActiveAd = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/dashboard/activeAd`, {
                params: {
                    userId: userId,
                    period: period
                }
            });
            setActiveAdData(response.data);
            console.log(response.data)
        } catch (error) {
            console.error('Error fetching turning data:', error);
        }
    };

    useEffect(() => {
        if (userId && period) {
            console.log(userId)
            console.log(period)
            fetchActiveAd();
        }
    }, [userId, period]);

    // Count the items in the data
    const countItems = (data) => {
        return Array.isArray(data) ? data.length : 0;
    };


    return (
        <Grid item xs={12} sm={6} md={3}>
            <Card>
                <CardContent>
                    {activeAdData ? (
                        <>
                            <Typography variant="h6" gutterBottom>
                                Ads
                            </Typography>
                            {Array.isArray(activeAdData) ? (
                                activeAdData.length > 0 ? (
                                    <>
                                        <Typography variant="body1">
                                            <strong>Number of ads</strong> {activeAdData.activeAdCount}
                                        </Typography>
                                    </>
                                ) : (
                                    <Typography variant="body1" color="textSecondary">
                                        No ad data available
                                    </Typography>
                                )
                            ) : (
                                <>
                                    <Typography variant="body1">
                                        <strong>Number of Data Points:</strong> {activeAdData.activeAdCount}
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

export default ActiveAd;*/

