import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import {Typography,  CircularProgress, List,ListItem,ListItemText } from '@mui/material';

const RecentActivity = ({ userId }) => {
    const [recentActivityData, setRecentActivityData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch recent activity data based on userId
    const fetchRecentActivity =useCallback( async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/recentActivity/recentTask`, {
                params: {
                    userId: userId
                }
            });

            // Check if the response data is not empty or null
            if (response.data && Array.isArray(response.data) && response.data.length > 0) {
                setRecentActivityData(response.data);
            } else {
                console.warn('No recent activity data found.');
                setRecentActivityData([]);
            }
        } catch (error) {
            console.error('Error fetching recent activity data:', error);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        if (userId) {
            fetchRecentActivity();
        }
    }, [userId,fetchRecentActivity]);

    return (
        <div>
        <Typography variant="h6" gutterBottom>
            Summary of Recent Activity
        </Typography>
        {loading ? (
            <CircularProgress />
        )  : recentActivityData && recentActivityData.length > 0 ? (
            <List>
                {recentActivityData.map((activity, index) => (
                    <ListItem key={index} divider data-testid="recentActivityList">
                        <ListItemText
                            primary={activity.status} // Customize based on your data structure
                            secondary={new Date(activity.createdAt).toLocaleString()} // Customize based on your data structure
                        />
                    </ListItem>
                ))}
            </List>
        ) : (
            <Typography>No recent activities found.</Typography>

        )}
    </div>
    );
};

export default RecentActivity;
