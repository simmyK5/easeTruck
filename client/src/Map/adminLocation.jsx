import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import './map.css'; // Make sure this has styles for .map-container and .search-input
import { getAdminLocation } from '../services/socketService';
import axios from 'axios';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

const AdminLocation = () => {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const [driverLocations, setDriverLocations] = useState({});
    const [userLocation, setUserLocation] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Handle real-time location updates
    useEffect(() => {
        const handleLocationUpdate = async (data) => {
            const { latitude, longitude, serialNumber } = data;

            try {
                if (!driverLocations[serialNumber]?.firstname) {
                    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/truck/getDriver/${serialNumber}`);
                    const { firstname, lastname, numberplate } = response.data;

                    setDriverLocations((prev) => ({
                        ...prev,
                        [serialNumber]: {
                            latitude,
                            longitude,
                            firstname,
                            lastname,
                            numberplate
                        }
                    }));
                } else {
                    setDriverLocations((prev) => ({
                        ...prev,
                        [serialNumber]: {
                            ...prev[serialNumber],
                            latitude,
                            longitude
                        }
                    }));
                }
            } catch (error) {
                console.error('Failed to fetch driver info:', error);
            }
        };

        getAdminLocation(handleLocationUpdate);
    }, []);

    // Get user's current location
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                },
                (error) => {
                    console.error('Geolocation error:', error);
                    setUserLocation({
                        latitude: 24.6727,
                        longitude: -28.4793
                    });
                }
            );
        } else {
            setUserLocation({
                latitude: 24.6727,
                longitude: -28.4793
            });
        }
    }, []);

    // Initialize map
    useEffect(() => {
        if (map.current || !userLocation) return;

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [userLocation.longitude, userLocation.latitude],
            zoom: 8
        });

        map.current.addControl(new mapboxgl.NavigationControl());
    }, [userLocation]);

    // Filter drivers based on search input
    const filteredDrivers = Object.entries(driverLocations).filter(([serialNumber, driver]) => {
        const fullName = `${driver.firstname} ${driver.lastname}`.toLowerCase();
        const plate = driver?.numberplate?.toLowerCase() || '';
        return (
            fullName.includes(searchQuery) ||
            serialNumber.toLowerCase().includes(searchQuery) ||
            plate.includes(searchQuery)
        );
    });

    // Update map markers when driverLocations or searchQuery changes
    useEffect(() => {
        if (!map.current) return;

        const markers = filteredDrivers.map(([serialNumber, driver]) => {
            const marker = new mapboxgl.Marker()
                .setLngLat([driver.longitude, driver.latitude])
                .setPopup(
                    new mapboxgl.Popup().setHTML(`
                        <h3>${driver.firstname} ${driver.lastname}</h3>
                        <p>Serial: ${serialNumber}</p>
                        <p>Plate: ${driver.numberplate || 'Unknown'}</p>
                    `)
                )
                .addTo(map.current);
            return marker;
        });

        const bounds = new mapboxgl.LngLatBounds();
        filteredDrivers.forEach(([_, { latitude, longitude }]) => bounds.extend([longitude, latitude]));

        if (!bounds.isEmpty()) {
            map.current.fitBounds(bounds, { padding: 40 });
        } else if (userLocation) {
            map.current.flyTo({ center: [userLocation.longitude, userLocation.latitude], zoom: 5 });
        }

        return () => {
            markers.forEach(marker => marker.remove());
        };
    }, [filteredDrivers, userLocation]);

    return (
        <div>
            {/* UI Overlay - must come after the map div in the DOM or have higher z-index */}
            <div className="ui-overlay">
                <input
                    type="text"
                    placeholder="Search by name, numberplate, or serial"
                    onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
                    className="search-input"
                />

                <h2 style={{ color: 'black', marginLeft: 20 }}>Driver Locations</h2>
            </div>

            {/* Map Container */}
            <div ref={mapContainer} className="map-container" />
        </div>
    );

};

export default AdminLocation;
