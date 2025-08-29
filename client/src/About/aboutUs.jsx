import React, { useState } from 'react';
import { Box, Typography, Container, Paper, Grid } from '@mui/material';
import './aboutUs.css';
import easeTruckSeven from '/easeTruckSeven.svg';
import easeTruckThree from '/easeTruckThree.svg';
import easeTruckLogo from '/easeTruckLogo.svg';


const AboutUs = () => {
    const [activeIndex, setActiveIndex] = useState(0);

    const values = [
        {
            title: 'Innovation',
            description: 'We embrace technology and creativity to provide top-notch solutions.',
        },
        {
            title: 'Commitment',
            description: ' Our team is dedicated to exceeding customer expectations every step of the way.',
        },
        {
            title: 'Courage',
            description: ' We strive to face challenges head-on, embracing change and uncertainty with confidence.',
        },
        ,
        {
            title: 'Trust',
            description: ' We build lasting relationships by being reliable, transparent, and respectful.',
        },
        {
            title: 'Security',
            description: 'Safety is our priority with advanced security features.',
        },

    ];

    return (
        <Container className="container">
            <Box
                className="aboutUs-section"
                style={{ '--aboutUs-bg': `url(${easeTruckThree})` }}
            >
                <Box className="aboutUs-overlay">
                    <Typography variant="h3" className="typography-title" gutterBottom>
                        About Us
                    </Typography>
                    <Typography variant="h6" className="typography-body" >
                        We are a tech-driven company focused on transforming truck and fleet management. By blending innovation with practical logistics expertise, we streamline operations, reduce inefficiencies, and help businesses thrive. From real-time tracking to smart automation, we create tools that empower logistics companies to stay ahead.
                    </Typography>
                </Box>
            </Box>

            <Box className="mission-overlay">
                <Typography variant="h3" className="mission-title" gutterBottom>
                    Our Mission
                </Typography>

                <Box className="mission-content">
                    <Typography variant="h6" className="mission-body">
                        Our mission is to lead the evolution of AI-powered systems by crafting intelligent, intuitive solutions that serve both individuals and businesses...
                    </Typography>

                    <Box className="mission-image-wrapper">
                        <img src={easeTruckLogo} alt="Mission" className="mission-image" />
                    </Box>
                </Box>
            </Box>



            <Box className="puzzle-section">
                <Typography variant="h4" className="puzzle-title">Our Core Values</Typography>
                <Box className="puzzle-layout">
                    <Box className="puzzle-grid">
                        {values.map((value, index) => (
                            <Box
                                key={index}
                                className={`puzzle-piece piece-${index} ${activeIndex === index ? 'active' : ''}`}
                                onClick={() => setActiveIndex(index)}
                            >
                                🧩
                            </Box>
                        ))}
                    </Box>
                    <Paper elevation={3} className="value-display">
                        <Typography variant="h5" className="value-title">{values[activeIndex].title}</Typography>
                        <Typography className="value-description">{values[activeIndex].description}</Typography>
                    </Paper>
                </Box>
            </Box>

            <Box
                className="team-section"
                style={{ '--team-bg': `url(${easeTruckSeven})` }}
            >
                <Typography className="team-heading" variant="h4" align="center" gutterBottom>
                    Our Team
                </Typography>

                <Box className="team-layout">
                    <Box className="team-content">
                        <Typography variant="h6" className="team-text">
                            EaseTruck is powered by a passionate team of innovators and developers
                            working together to redefine the truck management experience.
                        </Typography>
                    </Box>

                    <Box className="team-image-wrapper">
                        <img src={easeTruckSeven} alt="Team" className="team-image" />
                    </Box>
                </Box>
            </Box>


        </Container>

    );

};


export default AboutUs;
