import React, { useEffect, useState,useCallback } from 'react';
import axios from 'axios';
import { Grid, Typography, Card, CardContent } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const FeedbackType = ({ period }) => {
    const [feedbackData, setFeedbackData] = useState([]);

    // Fetch installation data based on period
    const fetchFeedback = useCallback(async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/dashboard/feedbackType`, {
                params: { period }
            });
            setFeedbackData(response.data);
            console.log(response.data)
        } catch (error) {
            console.error('Error fetching installation data:', error);
            setFeedbackData([]); // Optionally set to an empty array or a default value in case of error
        }
    }, [period])

    useEffect(() => {
        if (period) {
            fetchFeedback();
        }
    }, [period,fetchFeedback]);
    const countSubject = (subject) => {
        return feedbackData.reduce((acc, item) => {
            if (item.name === subject) {
                return acc + item.value; // Accumulate the value for that subject
            }
            return acc;
        }, 0);
    };

    // Count the items by name
    return (
        <Grid item xs={12} sm={6} md={3}>
            <Card>
                <CardContent>
                    {feedbackData.length > 0 ? (
                        <>
                            <Typography variant="h6" gutterBottom>
                                Feedback Data
                            </Typography>
                            <Typography variant="h6" gutterBottom>
                                Number of Complaints: {countSubject('Complaint')}
                            </Typography>
                            <Typography variant="h6" gutterBottom>
                                Number of Compliments: {countSubject('Compliment')}
                            </Typography>
                            <Typography variant="h6" gutterBottom>
                                Number of Enquiries: {countSubject('Enquiry')}
                            </Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={feedbackData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        fill="#8884d8"
                                        label
                                    >
                                        {feedbackData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </>
                    ) : (
                        <>
                            <Typography variant="h6" gutterBottom>
                                Feedback Type Data
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

export default FeedbackType;

