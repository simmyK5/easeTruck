import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import './map.css';
import { getAdminLocation } from '../services/socketService';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

const VehicleOwnerMap = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [driverLocations, setDriverLocations] = useState({});
  const [userLocation, setUserLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth0();
  const [vehicleOwnerId, setVehicleOwnerId] = useState('');
  const [ownedSerials, setOwnedSerials] = useState([]);

  // Fetch vehicle owner ID and driver serials
  useEffect(() => {
    const fetchUserAndDrivers = async () => {
      try {
        const userRes = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/backend/user/users/${user.email}`
        );
        const ownerId = userRes.data._id;
        setVehicleOwnerId(ownerId);
        console.log("tired",ownerId)

        const driversRes = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/backend/truck/getDriversByOwner/${ ownerId }`
        );

        const serials = driversRes.data.map((driver) => driver.serialNumber);
        setOwnedSerials(serials);
      } catch (error) {
        console.error('Error fetching vehicle owner and drivers:', error);
      }
    };

    if (user?.email) {
      fetchUserAndDrivers();
    }
  }, [user]);

  // Handle real-time location updates
  useEffect(() => {
    const handleLocationUpdate = async (data) => {
      const { latitude, longitude, serialNumber } = data;

      // Only process serial numbers assigned to this vehicle owner
      if (!ownedSerials.includes(serialNumber)) return;

      try {
        if (!driverLocations[serialNumber]?.firstname) {
          const response = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/backend/truck/getDriver/${serialNumber}`
          );
          const { firstname, lastname, numberplate } = response.data;

          setDriverLocations((prev) => ({
            ...prev,
            [serialNumber]: {
              latitude,
              longitude,
              firstname,
              lastname,
              numberplate,
            },
          }));
        } else {
          setDriverLocations((prev) => ({
            ...prev,
            [serialNumber]: {
              ...prev[serialNumber],
              latitude,
              longitude,
            },
          }));
        }
      } catch (error) {
        console.error('Failed to fetch driver info:', error);
      }
    };

    getAdminLocation(handleLocationUpdate);
  }, [ownedSerials, driverLocations]);

  // Get current user geolocation
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
          setUserLocation({ latitude: -26.2041, longitude: 28.0473 }); // Johannesburg fallback
        }
      );
    } else {
      setUserLocation({ latitude: -26.2041, longitude: 28.0473 });
    }
  }, []);

  // Initialize the map
  useEffect(() => {
    if (map.current || !userLocation) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [userLocation.longitude, userLocation.latitude],
      zoom: 8,
    });

    map.current.addControl(new mapboxgl.NavigationControl());
  }, [userLocation]);

  // Filter drivers based on search input
  const filteredDrivers = Object.entries(driverLocations).filter(
    ([serialNumber, driver]) => {
      const fullName = `${driver.firstname} ${driver.lastname}`.toLowerCase();
      const plate = driver?.numberplate?.toLowerCase() || '';
      return (
        fullName.includes(searchQuery) ||
        serialNumber.toLowerCase().includes(searchQuery) ||
        plate.includes(searchQuery)
      );
    }
  );

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
      map.current.flyTo({
        center: [userLocation.longitude, userLocation.latitude],
        zoom: 5,
      });
    }

    return () => {
      markers.forEach((marker) => marker.remove());
    };
  }, [filteredDrivers, userLocation]);

  return (
    <div>
      <div className="ui-overlay">
        <input
          type="text"
          placeholder="Search by name, numberplate, or serial"
          onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
          className="search-input"
        />
        <h2 style={{ color: 'black', marginLeft: 20 }}>Driver Locations</h2>
      </div>
      <div ref={mapContainer} className="map-container" />
    </div>
  );
};

export default VehicleOwnerMap;
