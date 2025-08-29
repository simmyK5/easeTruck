import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { Typography, CircularProgress, List, ListItem, ListItemText,MenuItem } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const RecentClaimConfirmation = ({ userId }) => {
    const [recentConfirmationData, setRecentConfirmationData] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();


    // Fetch recent activity data based on userId
    const fetchRecentConfirmation = useCallback(async () => {
        try {
            console.log("happy birtday", userId)
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/recentActivity/recentClaimVoucher`, {
                params: {
                    userId: userId
                }
            });

            // Check if the response data is not empty or null
            if (response.data && Array.isArray(response.data) && response.data.length > 0) {
                setRecentConfirmationData(response.data);
            } else {
                console.warn('No recent activity data found.');
                setRecentConfirmationData([]);
            }
        } catch (error) {
            console.error('Error fetching recent activity data:', error);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        if (userId) {
            fetchRecentConfirmation();
        }
    }, [userId, fetchRecentConfirmation]);

    const handleNavigate = () => {
        if (userId) {
            navigate("/confirmClaim", { state: { userId } });
        }
    };

    return (
        <div>
            <Typography variant="h6" gutterBottom>
                Summary of Confirmations
            </Typography>
            {loading ? (
                <CircularProgress />
            ) : recentConfirmationData && recentConfirmationData.length > 0 ? (
                <List>
                    {recentConfirmationData.map((confirmation, index) => (
                        <ListItem key={index} divider data-testid="recentActivityList">
                            <ListItemText
                                primary={confirmation.resellerName} // Customize based on your data structure
                                secondary={new Date(confirmation.timestamp).toLocaleString()} // Customize based on your data structure
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
                <Typography>No recent confirmations found.</Typography>

            )}
        </div>
    );
};

export default RecentClaimConfirmation;
