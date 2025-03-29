import React, { useEffect, useState ,useCallback} from 'react';
import axios from 'axios';
import { Grid, Typography, Card, CardContent } from '@mui/material';

const ServiceDueGraph = ({ userId, period }) => {
    const [serviceData, setServiceData] = useState(null);

    // Fetch acceleration data based on userId and period
    const fetchService = useCallback(async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/dashboard/service`, {
                params: {
                    userId: userId,
                    period: period
                }
            });
            setServiceData(response.data);
        } catch (error) {
            console.error('Error fetching service data:', error);
        }
    }, [userId,period]);


    useEffect(() => {
        if (userId && period) {
            console.log(userId)
            console.log(period)
            fetchService();
        }
    }, [userId, period,fetchService]);


    return (
        <Grid item xs={12} sm={6} md={3}>
            <Card>
                <CardContent>
                    {serviceData ? (
                        <>
                            <Typography variant="h6" gutterBottom>
                                Service Summary
                            </Typography>
                            {Array.isArray(serviceData) ? (
                                serviceData.length > 0 ? (
                                    <>
                                        <Typography variant="body1">
                                            <strong>Number of Data Points:</strong> {serviceData.length}
                                        </Typography>
                                        <Typography variant="body1">
                                            <strong>Mileage:</strong> {serviceData[0]?.mileage || 'N/A'}
                                        </Typography>
                                        <Typography variant="body1">
                                            <strong>Interval:</strong> {serviceData[0]?.serviceInterval || 'N/A'}
                                        </Typography>
                                        <Typography variant="body1">
                                            <strong>Last Service:</strong> {serviceData[0]?.lastServiceDate || 'N/A'}
                                        </Typography>
                                        <Typography variant="body1">
                                            <strong>Next Service:</strong> {serviceData[0]?.nextServiceDate || 'N/A'}
                                        </Typography>
                                        <Typography variant="body1">
                                            <strong>Last Update:</strong>{' '}
                                            {new Date(serviceData[0]?.timestamp).toLocaleString() || 'N/A'}
                                        </Typography>
                                    </>
                                ) : (
                                    <Typography variant="body1" color="textSecondary">
                                        No data available
                                    </Typography>
                                )
                            ) : (
                                <>
                                    <Typography variant="body1">
                                        <strong>Mileage:</strong> {serviceData.mileage || 'N/A'}
                                    </Typography>
                                    <Typography variant="body1">
                                        <strong>Interval:</strong> {serviceData.serviceInterval || 'N/A'}
                                    </Typography>
                                    <Typography variant="body1">
                                        <strong>Last Service:</strong> {serviceData.lastServiceDate || 'N/A'}
                                    </Typography>
                                    <Typography variant="body1">
                                        <strong>Next Service:</strong> {serviceData.nextServiceDate || 'N/A'}
                                    </Typography>
                                    <Typography variant="body1">
                                        <strong>Last Update:</strong>{' '}
                                        {new Date(serviceData.timestamp).toLocaleString() || 'N/A'}
                                    </Typography>
                                </>
                            )}
                        </>
                    ) : (
                        <>
                        <Typography variant="h6" gutterBottom>
                            Service Data
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

export default ServiceDueGraph;
