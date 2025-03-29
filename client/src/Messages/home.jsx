import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { emitLocationUpdate, getUser, joinGroup } from '../services/socketService';

const Home = () => {
    const { user, isAuthenticated, isLoading } = useAuth0();
    const [userId, setUserId] = useState('');
    const [coordinates, setCoordinates] = useState({ latitude: null, longitude: null });
    const [groupId, setGroupId] = useState(null);
    const [driverId, setDriverId] = useState('');
    const [vehicleOwnerId, setVehicleOwnerId] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (user && user.email) {
            fetchUserDetails(user.email);
        }
    }, [user]);

    const fetchUserDetails = async (email) => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/user/users/${email}`);
            setUserId(response.data._id);

            getUser(response.data._id, (msgs) => {
                if (msgs) {
                    console.log("Retrieved user details:", msgs);
                    setDriverId(msgs._id);
                    setVehicleOwnerId(msgs.vehicleOwnerId);
                    setGroupId(`supervisor-${msgs.vehicleOwnerId}`);
                }
            });
        } catch (error) {
            console.error('Error fetching user details:', error);
        }
    };

    useEffect(() => {
        if (groupId && driverId) {

            joinGroup(groupId);

            const sendLocation = (position) => {
                const { latitude, longitude } = position.coords;
                const location = { latitude, longitude };
                console.log("Sending location update:", { groupId, driverId, location });
                emitLocationUpdate(groupId, driverId, location);
            };

            const handleError = (error) => {
                console.error('Error getting location:', error);
            };

            if (navigator.geolocation) {
                const watchId = navigator.geolocation.watchPosition(
                    sendLocation,
                    handleError,
                    {
                        enableHighAccuracy: true,
                        maximumAge: 0,
                        timeout: 10000
                    }
                );

                // Cleanup function to remove watchPosition when component unmounts
                return () => navigator.geolocation.clearWatch(watchId);
            } else {
                console.error('Geolocation not supported by this browser.');
            }
        }
    }, [groupId, driverId]);

    return <div>Check console for driverId updates.</div>;
};

export default Home;
