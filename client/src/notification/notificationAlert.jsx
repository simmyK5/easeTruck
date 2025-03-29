import React, { useState, useEffect,useCallback } from 'react';
import { useNavigate} from 'react-router-dom';
import axios from 'axios';
import { IconButton, Badge, Menu, MenuItem, List, ListItem, ListItemText, Typography } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';

const NotificationAlert = ({ userId }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [newTaskNotifications, setNewTaskNotifications] = useState([]);
    const [voucherNotifications, setVoucherNotifications] = useState([]);
    const navigate = useNavigate();

    const fetchTaskNotificationsPreview =useCallback( async () => {
        console.log(userId)
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/notification/completedNotification/preview`, {
                params: { userId }
            });
            setNotifications(response.data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    }, [userId]);

    const fetchVoucherNotificationsPreview =useCallback( async () => {
        console.log("are we sending userId")
        console.log(userId)
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/notification/voucherNotification/preview`, {
                params: { userId }
            });
            setVoucherNotifications(response.data);
            console.log(response.data)
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    }, [userId]);

    const fetchNewTaskNotificationsPreview =useCallback( async () => {
        console.log("are we sending userId")
        console.log(userId)
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/notification/newTaskNotification/preview`, {
                params: { userId }
            });
            setNewTaskNotifications(response.data);
            console.log(response.data)
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    }, [userId]);

    useEffect(() => {
        if (userId) {
            fetchTaskNotificationsPreview();
            fetchVoucherNotificationsPreview();
            fetchNewTaskNotificationsPreview();
        }
    }, [userId]);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };
    const handleNavigate = () => {
        //handleClose(); // Close the menu
        console.log(userId)
        if(userId){
            navigate("/allNotifications",{ state: { userId } });
        }
    };
    const totalCount = notifications.length + voucherNotifications.length + newTaskNotifications.length;

    return (
        <>
            <IconButton color="inherit" onClick={handleClick} data-testid="notificationBtn">
                <Badge badgeContent={totalCount} color="secondary">
                    <NotificationsIcon />
                </Badge>
            </IconButton>
            <Menu
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleClose}
                data-testid="menue"
            >
                <MenuItem disabled>
                    <Typography variant="h6">Notifications</Typography>
                </MenuItem>
                <List>
                    {notifications.map((notification) => (
                        <ListItem key={notification._id} data-testid="notifcationList">
                            <ListItemText
                                primary={notification.title}
                                secondary={notification.message}
                            />
                        </ListItem>
                    ))}
                    {voucherNotifications.map((voucherNotification) => (
                        <ListItem key={voucherNotification._id} data-testid="voucherList">
                            <ListItemText
                                primary={voucherNotification.title}
                                secondary={voucherNotification.message}
                            />
                        </ListItem>
                    ))}
                    {newTaskNotifications.map((newTaskNotification) => (
                        <ListItem key={newTaskNotification._id} data-testid="taskList">
                            <ListItemText
                                primary={newTaskNotification.title}
                                secondary={newTaskNotification.message}
                            />
                        </ListItem>
                    ))}
                </List>

                

                {userId && (
                   <MenuItem onClick={handleNavigate} data-testid="seeMore">
                   See more
               </MenuItem>
                )}
            </Menu>
        </>
    );
};

export default NotificationAlert;