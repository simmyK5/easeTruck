import React, { useState, useEffect,useCallback } from 'react';
import axios from 'axios';
import { Card, CardContent, Typography, Grid, IconButton, List, ListItem, ListItemText, Badge } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';

const CreatedTask = ({ userId }) => {
    const [notifications, setNotifications] = useState([]);




    const fetchNotifications = useCallback(async () => {
        try {
            console.log(userId)
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/notification/taskNotification`, {
                params: {
                    userId: userId
                }
            });
            setNotifications(response.data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    }, [userId]);

    useEffect(() => {
        if (userId) {
            fetchNotifications();
        }
    }, [fetchNotifications]);

    return (
        <Grid item xs={12} sm={6} md={3}>
            <Card>
                <CardContent>
                    <Grid container justifyContent="space-between" alignItems="center">
                        <Typography variant="h6" gutterBottom>
                            Notifications
                        </Typography>
                        <Badge badgeContent={notifications.length} color="secondary">
                            <IconButton data-testid="notificationBtn">
                                <NotificationsIcon />
                            </IconButton>
                        </Badge>
                    </Grid>
                    <List>
                        {notifications.map((notification) => (
                            <ListItem key={notification._id} data-testid="notificationList">
                                <ListItemText
                                    primary={notification.title}
                                    secondary={notification.message}
                                />
                            </ListItem>
                        ))}
                    </List>
                </CardContent>
            </Card>
        </Grid>
    );
};

export default CreatedTask;


