import React, { useEffect, useState ,useCallback} from 'react';
import axios from 'axios';
import { Grid, Typography, Card, CardContent } from '@mui/material';



const BreakDown = ({ userId, period }) => {
    const [breadkDownData, setBreadkDownData] = useState(null);

    // Fetch acceleration data based on userId and period
    const fetchBreakDown =useCallback(async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/dashboard/breakDown`, {
                params: {
                    period: period,
                    userId:userId
                }
            });
            setBreadkDownData(response.data);

        } catch (error) {
            console.error('Error fetching acceleration data:', error);
            setBreadkDownData([]); // Optionally set to an empty array or a default value in case of error
        }
    }, [userId, period])


    useEffect(() => {
        if (period) {
            fetchBreakDown();
        }
    }, [period,fetchBreakDown]);

    // Count the items in the data
    const countItems = (data) => {
        return Array.isArray(data) ? data.length : 0;
    };

    return (
        <Grid item xs={12} sm={6} md={3}>
            <Card>
                <CardContent>
                    {breadkDownData && breadkDownData.length > 0 ? (
                        <Typography variant="body1">
                            <strong>Number of Data Points:</strong> {breadkDownData ? countItems(breadkDownData) : 0}
                        </Typography>
                    ) : (
                        <>
                            <Typography variant="h6" gutterBottom>
                                Breakdown Data
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

export default BreakDown;

