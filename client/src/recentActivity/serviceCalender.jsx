import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Typography, CircularProgress, List, ListItem, ListItemText,Button } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { DateTime } from 'luxon';

const ServiceCalender = ({ userId }) => {
    const [serviceData, setServiceData] = useState(null);
    const [countdown, setCountdown] = useState('');
    const [notifications, setNotifications] = useState([]);
    const [intervalId, setIntervalId] = useState(null);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);





    const fetchService = useCallback(async () => {
        try {
            console.log("chokeslma",userId)
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/recentActivity/serviceDue`, {
                params: { userId }
            });

            console.log("yebo",response.data)

            // Check if the response data is not empty or null
            if (response.data) {
                console.log("do we enter")
                setServiceData(response.data);
            } else {
                console.warn('No service due data found.');
                setServiceData([]);
            }
        } catch (error) {
            console.error('Error fetching recent service due data:', error);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        if (userId) {
            fetchService();
        }
    }, [userId, fetchService]);



    const handleNavigate = () => {
        //handleClose(); // Close the menu
        console.log(userId)
        if (userId) {
            navigate("/allServiceSummary", { state: { userId } });
        }
    };



    return (
        <div>
            <Typography variant="h6" gutterBottom>
                Service Summary
            </Typography>

            {/* Display loading indicator */}
            {loading ? (
                <CircularProgress />

            ) : serviceData && serviceData.length > 0 ? (
                <>
                <List>
                    {serviceData.map((service, index) => (
                        <ListItem key={index} divider data-testid="serviceDataList">
                            <ListItemText
                                primary={`Number Plate: ${service.numberPlate}`} // Customize this part based on your data structure
                                secondary={
                                    <>
                                        <Typography variant="body1"><strong>Mileage:</strong> {service.mileage}</Typography>
                                        <Typography variant="body1"><strong>Make:</strong> {service.make}</Typography>
                                        <Typography variant="body1"><strong>Model:</strong> {service.model}</Typography>
                                        <Typography variant="body1"><strong>Year:</strong> {service.year}</Typography>
                                        <Typography variant="body1"><strong>Driver:</strong> {service.driverName}</Typography>


                                    </>
                                }
                            />
                        </ListItem>
                    ))}
                    
                </List>
                 {serviceData && (
                    <Button variant="text" onClick={handleNavigate}>
                      View More
                    </Button>
                  )}
                  </>
            ) : (
                <Typography>No Service Due activities found.</Typography>
            )}
        </div>
    );

};

export default ServiceCalender;
