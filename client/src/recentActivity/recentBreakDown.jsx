import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Typography, CircularProgress, List, ListItem, ListItemText, MenuItem } from '@mui/material';

const RecentBreakDown = ({ userId }) => {
    const [recentBreakDownData, setRecentBreakDownData] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Fetch recent activity data based on userId
    const fetchRecentBreakDownData = useCallback( async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/recentActivity/recentBreakDownData`, {
                params: { userId }
            });

            if (response.data && Array.isArray(response.data) && response.data.length > 0) {
                setRecentBreakDownData(response.data);
            } else {
                console.warn('No recent activity data found.');
                setRecentBreakDownData([]);
            }
        } catch (error) {
            console.error('Error fetching recent activity data:', error);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        if (userId) {
            fetchRecentBreakDownData();
        }
    }, [userId,fetchRecentBreakDownData]);

    const handleNavigate = () => {
        if (userId) {
            navigate("/breakDownList", { state: { userId } });
        }
    };

    return (
        <div>
            <Typography variant="h6" gutterBottom>
                Summary of Recent BreakDown
            </Typography>
            {loading ? (
                <CircularProgress />
            )  : recentBreakDownData && recentBreakDownData.length > 0 ? (
                <List>
                    {recentBreakDownData.map((activity, index) => (
                        <ListItem key={index} divider data-testid="breakdownList">
                            <ListItemText
                                primary={activity.numberPlate} 
                                secondary={new Date(activity.timestamp).toLocaleString()} 
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
                <Typography>No recent breakdown found.</Typography>
            )}
        </div>
    );
};

export default RecentBreakDown;
