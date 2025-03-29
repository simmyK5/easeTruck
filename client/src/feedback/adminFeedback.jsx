import React, { useState, useEffect } from 'react';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import axios from 'axios';
import { DeleteOutline, VisibilityOutlined } from '@mui/icons-material';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Box, Typography } from '@mui/material';
import { useAuth0 } from '@auth0/auth0-react';
import Rating from '@mui/material/Rating';
import './adminFeedback.css';
import EmailIcon from '@mui/icons-material/Email';

const AdminFeedback = () => {
    const [rows, setRows] = useState([]);
    const [open, setOpen] = useState(false);
    const [feedbackData, setFeedbackData] = useState({
        _id: '',
        fullname: '',
        email: '',
        subject: '',
        description: '',
        overallExperience: '',
        overallExperienceInfo: '',
        usability: '',
        usabilityInfo: '',
        performance: '',
        performanceInfo: '',
        design: '',
        designInfo: '',
        features: '',
        featuresInfo: '',
        support: '',
        supportInfo: ''
    });
    const [searchText, setSearchText] = useState('');
    const [filteredRows, setFilteredRows] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const { user } = useAuth0();
    const [emailOpen, setEmailOpen] = useState(false);
    const [emailData, setEmailData] = useState({ to: '', subject: '', body: '' });

    useEffect(() => {
        fetchItems();
    }, []);

    useEffect(() => {
        setFilteredRows(
            rows.filter((row) =>
                row.fullname.toLowerCase().includes(searchText.toLowerCase()) ||
                row.email.toLowerCase().includes(searchText.toLowerCase()) ||
                row.subject.toLowerCase().includes(searchText.toLowerCase()) ||
                row.description.toLowerCase().includes(searchText.toLowerCase()) ||
                row.overallExperience.toLowerCase().includes(searchText.toLowerCase()) ||
                row.overallExperienceInfo.toLowerCase().includes(searchText.toLowerCase()) ||
                row.usability.toLowerCase().includes(searchText.toLowerCase()) ||
                row.usabilityInfo.toLowerCase().includes(searchText.toLowerCase()) ||
                row.performance.toLowerCase().includes(searchText.toLowerCase()) ||
                row.performanceInfo.toLowerCase().includes(searchText.toLowerCase()) ||
                row.design.toLowerCase().includes(searchText.toLowerCase()) ||
                row.designInfo.toLowerCase().includes(searchText.toLowerCase()) ||
                row.features.toLowerCase().includes(searchText.toLowerCase()) ||
                row.featuresInfo.toLowerCase().includes(searchText.toLowerCase()) ||
                row.support.toLowerCase().includes(searchText.toLowerCase()) ||
                row.supportInfo.toLowerCase().includes(searchText.toLowerCase())
            )
        );
    }, [searchText, rows]);

    const fetchItems = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/feedback/adminFeedback`);
            setFeedbackData(response.data);
            setRows(response.data);
        } catch (error) {
            console.error('Error fetching drivers:', error);
        }
    };

    const handleDeleteItem = async (id) => {
        try {
            await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/backend/feedback/${id}`);
            fetchItems(); // Refresh data after deletion
        } catch (error) {
            console.error('Error deleting driver:', error);
        }
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFeedbackData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleRatingChange = (name, value) => {
        setFeedbackData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await axios.put(`${import.meta.env.VITE_API_BASE_URL}/backend/feedback/${feedbackData._id}`, feedbackData);
            }
            fetchItems(); // Refresh data after adding/editing
            handleClose();
        } catch (error) {
            console.error('Error submitting driver form:', error);
        }
    };


    const handleView = (id) => {
        const item = rows.find((row) => row._id === id._id);
        setIsEditing("view");
        setFeedbackData(item);
        setOpen(true);
    };

    const getEmailBody = (subject, description) => {
        switch (subject.toLowerCase()) {
            case 'complaint':
                return `Hello,\n\nRegarding your complaint: ${description}\n\nWe are sorry to hear that you had an issue. We will look into it and get back to you shortly.\n\nBest regards,\nEaseTruck`;
            case 'enquiry':
                return `Hello,\n\nRegarding your enquiry: ${description}\n\nThank you for reaching out to us. We will get back to you with the information you need as soon as possible.\n\nBest regards,\nEaseTruck`;
            case 'support':
                return `Hello,\n\nRegarding your support request: ${description}\n\nThank you for contacting support. We will assist you with your issue shortly.\n\nBest regards,\nEaseTruck`;
            default:
                return `Hello,\n\nRegarding your feedback: ${description}\n\nThank you for reaching out to us.\n\nBest regards,\nEaseTruck`;
        }
    };

    const handleReply = (id) => {
        const item = rows.find((row) => row._id === id);
        if (item) {
            setEmailData({
                to: item.email,
                subject: `Re: ${item.subject}`,
                body: getEmailBody(item.subject, item.description)
            });
            setEmailOpen(true);
        } else {
            console.error('Item not found for reply');
        }
    };

    const handleEmailClose = () => {
        setEmailOpen(false);
    };

    const handleEmailChange = (e) => {
        const { name, value } = e.target;
        setEmailData((prevEmailData) => ({
            ...prevEmailData,
            [name]: value,
        }));
    };

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        try {
            const { to, subject, body } = emailData;
            const templateParams = {
                to_name: to,
                from_name: user.name, // You can use a custom name for 'from'
                subject: subject,
                message: body,
            };
    
            // Prepare the payload for the request
            const payload = {
                service_id:import.meta.env.REACT_APP_SERVICE_ID,    // Service ID
                template_id: import.meta.env.VITE_TEMPLATE_ID,  // Template ID
                user_id: import.meta.env.VITE_PUBLIC_KEY,      // Public Key (this acts as the user ID)
                template_params: templateParams,                 // Template Parameters (from the emailData)
            };
    
            // Make POST request to EmailJS API endpoint
            const response = await axios.post(
                'https://api.emailjs.com/api/v1.0/email/send', 
                payload,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
            console.log("no response is response")
    
            console.log('Email successfully sent!', response.data);
            
            // Track the email trail
            await axios.post(`${import.meta.env.VITE_API_BASE_URL}/backend/email/trail`, {
                to: to,
                from: user.email,
                subject: subject,
                message: body,
            });
            console.log("saving that properly")
    
            handleEmailClose();
        } catch (error) {
            console.error('Error sending email:', error);
        }
    };

    const columns = [
        { field: 'fullname', headerName: 'Full Name', width: 280, editable: true },
        { field: 'email', headerName: 'Email', width: 250, editable: true },
        { field: 'subject', headerName: 'Subject', width: 130, editable: true },
        { field: 'description', headerName: 'Description', width: 440, editable: true },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 150,
            renderCell: (params) => (
                <div>
                    <GridActionsCellItem icon={<DeleteOutline />} label="Delete" onClick={() => handleDeleteItem(params.row._id)} data-testid="deleteBtn"/>
                    <GridActionsCellItem icon={<VisibilityOutlined />} label="View" onClick={() => handleView(params.row)} data-testid="viewBtn"/>
                    <GridActionsCellItem icon={<EmailIcon />} label="Reply" onClick={() => handleReply(params.row._id)} data-testid="replyButton"/>
                </div>
            ),
        }
    ];

    const DataGridStyling = {
        '& .MuiDataGrid-columnHeaderTitle': {
            fontSize: '1.2rem',
            fontWeight: 'bold',
            color: 'black',
        },
    };

    return (
        <div>
            <h1>Admin Feedback Page</h1>
            <div style={{ height: 600, width: '100%' }}>
                <TextField
                    label="Search"
                    variant="outlined"
                    fullWidth
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    data-testid="search"
                />
                <DataGrid
                    rows={filteredRows}
                    columns={columns}
                    getRowId={(row) => row._id}
                    initialState={{
                        pagination: {
                            paginationModel: { page: 0, pageSize: 5 },
                        },
                    }}
                    pageSizeOptions={[5, 10, 25]}
                    checkboxSelection
                    disableRowSelectionOnClick
                    sx={DataGridStyling}
                    data-testid="dataGrid"
                />
            </div>

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Feedback Form</DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent>
                        <TextField
                            label="Full Name"
                            name="fullname"
                            value={feedbackData.fullname}
                            onChange={handleChange}
                            fullWidth
                            required
                            InputProps={{
                                readOnly: isEditing === "view",
                            }}
                            data-testid="fullname"
                        />
                        <TextField
                            label="Email"
                            name="email"
                            value={feedbackData.email}
                            onChange={handleChange}
                            fullWidth
                            required
                            InputProps={{
                                readOnly: isEditing === "view",
                            }}
                            data-testid="email"
                        />
                        <TextField
                            label="Subject"
                            name="subject"
                            value={feedbackData.subject}
                            onChange={handleChange}
                            fullWidth
                            required
                            InputProps={{
                                readOnly: isEditing === "view",
                            }}
                            data-testid="subject"
                        />
                        <TextField
                            label="Description"
                            name="description"
                            value={feedbackData.description}
                            onChange={handleChange}
                            fullWidth
                            required
                            multiline
                            rows={4}
                            InputProps={{
                                readOnly: isEditing === "view",
                            }}
                            data-testid="description"
                        />
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Typography component="legend">Overall Experience</Typography>
                            <Rating
                                name="overallExperience"
                                value={Number(feedbackData.overallExperience)}
                                onChange={(event, newValue) => handleRatingChange('overallExperience', newValue)}
                                readOnly={isEditing === "view"}
                                data-testid="overallExperience"
                            />
                            <TextField
                                label="Overall Experience Info"
                                name="overallExperienceInfo"
                                value={feedbackData.overallExperienceInfo}
                                onChange={handleChange}
                                fullWidth
                                required
                                multiline
                                rows={2}
                                InputProps={{
                                    readOnly: isEditing === "view",
                                }}
                                data-testid="overallExperienceInfo"
                            />
                            <Typography component="legend">Usability</Typography>
                            <Rating
                                name="usability"
                                value={Number(feedbackData.usability)}
                                onChange={(event, newValue) => handleRatingChange('usability', newValue)}
                                readOnly={isEditing === "view"}
                                data-testid="usability"
                            />
                            <TextField
                                label="Usability Info"
                                name="usabilityInfo"
                                value={feedbackData.usabilityInfo}
                                onChange={handleChange}
                                fullWidth
                                required
                                multiline
                                rows={2}
                                InputProps={{
                                    readOnly: isEditing === "view",
                                }}
                                data-testid="usabilityInfo"
                            />
                            <Typography component="legend">Performance</Typography>
                            <Rating
                                name="performance"
                                value={Number(feedbackData.performance)}
                                onChange={(event, newValue) => handleRatingChange('performance', newValue)}
                                readOnly={isEditing === "view"}
                                data-testid="performance"
                            />
                            <TextField
                                label="Performance Info"
                                name="performanceInfo"
                                value={feedbackData.performanceInfo}
                                onChange={handleChange}
                                fullWidth
                                required
                                multiline
                                rows={2}
                                InputProps={{
                                    readOnly: isEditing === "view",
                                }}
                                data-testid="performanceInfo"
                            />
                            <Typography component="legend">Design</Typography>
                            <Rating
                                name="design"
                                value={Number(feedbackData.design)}
                                onChange={(event, newValue) => handleRatingChange('design', newValue)}
                                readOnly={isEditing === "view"}
                                data-testid="design"
                            />
                            <TextField
                                label="Design Info"
                                name="designInfo"
                                value={feedbackData.designInfo}
                                onChange={handleChange}
                                fullWidth
                                required
                                multiline
                                rows={2}
                                InputProps={{
                                    readOnly: isEditing === "view",
                                }}
                                data-testid="designInfo"
                            />
                            <Typography component="legend">Features</Typography>
                            <Rating
                                name="features"
                                value={Number(feedbackData.features)}
                                onChange={(event, newValue) => handleRatingChange('features', newValue)}
                                readOnly={isEditing === "view"}
                                data-testid="features"
                            />
                            <TextField
                                label="Features Info"
                                name="featuresInfo"
                                value={feedbackData.featuresInfo}
                                onChange={handleChange}
                                fullWidth
                                required
                                multiline
                                rows={2}
                                InputProps={{
                                    readOnly: isEditing === "view",
                                }}
                                data-testid="featuresInfo"
                            />
                            <Typography component="legend">Support</Typography>
                            <Rating
                                name="support"
                                value={Number(feedbackData.support)}
                                onChange={(event, newValue) => handleRatingChange('support', newValue)}
                                readOnly={isEditing === "view"}
                                data-testid="support"
                            />
                            <TextField
                                label="Support Info"
                                name="supportInfo"
                                value={feedbackData.supportInfo}
                                onChange={handleChange}
                                fullWidth
                                required
                                multiline
                                rows={2}
                                InputProps={{
                                    readOnly: isEditing === "view",
                                }}
                                data-testid="supportInfo"
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose} color="secondary" data-testid="cancelRatingBtn">
                            Cancel
                        </Button>
                        <Button type="submit" color="primary" data-testid="submitRatingBtn">
                            {isEditing ? 'Update' : 'Submit'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            <Dialog open={emailOpen} onClose={handleEmailClose}>
                <DialogTitle>Send Email</DialogTitle>
                <form onSubmit={handleEmailSubmit}>
                    <DialogContent>
                        <TextField
                            label="To"
                            name="to"
                            value={emailData.to}
                            onChange={handleEmailChange}
                            fullWidth
                            required
                            data-testid="to"
                        />
                        <TextField
                            label="Subject"
                            name="subject"
                            value={emailData.subject}
                            onChange={handleEmailChange}
                            fullWidth
                            required
                            data-testid="subject"
                        />
                        <TextField
                            label="Body"
                            name="body"
                            value={emailData.body}
                            onChange={handleEmailChange}
                            fullWidth
                            required
                            multiline
                            rows={4}
                            data-testid="body"
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleEmailClose} color="secondary" data-testid="cancelBtn">
                            Cancel
                        </Button>
                        <Button type="submit" color="primary" data-testid="submitBtn">
                            Send Email
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </div>
    );
};

export default AdminFeedback;
