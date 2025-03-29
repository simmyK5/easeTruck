import React, { useEffect, useState,useCallback } from 'react';
import axios from 'axios';
import { useNavigate} from 'react-router-dom';
import { Typography,CircularProgress, Alert, List, ListItem, ListItemText,MenuItem } from '@mui/material';

const RecentInstallation = ({ userId }) => {
    const [recentActivityData, setRecentActivityData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Fetch recent activity data based on userId
    const fetchRecentActivity = useCallback(async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/recentActivity/recentInstallation`, {
                params: { userId }
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
            setError('Failed to fetch recent activity data.');
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        if (userId) {
            fetchRecentActivity();
        }
    }, [userId,fetchRecentActivity]);

    const handleNavigate = () => {
        //handleClose(); // Close the menu
        console.log(userId)
        if(userId){
            navigate("/technicianInstallation",{ state: { userId } });
        }
    };

    return (
        <div>
            <Typography variant="h6" gutterBottom>
                Summary of Recent Installation
            </Typography>
            {loading ? (
                <CircularProgress />
            ) : error ? (
                <Alert severity="error">{error}</Alert>
            ) : recentActivityData && recentActivityData.length > 0 ? (
                <List>
                    {recentActivityData.map((activity, index) => (
                        <ListItem key={index} divider data-testid="recentInstallationBtn">
                            <ListItemText
                                primary={activity.status} // Customize based on your data structure
                                secondary={new Date(activity.createdAt).toLocaleString()} // Customize based on your data structure
                            />
                        </ListItem>
                    ))}

                    {userId && (
                        <MenuItem onClick={handleNavigate} data-testid="seeMoreBtn">
                            See more
                        </MenuItem>
                    )}
                </List>
            ) : (
                <Typography>No recent installation found.</Typography>
            )}
        </div>
    );
};

export default RecentInstallation;
