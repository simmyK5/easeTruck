import React, { useState } from 'react';
import { Container, Typography, Button, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import TotalInstallations from './totalInstallations';
import InstallationType from './installationType';
import InstallationProvince from './installationProvince';
import FeedbackType from './feedbackType';
import FeedbackStatus from './feedbackStatus';
import FeedbackRating from './feedbackRating';

const AdminDashboard = () => {
    const [period, setPeriod] = useState('today');
    const handleDownload = () => {
        // Implement your download logic here
    };




    return (
        <Container className="container">
            <div className="dashboard-header">
                <Typography variant="h4" gutterBottom>Real-Time Dashboard</Typography>
            </div>

            <div className="dashboard-form">
                <FormControl fullWidth data-testid="periodFormControl">
                    <InputLabel>Period</InputLabel>
                    <Select value={period} onChange={(e) => setPeriod(e.target.value)} data-testid="period">
                        <MenuItem value="today" data-testid="periodToday">Today</MenuItem>
                        <MenuItem value="week" data-testid="periodWeek">This Week</MenuItem>
                        <MenuItem value="month" data-testid="periodMonth">This Month</MenuItem>
                        <MenuItem value="4months" data-testid="periodFourMonth">Last 4 Months</MenuItem>
                        <MenuItem value="year" data-testid="periodYear">This Year</MenuItem>
                    </Select>
                </FormControl>
                <Button variant="contained" color="primary" onClick={handleDownload} style={{ marginTop: 16 }} data-testid="reportButton">
                    Download Report
                </Button>
            </div>

            { period && (
                <div className="graph-container">
                     <div className="graph-item">
                        <FeedbackType period={period} />
                    </div>
                    <div className="graph-item">
                        <FeedbackRating period={period} />
                    </div>
                    <div className="graph-item">
                        <FeedbackStatus period={period} />
                    </div>
                    <div className="graph-item">
                        <InstallationType period={period} />
                    </div>
                    <div className="graph-item">
                        <TotalInstallations period={period} />
                    </div>
                    <div className="graph-item">
                        <InstallationProvince period={period} />
                    </div>
                </div>

            )}

        </Container>
    );
};

export default AdminDashboard;

