import React, { useEffect, useState,useCallback } from 'react';
import axios from 'axios';
import { Grid, Typography, Card, CardContent } from '@mui/material';


const TechnicianTotalInstallations = ({ userId, period }) => {
    const [installationData, setInstallationData] = useState(null);

    // Fetch acceleration data based on userId and period
    const fetchInstallation =useCallback( async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/dashboard/driverInstallation`, {
                params: {
                    period: period,
                    userId:userId
                }
            });
            setInstallationData(response.data);

        } catch (error) {
            console.error('Error fetching acceleration data:', error);
            setInstallationData([]); // Optionally set to an empty array or a default value in case of error
        }
    }, [userId,period]);


    useEffect(() => {
        if (period) {
            fetchInstallation();
        }
    }, [period,fetchInstallation]);

    // Count the items in the data
    const countItems = (data) => {
        return Array.isArray(data) ? data.length : 0;
    };

    return (
        <Grid item xs={12} sm={6} md={3}>
            <Card>
                <CardContent>
                    {installationData && installationData.length > 0 ? (
                        <Typography variant="body1">
                            <strong>Number of Data Points:</strong> {installationData ? countItems(installationData) : 0}
                        </Typography>
                    ) : (
                        <>
                            <Typography variant="h6" gutterBottom>
                                Installation Data
                            </Typography>
                            <Typography variant="body2" gutterBottom>
                                No data available
                            </Typography>
                        </>
                    )}
                </CardContent>
            </Card>
        </Grid>
    );
};

export default TechnicianTotalInstallations;

