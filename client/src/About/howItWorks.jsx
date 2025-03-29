import React, { useRef, useState, useEffect } from "react";
import { Box, Typography, Grid, Paper } from "@mui/material";

const HowItWorks = () => {
    const videoRef = useRef(null);
    const [progress, setProgress] = useState(0);

    // Define timestamps (in seconds)
    const timestamps = [
        { time: 50, label: "Intro" },
        { time: 200, label: "Step 1: Sign Up" },
        { time: 400, label: "Step 2: Verification" },
        { time: 600, label: "Step 3: Dashboard Overview" }
    ];

    // Update progress bar
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const updateProgress = () => {
            setProgress((video.currentTime / video.duration) * 100);
        };

        video.addEventListener("timeupdate", updateProgress);
        return () => video.removeEventListener("timeupdate", updateProgress);
    }, []);

    return (
        <Box className="container" sx={{ padding: 2 }}>
            <Typography variant="h4" align="center" gutterBottom>
                How it Works
            </Typography>
            <Grid container spacing={2}>
                <Grid item xs={12} md={8}>
                    <Paper elevation={2} sx={{ position: "relative" }}>
                        {/* Video */}
                        <video ref={videoRef} width="100%" controls>
                            <source src="/signUp.mp4" type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    </Paper>
                </Grid>

                {/* Timestamps Display */}
                <Grid item xs={12} md={4}>
                    <Paper
                        elevation={4} // Increased elevation for a more prominent shadow
                        sx={{
                            padding: "16px",
                            position: "relative", // Ensures it stays in its position while bringing it forward
                            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)", // Custom shadow effect
                            zIndex: 10, // Makes sure it is above other elements
                        }}
                    >
                        <Typography variant="h6">Timestamps</Typography>
                        {timestamps.map(({ time, label }) => (
                            <Typography key={time} variant="body1" sx={{ margin: "8px 0" }}>
                                {new Date(time * 1000).toISOString().substr(14, 5)} - {label}
                            </Typography>
                        ))}
                    </Paper>
                </Grid>

            </Grid>
        </Box>
    );
};

export default HowItWorks;


