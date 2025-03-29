import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Grid, Typography, Card, CardContent } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const FeedbackRating = ({ period }) => {
    const [feedbackData, setFeedbackData] = useState([]);

    const fetchFeedbackRatings = useCallback(async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/dashboard/feedbackRating`, {
                params: { period }
            });
            setFeedbackData(response.data);
        } catch (error) {
            console.error('Error fetching feedback rating data:', error);
            setFeedbackData([]);
        }
    }, [period])

    useEffect(() => {
        if (period) {
            fetchFeedbackRatings();
        }
    }, [period, fetchFeedbackRatings]);

    return (
        <Grid item xs={12} sm={6} md={12}>
            <Card>
                <CardContent>
                    {feedbackData.length > 0 ? (
                        <>
                            <Typography variant="h6" gutterBottom>
                                Feedback Ratings
                            </Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={feedbackData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="value" fill="#8884d8" name="Number of Feedbacks" />
                                </BarChart>
                            </ResponsiveContainer>
                        </>
                    ) : (
                        <>
                            <Typography variant="h6" gutterBottom>
                                Feedback Rating Data
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

export default FeedbackRating;
