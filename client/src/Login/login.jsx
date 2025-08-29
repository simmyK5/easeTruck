import React, { useEffect, useState, useRef } from 'react';
import './login.css';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Typography, Box, Button, Backdrop, CircularProgress, Paper, Card, CardContent, IconButton, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import easeTruckOne from '/easeTruckOne.svg';
import easeTruckTwo from '/easeTruckTwo.svg';
import easeTruckFive from '/easeTruckFive.svg';
import easeTruckLogo from '/easeTruckLogo.svg';
import CelebrationIcon from "@mui/icons-material/Celebration";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import StarsIcon from "@mui/icons-material/Stars";
import Testimonial from "../About/testimonial";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";

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
  const videoRef = useRef(null);

  const navigate = useNavigate();
  const [password, setPassword] = useState(''); // Dynamically set password

  const fetchPasswordFromAuth0 = async () => {
    try {
      const claims = await getIdTokenClaims();
      const passwordClaim = claims['https://dev-28osh5shw2xy15j3.us.auth0.com/password']; // Replace with your custom claim key
      setPassword(passwordClaim); // Fallback if no claim is found
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
          ['technician', 'mechanic', 'admin', 'superAdmin'].includes(response.data.role))
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
        superAdmin: '/adminHomePage',
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
      if (!isAuthenticated || !user) return;
  
      const claims = await getIdTokenClaims();
      const accessToken = await getAccessTokenSilently();
  
      try {
        await axios.post(`${import.meta.env.VITE_API_BASE_URL}/backend/auth/register`, {
          email: user.email,
          password: 'Auth0', // Placeholder for hashing; Auth0 does actual auth
        }, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
  
        await checkSubscription(user.email, claims);
      } catch (err) {
        if (err.response?.status === 409) {
          console.log('User already exists, skipping registration');
          await checkSubscription(user.email, claims);
        } else {
          console.error('Error saving user:', err);
        }
      }
    };
  
    saveUser();
  }, [isAuthenticated, user]);
  
  



  useEffect(() => {
    const savedEmail = localStorage.getItem('user_email');
    const savedToken = localStorage.getItem('id_token');

    if (savedEmail && savedToken) {
      navigate('/profile');
    }
  }, [navigate]);

  if (isLoading) {
    return (
      <Backdrop
        open={true}
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backdropFilter: 'blur(6px)', // applies blur
          backgroundColor: 'transparent', // no tint
          zIndex: 1300,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          pointerEvents: 'auto', // block interactions
        }}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    );
  }



  const NextArrow = (props) => {
    const { onClick } = props;
    return (
      <IconButton
        onClick={onClick}
        sx={{
          position: 'absolute',
          top: '50%',
          right: -50, // outside the box
          zIndex: 2,
          color: 'black',
          transform: 'translateY(-50%)',
        }}
      >
        <ArrowForwardIos />
      </IconButton>
    );
  };

  const PrevArrow = (props) => {
    const { onClick } = props;
    return (
      <IconButton
        onClick={onClick}
        sx={{
          position: 'absolute',
          top: '50%',
          left: -50, // outside the box
          zIndex: 2,
          color: 'black',
          transform: 'translateY(-50%)',
        }}
      >
        <ArrowBackIos />
      </IconButton>
    );
  };

  const benefits = [
    {
      title: "Enhanced Security",
      description: "Detects when you're in danger—ensuring the right team is ready to assist immediately. We know when you're at risk.",
    },
    {
      title: "Employment Opportunities",
      description: "Creates jobs for drivers and boosts logistics efficiency. Drivers can upload CVs to be easily noticed by employers.",
    },
    {
      title: "Trucking Advertisements",
      description: "A space for trucking-related content providers and businesses to showcase their services.",
    },
    {
      title: "Effortless Invoice Management",
      description: "Manage your invoices effortlessly.",
    },
    {
      title: "Optimized Route Selection",
      description: "Chooses the shortest route to reduce fuel consumption—a major cost for logistics businesses.",
    },
  ];

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 2,
    slidesToScroll: 1,
    arrows: true,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      {
        breakpoint: 960,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  return (
    <Box className="container">
      <Box
        className="slogan-section"
        style={{ '--slogan-bg': `url(${easeTruckOne})` }}
      >
        <Box className="slogan-content">
          <Typography className="slogan-heading" variant="h4" >
            EaseTruck
          </Typography>
          <Typography variant="body1" className="slogan-text">
            Truck management system that serves as the central hub for overseeing truck operations, enhanced security, and reducing paperwork.
          </Typography>

          {!isAuthenticated && (
            <Button
              variant="contained"
              color="primary"
              onClick={loginWithRedirect}
              data-testid="LoginBtn"
            >
              Log in
            </Button>
          )}
        </Box>
      </Box>

      <Box className="benefitsSection">
        <Typography className="section-title" variant="h4" align="center" gutterBottom>
          The Benefits You Gain
        </Typography>

        <Box className="benefitsSlider">
          <Slider {...settings}>
            {benefits.map((benefit, index) => (
              <Box key={index} className="benefitCardWrapper">
                <Card className="benefitCard" elevation={4}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {benefit.title}
                    </Typography>
                    <Typography variant="body1">
                      {benefit.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Slider>
        </Box>
      </Box>

      <Box className="demoVideo">
        <Box className="celebratory-left">
          <Box
            className="howItWorks-section"
            style={{ '--howItWorks-bg': `url(${easeTruckFive})` }}
          >
            <CelebrationIcon className="floating-icon top-left" />
            <StarsIcon className="floating-icon top-right" />
            <EmojiEventsIcon className="floating-icon bottom-left" />
            <Typography className="demo-title" variant="h4" gutterBottom>
              How it Works
            </Typography>

          </Box>
        </Box>

        <Paper elevation={2} className="videoPaper">
          <video ref={videoRef} width="100%" controls>
            <source src="/signUp.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </Paper>
      </Box>


      <Box className="answer">
        <Box className="faqBox">
          <Accordion className="accordionBox">
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">What are our current plans?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography><strong>Vehicle Owner Plan:</strong> Manage trucks, drivers, invoices, real-time tracking, and more.</Typography>
              <Typography mt={2}><strong>Driver Plan:</strong> Manage invoices, receive alerts, and communicate with owners and mechanics.</Typography>
              <Typography mt={2}><strong>Ad Publisher Plan:</strong> Post and view advertisements.</Typography>
            </AccordionDetails>
          </Accordion>
        </Box>

        <Box className="faqBox">
          <Accordion className="accordionBox">
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">How does the invoicing process function?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                Easily manage your invoices by securely storing and accessing them anytime for upload or download.
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Box>

        <Box className="faqBox">
          <Accordion className="accordionBox">
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">How is the route selected?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                The system selects the shortest and most efficient route to reduce fuel costs.
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Box>
      </Box>

      <Box className="testimony">
        <Typography className="section-title" variant="h4" align="center" gutterBottom>
          What Our Clients Say
        </Typography>

        <Box className="testimonial-content">
          <Box className="testimonial-slider">
            <Testimonial />
          </Box>

          <Box className="testimonial-logo-wrapper" style={{ '--easeTruckLogo-bg': `url(${easeTruckLogo})` }}>

          </Box>
        </Box>

      </Box>

      <Box className="questions">
        <Box
          className="question-section"
          style={{ '--question-bg': `url(${easeTruckTwo})` }}
        >
          <Box className="question-content">
            <Typography className="question-heading" variant="h4" align="center" gutterBottom>
              Have question
            </Typography>
            <Typography className="question-text">Send email: easetruck@info.co.za</Typography>
            <Typography className="question-text">Call us: 078 798 2563</Typography>

          </Box>

        </Box>
      </Box>
    </Box>
  );
}
