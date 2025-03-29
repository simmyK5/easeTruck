import React, { useEffect, useState,useCallback } from 'react';
import axios from 'axios';
import { Grid, Typography, Card, CardContent } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];


const TechnicianInstallationType = ({ userId, period }) => {
    const [installationData, setInstallationData] = useState([]);

    // Fetch installation data based on period
    const fetchInstallation = useCallback(async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/dashboard/driverInstallationType`, {
                params: { period ,userId}
            });
            setInstallationData(response.data);
        } catch (error) {
            console.error('Error fetching installation data:', error);
            setInstallationData([]); // Optionally set to an empty array or a default value in case of error
        }
    }, [userId,period]);

    useEffect(() => {
        if (period) {
            fetchInstallation();
        }
    }, [period,fetchInstallation]);

    // Count the items by name
    const countItemsByName = (name) => {
        if (!Array.isArray(installationData)) return 0;
        return installationData.reduce((acc, item) => item.name === name ? acc + item.quantity : acc, 0);
    };

    // Prepare data for the pie chart
    const data = [
        { name: 'Number of Hardware', value: countItemsByName('Installation + Hardware') },
        { name: 'Number of Installation', value: countItemsByName('Installation Only') }
    ];

    return (
        <Grid item xs={12} sm={6} md={3}>
            <Card>
                <CardContent>
                    {installationData.length > 0 ? (
                        <>
                            <Typography variant="h6" gutterBottom>
                                Installation Data
                            </Typography>
                            <Typography variant="body1" gutterBottom>
                                <strong>Number of Hardware:</strong> {countItemsByName('Installation + Hardware')}
                            </Typography>
                            <Typography variant="body1" gutterBottom>
                                <strong>Number of Installation:</strong> {countItemsByName('Installation Only')}
                            </Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={data}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        fill="#8884d8"
                                        label
                                    >
                                        {data.map((entry, index) => (
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

export default TechnicianInstallationType;
