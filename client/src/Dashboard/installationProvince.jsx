import React, { useEffect, useState ,useCallback} from 'react';
import axios from 'axios';
import { Grid, Typography, Card, CardContent } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const InstallationProvince = ({ period }) => {
    const [installationProvinceData, setInstallationProvinceData] = useState([]);

    const fetchInstallation = useCallback(async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/dashboard/installationProvince`, {
                params: { period }
            });
            setInstallationProvinceData(response.data);
        } catch (error) {
            console.error('Error fetching installation data:', error);
            setInstallationProvinceData([]);
        }
    }, [period]);

    useEffect(() => {
        if (period) {
            fetchInstallation();
        }
    }, [period,fetchInstallation]);

    return (
        <Grid item xs={12} sm={6} md={3}>
            <Card>
                <CardContent>
                    {installationProvinceData.length > 0 ? (
                        <>
                            <Typography variant="h6" gutterBottom>
                                Installation Data
                            </Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={installationProvinceData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="count" fill="#8884d8" name="Number of Installations" />
                                </BarChart>
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

export default InstallationProvince;
