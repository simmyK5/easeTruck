import React from 'react';
import {  Box, Typography, Container, Paper, Grid } from '@mui/material';
import './aboutUs.css';
import Testimonial from './testimonial';



const AboutUs = () => {


    return (
        <Container className="container">
            <Paper className="paper" elevation={3}>
                <Typography variant="h3" className="typography-title" gutterBottom>
                    About Us 
                </Typography>
                <Typography variant="body1" className="typography-body" paragraph>
                    Welcome to EaseTruck! We are dedicated to providing innovative solutions for truck
                    management, making logistics easier and more efficient. Our mission is to empower
                    businesses to manage their fleets seamlessly, optimize operations, and drive success
                    through advanced technology.
                </Typography>
            </Paper>

            <Box className="values-container">
                <Typography variant="h4" align="center" className="typography-title" gutterBottom>
                    Our Values
                </Typography>
                <Grid container spacing={4}>
                    <Grid item xs={12} md={4} className="grid-item">
                        <Paper elevation={2} className="paper">
                            <Typography variant="h6" className="typography-title" gutterBottom>
                                Innovation
                            </Typography>
                            <Typography variant="body2" className="typography-body">
                                We embrace technology and creativity to provide top-notch solutions.
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={4} className="grid-item">
                        <Paper elevation={2} className="paper">
                            <Typography variant="h6" className="typography-title" gutterBottom>
                                Commitment
                            </Typography>
                            <Typography variant="body2" className="typography-body">
                                Our team is dedicated to exceeding customer expectations every step of the way.
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={4} className="grid-item">
                        <Paper elevation={2} className="paper">
                            <Typography variant="h6" className="typography-title" gutterBottom>
                                Courage
                            </Typography>
                            <Typography variant="body2" className="typography-body">
                                We strive to face challenges head-on, embracing change and uncertainty with confidence.
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={4} className="grid-item">
                        <Paper elevation={2} className="paper">
                            <Typography variant="h6" className="typography-title" gutterBottom>
                                Trust
                            </Typography>
                            <Typography variant="body2" className="typography-body">
                                We build lasting relationships by being reliable, transparent, and respectful.
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>

            <Box className="team-section">
                <Typography variant="h4" align="center" className="typography-title" gutterBottom>
                    Our Team
                </Typography>
                <Typography variant="body1" align="center" className="typography-body" paragraph>
                    EaseTruck is powered by a passionate team of innovators and developers
                    working together to redefine the truck management experience.
                </Typography>
            </Box>
            <Box className="team-section">
                <Typography variant="h4" align="center" mt={5} fontWeight="bold">
                    What Our Clients Say
                </Typography>
                <Testimonial/>
            </Box>
        </Container>

    );

};


export default AboutUs;
