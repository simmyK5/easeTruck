import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper } from "@mui/material";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import axios from 'axios';
import "swiper/css";
import "swiper/css/pagination";
const Testimonial = () => {
    const [testimonials, setTestimonials] = useState([]);

    

    useEffect(() => {
        const fetchTestimonials = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/feedback/randomTestimonials`);
                setTestimonials(response.data);
            } catch (error) {
                console.error('Error fetching testimonials:', error);
            }
        };

        fetchTestimonials();

        // Only load the ads once when the component mounts
    }, []); // Empty dependency array ensures it only runs once
    return (
        <Box sx={{ width: "100%", maxWidth: 600, mx: "auto", mt: 4 }}>
            <Swiper
                modules={[Pagination, Autoplay]}
                pagination={{ clickable: true }}
                autoplay={{ delay: 3000 }}
                loop={true}
                spaceBetween={30}
            >
                {testimonials.map((testimonial, index) => (
                    <SwiperSlide key={index}>
                        <Paper elevation={3} sx={{ p: 4, textAlign: "center", borderRadius: 2 }}>
                            <Typography variant="h6" fontWeight="bold">
                                {testimonial.fullname}
                            </Typography>
                            <Typography variant="subtitle2" color="text.secondary">
                                {testimonial.role}
                            </Typography>
                            <Typography variant="body1" mt={2} fontStyle="italic">
                                "{testimonial.description}"
                            </Typography>
                        </Paper>
                    </SwiperSlide>
                ))}
            </Swiper>
        </Box>
    );
};

export default Testimonial;