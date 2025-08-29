import React, { useState, useEffect } from 'react';
import { Modal, Box, Button, IconButton } from '@mui/material';
import CloseOutlined from '@mui/icons-material/CloseOutlined';
import axios from 'axios';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const Ad = () => {
    const [open, setOpen] = useState(true); // Initially, set to true to open the modal
    const [ads, setAds] = useState([]);

    const handleClose = () => {
        setOpen(false); // Close the modal
    };

    useEffect(() => {
        const currentDate = new Date().toISOString().split("T")[0];
        const fetchRandomImages = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/ad/randomAd`, {
                    params: { currentDate }
                });
                setAds(response.data);
            } catch (error) {
                console.error('Error fetching random images:', error);
            }
        };

        fetchRandomImages();

        // Only load the ads once when the component mounts
    }, []); // Empty dependency array ensures it only runs once

    const settings = {
        dots: true,
        infinite: true,
        speed: 500, // speed of sliding
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true, // Enables autoplay
        autoplaySpeed: 3000, // Time between slides in milliseconds (3000ms = 3 seconds)
    };

    return (
        <Modal open={open}>
            <Box
                sx={{
                    position: 'fixed', // Position fixed to the bottom
                    bottom: 0, // Align to the bottom of the screen
                    left: '50%', // Center horizontally
                    transform: 'translateX(-50%)', // Center horizontally using translate
                    width: '100%', // Full width of the screen
                    maxWidth: '500px', // Make it a small rectangle
                    height: '150px', // Small height for the rectangle
                    backgroundColor: 'white',
                    padding: 2,
                    borderRadius: 2,
                    boxShadow: 3, // Optional: add shadow for better visibility
                }}
            >
                <Slider {...settings}>
                    {ads.map((item, index) => (
                        <div
                            key={index}
                            style={{
                                width: '100%',
                                height: '300px', // Adjust height as needed
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                backgroundColor: '#f9f9f9', // Optional: background for better contrast
                            }}
                        >
                            <a href={item.linkUrl} target="_blank" rel="noopener noreferrer">
                                <img
                                    crossorigin="anonymous"
                                    src={`http://localhost:8800/uploadFile/${encodeURIComponent(item.imagePath.split('/').pop())}`}
                                    alt={item.title}
                                    style={{
                                        maxWidth: '100%',
                                        maxHeight: '100%',
                                        objectFit: 'contain',
                                    }}
                                />
                            </a>
                        </div>
                    ))}
                </Slider>


                <Button
                    data-testid="learnMore"
                    color="secondary"
                    size="small"
                    onClick={handleClose}
                    sx={{ marginTop: 1 }}
                >
                    Learn More
                </Button>
                <IconButton
                    data-testid="closeButton"
                    size="small"
                    aria-label="close"
                    color="inherit"
                    onClick={handleClose}
                    sx={{ position: 'absolute', top: 10, right: 10 }}
                >
                    <CloseOutlined />
                </IconButton>
            </Box>
        </Modal>
    );
};

export default Ad;
