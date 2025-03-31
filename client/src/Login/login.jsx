import React, { useEffect, useState } from 'react';
import './login.css';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Typography, Box, Card, CardContent, Grid, Button } from '@mui/material';
import MainLogo from '../logo/mainLogo';

export default function Login() {
  const {
    loginWithRedirect,
    logout,
    user,
    isAuthenticated,
    getIdTokenClaims,
    getAccessTokenSilently,
    isLoading,
  } = useAuth0();

  const navigate = useNavigate();
  const [password, setPassword] = useState(''); // Dynamically set password

  const fetchPasswordFromAuth0 = async () => {
    try {
      const claims = await getIdTokenClaims();
      const passwordClaim = claims['https://your-app-domain/password']; // Replace with your custom claim key
      setPassword(passwordClaim || 'fallbackPassword123'); // Fallback if no claim is found
    } catch (error) {
      console.error('Error fetching password from Auth0:', error);
    }
  };

  const checkSubscription = async (userEmail, token) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/auth/check-status/${userEmail}`, {
        headers: { Authorization: `Bearer ${token.__raw}` },
      });
        if (
          response.data &&
          response.data.subscriptionStatus === 'ACTIVE' &&
          response.data.termsAndConditions === false
        ) {
          await navigate('/editprofile'); // Navigate to editprofile
        } else if (
          response.data.subscriptionStatus === 'ACTIVE' ||
          (response.data.subscriptionId === 'No active subscription' &&
            ['technician', 'mechanic', 'admin'].includes(response.data.role))
        ) {
          await navigateToRolePage(userEmail, token); // Navigate based on role
        } else {
          console.warn('No active subscription or valid role found.');
          navigate('/profile'); // Navigate to profile
        }
      } catch (error) {
        console.error('Error checking subscription:', error);
        navigate('/profile');
      }
      
  };

  const navigateToRolePage = async (userEmail, token) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/auth/user-role/${userEmail}`, {
        headers: { Authorization: `Bearer ${token.__raw}` },
      });

      const userRole = response.data.role;
      const currentUsername = response.data.name;

      const roleToPathMap = {
        vehicleOwner: '/vehicleOwnerHomePage',
        driver: '/driverHomePage',
        mechanic: '/mechanicHomePage',
        adPublisher: '/adPublisherHomePage',
        technician: '/technicianHomePage',
        admin: '/adminHomePage',
      };

      const path = roleToPathMap[userRole] || '/profile';
      navigate(path, { state: { currentUsername } });
    } catch (error) {
      console.error('Error fetching user role:', error);
      navigate('/profile');
    }
  };

  useEffect(() => {
    const saveUser = async () => {
      if (isAuthenticated) {
        const token = await getIdTokenClaims();
        const accessToken = await getAccessTokenSilently();

        localStorage.setItem('auth0_id_token', token.__raw);
        localStorage.setItem('auth0_access_token', accessToken);
        localStorage.setItem('user_email', user.email);

        await fetchPasswordFromAuth0();

        const userData = { email: user.email, password };

        await axios.post(`${import.meta.env.VITE_API_BASE_URL}/backend/auth/register`, userData, {
          headers: { Authorization: `Bearer ${token.__raw}` },
        });

        checkSubscription(user.email, token);
      }
    };

    saveUser();
  }, [isAuthenticated, getIdTokenClaims, user, navigate,checkSubscription,fetchPasswordFromAuth0,getAccessTokenSilently,password]);

  useEffect(() => {
    const savedEmail = localStorage.getItem('user_email');
    const savedToken = localStorage.getItem('id_token');

    if (savedEmail && savedToken) {
      navigate('/profile');
    }
  }, [navigate]);

  if (isLoading) return <div>Loading...</div>;

  return (
    <Box sx={{ textAlign: 'center', padding: '20px' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
        <MainLogo sx={{ width: 100, height: 100, mb: 2 }} />
      </Box>
      <Typography variant="subtitle1" sx={{ marginBottom: '20px', display: 'block' }}>
        Truck management system that serves as the central hub for overseeing truck operations and reducing paperwork.
      </Typography>

      {!isAuthenticated ? (
        <Button variant="contained" color="primary" onClick={loginWithRedirect} data-testid="LoginBtn">
          Log in
        </Button>
      ) : (
        <Box sx={{ marginTop: '20px', textAlign: 'center' }}>
          <Typography variant="h6">Welcome, {user.nickname}</Typography>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => logout({ returnTo: window.location.origin })}
            sx={{ marginTop: '10px' }}
            data-testid="LogOutBtn"
          >
            Log out
          </Button>
        </Box>
      )}

      <Box sx={{ flexGrow: 1, padding: '20px' }}>
        <Grid container spacing={2}>
          {[
            { title: 'Easy way to manage trucks', text: 'Provides an easy way to manage trucks and their relevant information.' },
            { title: 'Track driver’s driving', text: 'Track the driver and reward them based on their driving.' },
            { title: 'Promotes fuel efficiency', text: 'Reduce fuel consumption by managing factors increasing fuel usage.' },
            { title: 'Enhances safety', text: 'Detecting dangers automatically.' },
          ].map((card, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  height: '100%',
                  boxShadow: 3,
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': { transform: 'translateY(-10px)', boxShadow: 6 },
                }}
              >
                <CardContent>
                  <Typography variant="h5" sx={{ marginBottom: '10px' }}>
                    {card.title}
                  </Typography>
                  <Typography variant="body1">{card.text}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}
