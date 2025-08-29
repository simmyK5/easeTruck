import React, { useRef, useState, useEffect } from "react";
import {
    Box, Typography, Paper, Card, CardContent, Grid, IconButton, Accordion,
    AccordionSummary,
    AccordionDetails
} from "@mui/material";
import Testimonial from "./testimonial";
import './HowItWorks.css';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import { ArrowBackIos, ArrowForwardIos, Star, Celebration, EmojiEvents, EmojiEmotions, WbTwilight } from "@mui/icons-material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import HowItWorksLogo from '../logo/howItWorksLogo';
import easeTruckOne from '/easeTruckOne.svg';
import easeTruckTwo from '/easeTruckTwo.svg';
import easeTruckFive from '/easeTruckFive.svg';
import easeTruckLogo from '/easeTruckLogo.svg';
import CelebrationIcon from "@mui/icons-material/Celebration";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import StarsIcon from "@mui/icons-material/Stars";



const HowItWorks = () => {
    const videoRef = useRef(null);

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
                        <Typography className="question-text">Send email: easetruck@info.co.za </Typography>
                        <Typography className="question-text">Call us: 078 798 2563</Typography>

                    </Box>

                </Box>
            </Box>
        </Box>


    );
};

export default HowItWorks;


