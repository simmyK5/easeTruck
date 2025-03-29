import React, { useState, useEffect } from 'react';
import {useNavigate} from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, Typography, Grid, Badge, IconButton,MenuItem } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { DateTime } from 'luxon';

const ServiceCalender = ({ userId }) => {
    const [serviceData, setServiceData] = useState(null);
    const [countdown, setCountdown] = useState('');
    const [notifications, setNotifications] = useState([]);
    const [intervalId, setIntervalId] = useState(null);
   const navigate = useNavigate();

    useEffect(() => {
        const fetchService = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/recentActivity/recentCalender`, {
                    params: { userId }
                });
    
                // Ensure nextServiceDate is a valid date
                console.log(response.data)
                const nextServiceDate = response.data?.nextServiceDueDate
                    ? DateTime.fromISO(response.data.nextServiceDueDate, { zone: 'utc' }).toJSDate()
                    : null;
                if (nextServiceDate) {
                    setCountdownStartDate(nextServiceDate);
                }
                setServiceData(response.data);
            } catch (error) {
                console.error('Error fetching service data:', error);
            }
        };

        if (userId) {
            fetchService(); // Fetch service data when the component mounts
        }
    }, [userId]);

    // Fetch service data based on userId (if needed for other purposes)
   /* const fetchService = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/recentActivity/recentCalender`, {
                params: { userId }
            });

            // Ensure nextServiceDate is a valid date
            console.log(response.data)
            const nextServiceDate = response.data?.nextServiceDueDate
                ? DateTime.fromISO(response.data.nextServiceDueDate, { zone: 'utc' }).toJSDate()
                : null;
            if (nextServiceDate) {
                setCountdownStartDate(nextServiceDate);
            }
            setServiceData(response.data);
        } catch (error) {
            console.error('Error fetching service data:', error);
        }
    };*/

    // Function to calculate the countdown
    const calculateCountdown = (date) => {
        const now = new Date();
        const distance = date - now;

        if (distance <= 0) {
            return 'Time expired';
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    };

    const setCountdownStartDate = (nextServiceDate) => {
        const countdownStartDate = DateTime.fromJSDate(nextServiceDate).minus({ days: 10 }).toJSDate();
        if (new Date() >= countdownStartDate) {
            const id = setInterval(() => {
                const newCountdown = calculateCountdown(nextServiceDate);
                setCountdown(newCountdown);

                if (newCountdown === 'Time expired') {
                    clearInterval(id);
                    setIntervalId(null);
                }
            }, 1000);

            setIntervalId(id);
        } else {
            setCountdown('Countdown will start 10 days before the next service date.');
        }
    };
    const handleNavigate = () => {
        //handleClose(); // Close the menu
        console.log(userId)
        if(userId){
            navigate("/allServiceSummary",{ state: { userId } });
        }
    };

    /*useEffect(() => {
        if (userId) {
            fetchService();
        }

        // Cleanup interval on component unmount
        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [userId, intervalId]);*/

    return (
        <Grid item xs={12} sm={6} md={3}>
            <Card>
                <CardContent>
                    <Grid container justifyContent="space-between" alignItems="center">
                        <Typography variant="h6" gutterBottom>
                            Service Summary
                        </Typography>
                        <Badge badgeContent={notifications.length} color="secondary">
                            <IconButton data-testid="notificationBtn">
                                <NotificationsIcon />
                            </IconButton>
                        </Badge>
                    </Grid>
                    {serviceData && countdown ? (
                        <>
                            <Typography variant="body1">
                                <strong>Next Service:</strong> {serviceData.nextServiceDueDate } for {serviceData.dueTruck }
                            </Typography>
                            <Typography variant="body1">
                                <strong>Time Remaining:</strong> {countdown}
                            </Typography>
                        </>
                    ) : (
                        <>
                            <Typography variant="h6" gutterBottom>
                                Service Data
                            </Typography>
                            <Typography variant="body1">
                                No service data available 
                            </Typography>
                        </>
                    )}
                </CardContent>
                {userId && (
                   <MenuItem onClick={handleNavigate} data-testid="seeMore">
                   See more
               </MenuItem>)}
            </Card>
        </Grid>
    );
};

export default ServiceCalender;
