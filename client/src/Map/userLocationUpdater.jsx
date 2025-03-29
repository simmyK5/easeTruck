import React from 'react'

function UserLocationUpdater() {
  return (
    <h1>Yebo</h1>
  )
}

export default UserLocationUpdater


/*import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';
import { emitLocationUpdate } from '../services/socketService';

const UserLocationUpdater = ({ children }) => {
  const { user, isAuthenticated } = useAuth0();
  const [userLocation, setUserLocation] = useState(null);
  const [supervisorId, setSupervisorId] = useState('');
  const [driverId, setDriverId] = useState('');
  const [userRole, setUserRole] = useState('');
  const groupId = `supervisor-${supervisorId}`;

  useEffect(() => {
    if (isAuthenticated && user && user.email) {
      fetchUserDetails(user.email);
    }
  }, [isAuthenticated, user]);

  const fetchUserDetails = async (email) => {
    console.log('ijuba')
    try {
      console.log("is it email",email)
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/user/users/${email}`, {
        headers: {
          'Cache-Control': 'no-cache', // Use Cache-Control instead of Pragma
        },
      });
      console.log("lor response",response.data)
      setSupervisorId(response.data.vehicleOwnerId);
      setDriverId(response.data._id);
      setUserRole(response.data.userRole);
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  useEffect(() => {
    console.log("userRole",userRole)
    console.log("groupId",groupId)
    console.log("userLocation",userLocation)
    console.log("driverId",driverId)

    if (userRole === 'driver' && groupId && userLocation && driverId) {
      emitLocationUpdate(groupId, driverId, userLocation);
    }
  }, [userRole, groupId, userLocation, driverId]);

  useEffect(() => {
    if (userRole === 'driver') {
      // Get the user's location on mount and continuously update it
      if (navigator.geolocation) {
        const watchId = navigator.geolocation.watchPosition(
          (position) => {
            const newLocation = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            };
            setUserLocation(newLocation);
          },
          (error) => {
            console.error('Error getting user location:', error);
          }
        );

        return () => navigator.geolocation.clearWatch(watchId);
      } else {
        console.log('Geolocation is not supported by this browser.');
      }
    }
  }, [userRole]);

  return <>{children}</>;
};

export default UserLocationUpdater;
*/