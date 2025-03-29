import React, { useEffect, useState ,useCallback} from 'react';
import axios from 'axios';
import { Grid, Typography} from '@mui/material';
import { Bar,BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const LoadNumGraph = ({ userId, period }) => {
    const [loadData, setLoadData] = useState(null);

    // Fetch acceleration data based on userId and period
    const fetchLoadData = useCallback(async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/dashboard/load`, {
                params: {
                    userId: userId,
                    period: period
                },
            });

            // Transform the data to calculate the difference and keep the user structure
            const dataWithDifference = response.data.map(user => ({
                ...user,
                tasks: user.tasks.map(task => ({
                    ...task,
                    difference: task.onload - task.offload,
                })),
            }));

            console.log(dataWithDifference);
            setLoadData(dataWithDifference);

            return dataWithDifference;
        } catch (error) {
            console.error('Error fetching drive data:', error);
            return [];
        }
    }, [userId,period]);

    useEffect(() => {
        if (userId && period) {
            console.log(userId)
            console.log(period)
            fetchLoadData();
        }
    }, [userId, period,fetchLoadData]);

    
    const flattenTasks = loadData ? loadData.flatMap(user => user.tasks) : [];
    if(flattenTasks){
        console.log(flattenTasks)
    }

    // Count the items in the data
    const countItems = (data) => {
        return Array.isArray(data) ? data.length : 0;
    };
   


    return (
<Grid item xs={12} sm={6} md={12} style={{ height: 300 }}> {/* Fixed height */}
      {flattenTasks ? (
        <>
          <Typography variant="h6" gutterBottom>
            Load Data - Number of Data Points: {countItems(flattenTasks)}
          </Typography>
          <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={flattenTasks} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="createdAt" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="onload" fill="#8884d8" />
                                        <Bar dataKey="offload" fill="#82ca9d" />
                                        <Bar dataKey="difference" fill="#ffc658" />
                                    </BarChart>
                                </ResponsiveContainer>
        </>
      ) : (
        <>
          <Typography variant="h6" gutterBottom>
            Fuel Data
          </Typography>
          <Typography variant="h8" gutterBottom>
            No data available
          </Typography>
        </>
      )}
    </Grid>

        

    );
};

export default LoadNumGraph;



