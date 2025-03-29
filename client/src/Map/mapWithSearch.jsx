import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import {Map, NavigationControl, GeolocateControl } from 'react-map-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import 'mapbox-gl/dist/mapbox-gl.css';
import './map.css'; // Import the CSS file
import axios from 'axios'; // Ensure you import axios if you use it
import { useAuth0 } from '@auth0/auth0-react';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

const MapWithSearch = () => {
  const { user } = useAuth0();
  const mapRef = useRef(null);
  const [fromCoordinates, setFromCoordinates] = useState(null);
  const [toCoordinates, setToCoordinates] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [steps, setSteps] = useState([]);
  const fromGeocoderRef = useRef(null);
  const toGeocoderRef = useRef(null);
  const markerRefs = useRef({ from: null, to: null }); // To store markers
  const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
  const [supervisorId, setSupervisorId] = useState('');

  useEffect(() => {
    if (user && user.email) {
      fetchUserDetails(user.email);
    }
  }, [user]);

  const fetchUserDetails = async (email) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/user/users/${email}`);
      setSupervisorId(response.data.vehicleOwnerId);
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };


  const drawRoute = async (map, from, to) => {
    try {
      const response = await axios.get(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${from[0]},${from[1]};${to[0]},${to[1]}?steps=true&geometries=geojson&access_token=${MAPBOX_TOKEN}`
      );

      const routeData = response.data.routes[0];

      const routeGeoJSON = {
        type: 'Feature',
        geometry: routeData.geometry,
      };

      if (map.getSource('route')) {
        map.getSource('route').setData(routeGeoJSON);
      } else {
        map.addLayer({
          id: 'route',
          type: 'line',
          source: {
            type: 'geojson',
            data: routeGeoJSON,
          },
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': '#3887be',
            'line-width': 5,
            'line-opacity': 0.75,
          },
        });
      }

      setSteps(routeData.legs[0].steps);
    } catch (error) {
      console.error('Error drawing route:', error);
    }
  };

  useEffect(() => {
    const initializeMap = () => {
      const mapInstance = mapRef.current?.getMap();

      if (mapInstance) {
        // Geocoder for "From" location
        if (!fromGeocoderRef.current) {
          fromGeocoderRef.current = new MapboxGeocoder({
            accessToken: MAPBOX_TOKEN,
            mapboxgl: mapboxgl,
            placeholder: 'Search From Address...',
            marker: false,
          });

          fromGeocoderRef.current.on('result', (event) => {
            const coordinates = event.result.geometry.coordinates;
            setFromCoordinates(coordinates);
            mapInstance.flyTo({ center: coordinates, zoom: 13 });
            addMarker(mapInstance, coordinates, 'from');
            // If "To" coordinates are already set, redraw the route
            if (toCoordinates) {
              drawRoute(mapInstance, coordinates, toCoordinates);
            }
          });

          mapInstance.addControl(fromGeocoderRef.current, 'top-left');
        }

        // Geocoder for "To" location
        if (!toGeocoderRef.current) {
          toGeocoderRef.current = new MapboxGeocoder({
            accessToken: MAPBOX_TOKEN,
            mapboxgl: mapboxgl,
            placeholder: 'Search To Address...',
            marker: false,
          });

          toGeocoderRef.current.on('result', (event) => {
            const coordinates = event.result.geometry.coordinates;
            setToCoordinates(coordinates);
            mapInstance.flyTo({ center: coordinates, zoom: 13 });
            addMarker(mapInstance, coordinates, 'to');
            // Redraw the route whenever the destination changes
            if (fromCoordinates) {
              drawRoute(mapInstance, fromCoordinates, coordinates);
            }
          });

          mapInstance.addControl(toGeocoderRef.current, 'top-left');
        }
      }
    };

    const interval = setInterval(() => {
      if (mapRef.current) {
        initializeMap();
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [MAPBOX_TOKEN, toCoordinates, fromCoordinates, drawRoute]);

  useEffect(() => {
    // Get the user's location on mount
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setUserLocation(newLocation);
        },
        (error) => {
          console.error('Error getting user location:', error);
          // Fallback to a default location if geolocation fails
          setUserLocation({
            latitude: -30.5595,
            longitude: 22.9375,
          });
        }
      );
    } else {
      console.log('Geolocation is not supported by this browser.');
      // Fallback to a default location if geolocation is not supported
      setUserLocation({
        latitude: -30.5595,
        longitude: 22.9375,
      });
    }
  }, []);

  useEffect(() => {
    if (fromCoordinates && toCoordinates) {
      const mapInstance = mapRef.current?.getMap();
      if (mapInstance) {
        drawRoute(mapInstance, fromCoordinates, toCoordinates);
      }
    }
  }, [fromCoordinates, toCoordinates, drawRoute]);

  const addMarker = (map, coordinates, type) => {
    // Remove existing marker if it exists
    if (markerRefs.current[type]) {
      markerRefs.current[type].remove(); // Remove the previous marker
    }

    // Create and add the new marker
    const marker = new mapboxgl.Marker({ color: type === 'from' ? 'blue' : 'red' })
      .setLngLat(coordinates)
      .addTo(map);

    // Update the marker reference
    markerRefs.current[type] = marker;
  };


  const speakInstructionsWithDistance = (steps) => {
    const filteredSteps = steps.filter((step) => step.distance <= 100);
    const limitedSteps = filteredSteps.slice(0, 3);

    const utterNextInstruction = (index) => {
      if (index >= limitedSteps.length) return;

      const step = limitedSteps[index];
      const distance = step.distance; // Distance in meters
      const instruction = step.maneuver.instruction;

      const speech = new SpeechSynthesisUtterance(
        `In ${Math.round(distance)} meters, ${instruction}`
      );

      speech.onend = () => {
        // Move to the next instruction after the current one finishes
        utterNextInstruction(index + 1);
      };

      window.speechSynthesis.speak(speech);
    };

    utterNextInstruction(0); // Start with the first instruction
  };

  return (
    <div className="map-container">
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: userLocation ? userLocation.longitude : -30.5595,
          latitude: userLocation ? userLocation.latitude : 22.9375,
          zoom: 3,
        }}
        style={{ width: '100%', height: '500px' }}
        mapStyle="mapbox://styles/mapbox/streets-v11"
        mapboxAccessToken={MAPBOX_TOKEN}
      >
        <NavigationControl position="top-right" />
        <GeolocateControl
          position="top-right"
          trackUserLocation
          onGeolocate={(position) => {
            const { latitude, longitude } = position.coords;
            setUserLocation({ latitude, longitude });
          }}
        />
      </Map>
      {steps.length > 0 && (
        <div className="directions">
          <h3>Directions:</h3>
          <ul>
            {steps.map((step, index) => (
              <li key={index}>{step.maneuver.instruction}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MapWithSearch;
