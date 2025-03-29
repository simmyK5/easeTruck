import React, { useEffect, useState,useCallback } from 'react';
import axios from 'axios';
import { Grid, Typography, Card, CardContent } from '@mui/material';

const TaskGraph = ({ userId, period }) => {
    const [taskData, setTaskData] = useState(null);

    // Fetch acceleration data based on userId and period
    const fetchTask =useCallback(async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/dashboard/task`, {
                params: {
                    userId: userId,
                    period: period
                }
            });
            //console.log(response.data)
            setTaskData(response.data);
        } catch (error) {
            console.error('Error fetching turning data:', error);
        }
    }, [userId,period]);

    useEffect(() => {
        if (userId && period) {
            console.log(userId)
            console.log(period)
            fetchTask();
        }
    }, [userId, period,fetchTask]);

    

    return (
        <Grid item xs={12} sm={6} md={3}>
            <Card>
                <CardContent>
                    {taskData ? (
                        <>
                            <Typography variant="h6" gutterBottom>
                                Task
                            </Typography>
                            {Array.isArray(taskData) ? (
                                taskData.length > 0 ? (
                                    <>
                                        <Typography variant="body1">
                                            <strong>Number of tasks</strong> {taskData.length}
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
                                        <strong>Number of Data Points:</strong> {taskData.length}
                                    </Typography>
                                </>
                            )}
                        </>
                    ) : (
                        <>
                        <Typography variant="h6" gutterBottom>
                            Task Data
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

export default TaskGraph;
