import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import { Map, NavigationControl, GeolocateControl } from 'react-map-gl';
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
  const [fromAddressSearch, setFromAddressSearch] = useState(false);

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

  const drawRoute = useCallback(async (map, from, to) => {
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

      // Set and speak directions
      setSteps(routeData.legs[0].steps);
      console.log("see the steps", routeData.legs[0].steps);
      speakInstructionsWithDistance(routeData.legs[0].steps);

    } catch (error) {
      console.error('Error drawing route:', error);
    }
  }, []);


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
            countries: 'za',
          });

          fromGeocoderRef.current.on('result', (event) => {
            const coordinates = event.result.geometry.coordinates;
            setFromCoordinates(coordinates);
            mapInstance.flyTo({ center: coordinates, zoom: 13 });
            addMarker(mapInstance, coordinates, 'from');
            if (toCoordinates) {
              drawRoute(mapInstance, coordinates, toCoordinates);
            }
          });

          fromGeocoderRef.current.on('clear', () => {
            // If the search is cleared, set fromAddressSearch to false
            setFromAddressSearch(false);
          });

          const fromContainer = document.getElementById('from-geocoder');
          if (fromContainer) {
            fromContainer.appendChild(fromGeocoderRef.current.onAdd(mapInstance));
          }
        }


        // Geocoder for "To" location
        if (!toGeocoderRef.current) {
          toGeocoderRef.current = new MapboxGeocoder({
            accessToken: MAPBOX_TOKEN,
            mapboxgl: mapboxgl,
            placeholder: 'Search To Address...',
            marker: false,
            countries: 'za',
          });

          toGeocoderRef.current.on('result', (event) => {
            const coordinates = event.result.geometry.coordinates;
            setToCoordinates(coordinates);
            mapInstance.flyTo({ center: coordinates, zoom: 13 });
            addMarker(mapInstance, coordinates, 'to');
            if (toCoordinates) {
              drawRoute(mapInstance, coordinates, toCoordinates);
            }
            setFromAddressSearch(true);
          });

          const toContainer = document.getElementById('to-geocoder');
          if (toContainer) {
            toContainer.appendChild(toGeocoderRef.current.onAdd(mapInstance));
          }
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
    const maxRepeatCount = 2;
    let currentStepIndex = 0;

    const getCurrentLocation = () => {
      return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        } else {
          reject('Geolocation is not supported by this browser.');
        }
      });
    };

    const getDistanceBetweenPoints = (lat1, lon1, lat2, lon2) => {
      const R = 6371;
      const dLat = (lat2 - lat1) * (Math.PI / 180);
      const dLon = (lon2 - lon1) * (Math.PI / 180);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c * 1000;
    };

    const getNearestSteps = async () => {
      try {
        const position = await getCurrentLocation();
        const currentLat = position.coords.latitude;
        const currentLon = position.coords.longitude;

        const sortedSteps = steps
          .map((step, index) => {
            const stepLat = step.maneuver.location[1];
            const stepLon = step.maneuver.location[0];
            const distanceToStep = getDistanceBetweenPoints(currentLat, currentLon, stepLat, stepLon);
            return { index, distanceToStep, instruction: step.maneuver.instruction };
          })
          .sort((a, b) => a.distanceToStep - b.distanceToStep);

        return sortedSteps.slice(0, 3); // Top 3 nearest
      } catch (error) {
        console.error('Error getting location:', error);
        return [];
      }
    };

    const speakStep = (instruction, repeatCount = 0) => {
      return new Promise((resolve) => {
        const utterance = new SpeechSynthesisUtterance(instruction);

        utterance.onend = () => {
          if (repeatCount + 1 < maxRepeatCount) {
            setTimeout(() => {
              speakStep(instruction, repeatCount + 1).then(resolve);
            }, 1000);
          } else {
            resolve();
          }
        };

        window.speechSynthesis.speak(utterance);
      });
    };

    const speakNext = async () => {
      if (currentStepIndex >= steps.length) return;

      const nearestSteps = await getNearestSteps();
      for (let i = 0; i < nearestSteps.length; i++) {
        const step = nearestSteps[i];
        await speakStep(step.instruction);
        currentStepIndex = step.index + 1;
      }

      // Optionally repeat speakNext later if navigating in real-time
      // setTimeout(speakNext, 5000); 
    };

    speakNext();
  };


  const handleStop = () => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    console.log("do we have layer", map.getLayer('route'))
    console.log("do we have source", map.getSource('route'))
    // 1. Remove route layer and source
    if (map.getLayer('route')) {
      map.removeLayer('route');
    }
    if (map.getSource('route')) {
      map.removeSource('route');
    }

    // 2. Remove markers if added manually
    if (markerRefs.current) {
      Object.keys(markerRefs.current).forEach((key) => {
        if (markerRefs.current[key]) {
          markerRefs.current[key].remove();
          markerRefs.current[key] = null;
        }
      });
    }

    // 3. Stop speech synthesis
    console.log("speaker", window.speechSynthesis)
    if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
      window.speechSynthesis.cancel();
    }

    // 4. Clear coordinates or geocoder inputs
    setFromCoordinates(null);
    setToCoordinates(null);

    // Optional: Clear geocoder inputs if you want
    const fromInput = document.querySelector('#from-geocoder input');
    const toInput = document.querySelector('#to-geocoder input');
    if (fromInput) fromInput.value = '';
    if (toInput) toInput.value = '';
  };

  return (
    <div className="map-container">
      <div className="geocoder-wrapper">
        <div className="geocoder-container">
          <div id="from-geocoder" className="geocoder" />
          <div id="to-geocoder" className="geocoder to" />
        </div>
      </div>


      <Map
        ref={mapRef}
        initialViewState={{
          longitude: userLocation ? userLocation.longitude : 24.6727,
          latitude: userLocation ? userLocation.latitude : -28.4793,
          zoom: 5,
        }}
        style={{ width: '100%', height: '100%' }}
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
          <button className="stop-button" onClick={handleStop}>
            Stop
          </button>
        </div>
      )}
    </div>

  );

  /*return (
    <div className="map-container">
      <div className="geocoder-wrapper">
        <div id="from-geocoder" className="geocoder" />
        <div id="to-geocoder" className="geocoder to" />

      </div>


      <Map
        ref={mapRef}
        initialViewState={{
          longitude: userLocation ? userLocation.longitude : 24.6727,
          latitude: userLocation ? userLocation.latitude : -28.4793,
          zoom: 5,
        }}
        style={{ width: '100%', height: '100%' }}
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
          <button className="stop-button" onClick={handleStop}>Stop</button>

          <h3>Directions:</h3>
          <ul>
            {steps.map((step, index) => (
              <li key={index}>{step.maneuver.instruction}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );*/


};

export default MapWithSearch;
