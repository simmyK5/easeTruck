import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { listenForLocationUpdates, joinGroup } from '../services/socketService';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';
import './map.css'; // Import the CSS file

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN; // Ensure the token is available

const VehicleOwnerMap = () => {
  const [supervisorId, setSupervisorId] = useState('');
  const { user } = useAuth0();
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [driverLocations, setDriverLocations] = useState({});
  const [userLocation, setUserLocation] = useState(null);
  const groupId = `supervisor-${supervisorId}`; // Unique groupId for each supervisor

  useEffect(() => {
    if (user && user.email) {
      fetchUserDetails(user.email);
    }
  }, [user]);

  const fetchUserDetails = async (email) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/user/users/${email}`);
      setSupervisorId(response.data._id);
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  useEffect(() => {
    if (groupId) {
      joinGroup(groupId);
    }

    const handleLocationUpdate = (data) => {
      console.log(data)
      const { driverId, location } = data;
      setDriverLocations((prevLocations) => ({
        ...prevLocations,
        [driverId]: location,
      }));
    };

    // Subscribe to location updates and get the cleanup function
    const cleanup = listenForLocationUpdates(handleLocationUpdate);

    return () => {
      if (typeof cleanup === 'function') {
        cleanup(); // Cleanup the listener when component unmounts
      } else {
        console.warn("Cleanup function is not defined.");
      }
    };
  }, [groupId]);

  useEffect(() => {
    // Get the user's location on mount
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting user location:', error);
          // Fallback to a default location if geolocation fails
          setUserLocation({
            latitude: 37.8,
            longitude: -96,
          });
        }
      );
    } else {
      console.log('Geolocation is not supported by this browser.');
      // Fallback to a default location if geolocation is not supported
      setUserLocation({
        latitude: 37.8,
        longitude: -96,
      });
    }
  }, []);

  useEffect(() => {
    if (map.current) return; // Initialize map only once

    if (userLocation) {
      // Initialize the Mapbox map
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11', // Choose your map style
        center: [userLocation.longitude, userLocation.latitude], // Default center [lng, lat]
        zoom: 5, // Default zoom level
      });

      // Add navigation controls (zoom buttons)
      map.current.addControl(new mapboxgl.NavigationControl());
    }
  }, [userLocation]);

  useEffect(() => {
    if (!map.current) return; // Ensure the map is initialized

    // Clear existing markers
    const markers = Object.keys(driverLocations).map(driverId => {
      const location = driverLocations[driverId];
      const marker = new mapboxgl.Marker()
        .setLngLat([location.longitude, location.latitude])
        .setPopup(new mapboxgl.Popup().setHTML(`<h3>Driver ${driverId}</h3>`)) // Add a popup for each marker
        .addTo(map.current);

      return marker;
    });

    // Calculate bounds for the markers
    const bounds = new mapboxgl.LngLatBounds();
    Object.values(driverLocations).forEach(location => {
      bounds.extend([location.longitude, location.latitude]);
    });

    // Fit the map to the bounds of the markers
    if (bounds.isEmpty()) {
      map.current.flyTo({ center: [userLocation.longitude, userLocation.latitude], zoom: 5 }); // Default center if no markers
    } else {
      map.current.fitBounds(bounds, { padding: 20 });
    }

    // Cleanup markers on map if needed
    return () => {
      markers.forEach(marker => marker.remove()); // Cleanup markers when component unmounts or updates
    };
  }, [driverLocations, userLocation]);

  return (
    <div>
      <div ref={mapContainer} className="map-container" />
      <h2>Driver Locations</h2>
      <ul>
        {Object.entries(driverLocations).map(([driverId, location]) => (
          <li key={driverId}>
            Driver {driverId}: Latitude: {location.latitude}, Longitude: {location.longitude}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default VehicleOwnerMap;
