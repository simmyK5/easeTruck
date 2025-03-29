import React, { useState, useEffect } from 'react';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import axios from 'axios';
import { DeleteOutline, EditOutlined } from '@mui/icons-material';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Box, Typography } from '@mui/material';
import { useAuth0 } from '@auth0/auth0-react';
import DriverSubscription from '../subscription/driverSubscription';
import './driverList.css';

const DriverList = () => {
    const [rows, setRows] = useState([]);
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({ _id: '', firstName: '', lastName: '', email: '', planName: '', status: '', expirationDate: '', driverPool: '',subscriptionId:'' });
    const [userDetail, setUserDetails] = useState({ _id: '', firstName: '', lastName: '', email: '', userRole: '', isLive: '', driverPool: '', vehicleOwnerId: '' });
    const [searchText, setSearchText] = useState('');
    const [filteredRows, setFilteredRows] = useState([]);
    const [isEditing, setIsEditing] = useState('');
    const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const { user, getIdTokenClaims } = useAuth0();
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (user) {
            fetchUserDetails(user.email);
        }
    }, [user]);

    const fetchUserDetails = async (email) => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/user/users/${email}`);
            setUserDetails(response.data);
        } catch (error) {
            console.error('Error fetching user details:', error);
        }
    };

    const handleSubscribe = async (plan) => {
        setSelectedPlan(plan);
        setOpenModal(true);
    };

    useEffect(() => {
        if (userDetail && userDetail._id) {
            fetchItems(userDetail._id);
        }
    }, [userDetail]);

    useEffect(() => {
        if (Array.isArray(rows)) {
            setFilteredRows(
                rows.filter((row) => {
                    const firstName = row.firstName || '';
                    const lastName = row.lastName || '';
                    const email = row.email || '';
                    const planName = row.planName || '';
                    const status = row.status || '';
                    const expirationDate = row.expirationDate || '';
                    const driverPool = row.driverPool || '';

                    return (
                        firstName.toLowerCase().includes(searchText.toLowerCase()) ||
                        lastName.toLowerCase().includes(searchText.toLowerCase()) ||
                        email.toLowerCase().includes(searchText.toLowerCase()) ||
                        planName.toLowerCase().includes(searchText.toLowerCase()) ||
                        status.toLowerCase().includes(searchText.toLowerCase()) ||
                        expirationDate.toLowerCase().includes(searchText.toLowerCase()) ||
                        driverPool.toLowerCase().includes(searchText.toLowerCase())
                    );
                })
            );
        }
    }, [searchText, rows]);

    const fetchItems = async (vehicleOwnerId) => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/user/ownerDrivers/${vehicleOwnerId}`);
            setRows(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Error fetching drivers:', error);
        }
    };

    const handleDeleteItem = async (row) => {
        console.log("we leave and we learn", row)
        try {
            if (row.driverPool === true) {
                console.log("Sjava nguyena")
                await axios.put(`${import.meta.env.VITE_API_BASE_URL}/backend/user/driverPool/${row._id}`);
                fetchItems(userDetail.vehicleOwnerId);
            } else {
                console.log("subcription id we see",row)
                const token = await getIdTokenClaims();
                await axios.post('${import.meta.env.VITE_API_BASE_URL}/backend/subscription/cancel', { subscriptionId: row.subscriptionId }, {
                    headers: { Authorization: `Bearer ${token.__raw}` }
                });
                await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/backend/user/${row._id}`);
                
                fetchItems(userDetail._id);
            }
        } catch (error) {
            console.error('Error deleting driver:', error);
        }
    };

    const handleOpen = () => {
        setIsEditing("add");
        setFormData({ vehicleOwnerId: userDetail._id, isLive: false, driverPool: false, firstName: '', lastName: '', email: '',  userRole: 'driver' });
        setOpen(true);
    };

    const handleClose = () => {
        setFormData({ _id: '', firstName: '', lastName: '', email: '', planName: '', status: '', expirationDate: '', driverPool: '',subscriptionId:'' });
        setOpen(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value,
        }));
        validateField(name, value);
    };

    const validateField = (name, value) => {
        let error = '';
        switch (name) {
            case 'firstName':
                if (!value) {
                    error = 'First Name is required';
                } else if (!/^[A-Za-z]+$/.test(value)) {
                    error = 'First Name can only contain letters';
                }
                break;
            case 'lastName':
                if (!value) {
                    error = 'Last Name is required';
                } else if (!/^[A-Za-z]+$/.test(value)) {
                    error = 'Last Name can only contain letters';
                }
                break;
            case 'email':
                if (!value) {
                    error = 'Email is required';
                } else if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) {
                    error = 'Please enter a valid email address';
                }
                break;
            default:
                break;
        }
        setErrors((prevErrors) => ({
            ...prevErrors,
            [name]: error,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const requiredFields = ['firstName', 'lastName', 'email'];
        let valid = true;
        requiredFields.forEach(field => {
            validateField(field, formData[field]);
            if (!formData[field] || errors[field]) valid = false;
        });
        if (!valid) return;

        if (isEditing === "add" && !isSubscribed) {
            alert('Please subscribe to a plan before saving your profile.');
            return;
        }

        try {
            if (isEditing === "edit") {
                await axios.put(`${import.meta.env.VITE_API_BASE_URL}/backend/user/${formData._id}`, formData);
            } else if (isEditing === "add") {
                setIsSubscriptionOpen(true);
            }
            fetchItems(userDetail._id);
            handleClose();
        } catch (error) {
            console.error('Error submitting driver form:', error);
        }
    };

    const handleEdit = (id) => {
        const item = rows.find((row) => row._id === id._id);
        setFormData(item);
        setIsEditing("edit");
        setOpen(true);
    };

    const handleSubscriptionToggle = () => {
        setIsSubscriptionOpen(!isSubscriptionOpen); // Toggle subscription state
    };

    const renderSubscriptionOptionsBelowButton = () => {
        if (!isSubscriptionOpen) return null;

        const roleBasedPlans = {
            driver: [
                { title: 'Free Plan', price: 0, features: ['Feature 1', 'Feature 2'], planId: import.meta.env.VITE_FREE_PLAN_SUBSCRIPTION },
                { title: 'Driver Plan', price: 29.99, features: ['Feature 1', 'Feature 2', 'Feature 3'], planId: import.meta.env. VITE_DRIVER_PLAN_SUBSCRIPTION },
            ],
        };

        const plans = roleBasedPlans.driver || [];
        return (
            <Box>
                {plans.map((plan) => (
                    <Box key={plan.planId} my={2} p={2} border={1} borderRadius={4}>
                        <Typography variant="h6">{plan.title}</Typography>
                        <Typography variant="body1">Price: ${plan.price}</Typography>
                        <Typography variant="body2">Features:</Typography>
                        <ul>
                            {plan.features.map((feature, index) => (
                                <li key={index}>{feature}</li>
                            ))}
                        </ul>
                        <Button variant="contained" color="primary" onClick={() => handleSubscribe(plan)} data-testid="choosePlanBtn">
                            Choose {plan.title}
                        </Button>

                    </Box>
                ))}
            </Box>
        );
    };

    return (
        <div className="driver-list-container">
            <Box className="flex-container">
                <Box className="box">
                    <TextField
                        label="Search"
                        variant="outlined"
                        size="medium"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        className="search-bar"
                    />
                </Box>
                <Box className="box">
                    <Button variant="contained" color="primary" onClick={handleOpen} data-testid="addDriver">
                        Add Driver
                    </Button>
                </Box>
            </Box>
            <DataGrid
                rows={filteredRows.length ? filteredRows : rows}
                columns={[
                    { field: 'firstName', headerName: 'First Name', width: 250 },
                    { field: 'lastName', headerName: 'Last Name', width: 250 },
                    { field: 'email', headerName: 'Email', width: 250 },
                    { field: 'planName', headerName: 'Plan Name', width: 120 },
                    { field: 'status', headerName: 'Status', width: 100 },
                    { field: 'expirationDate', headerName: 'Expiration Date', width: 200 },
                    {
                        field: 'actions',
                        headerName: 'Actions',
                        width: 100,
                        renderCell: (params) => (
                            <div>
                                <GridActionsCellItem icon={<EditOutlined />} label="Edit" onClick={() => handleEdit(params.row)} />
                                <GridActionsCellItem icon={<DeleteOutline />} label="Delete" onClick={() => handleDeleteItem(params.row)} />
                            </div>
                        )
                    }
                ]}
                pageSize={10}
                rowsPerPageOptions={[10]}
                disableSelectionOnClick
                getRowId={(row) => row._id}
            />
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>{isEditing === "edit" ? 'Edit Driver' : 'Add Driver'}</DialogTitle>
                <DialogContent>
                    <form className="dialog-form" data-testid="periodFourMonth">
                        <TextField
                            label="First Name"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            fullWidth
                            variant="outlined"
                            error={!!errors.firstName}
                            helperText={errors.firstName}
                        />
                        <TextField
                            label="Last Name"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            fullWidth
                            variant="outlined"
                            error={!!errors.lastName}
                            helperText={errors.lastName}
                        />
                        <TextField
                            label="Email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            fullWidth
                            variant="outlined"
                            error={!!errors.email}
                            helperText={errors.email}
                        />
                        <Button onClick={handleSubscriptionToggle} color="primary" data-testid="payNowBtn" disabled={isEditing === "edit"} >
                            {isSubscriptionOpen ? 'Hide Options' : 'Pay Now'}
                        </Button>
                        {renderSubscriptionOptionsBelowButton()}
                        <DialogActions>
                            <Button onClick={handleClose} color="primary" data-testid="cancelBtn">Cancel</Button>
                            <Button onClick={handleSubmit} type="submit" color="primary" data-testid="submitBtn">
                                {isEditing === "edit" ? 'Update' : 'Add'}
                            </Button>
                        </DialogActions>
                    </form>
                </DialogContent>
            </Dialog>
            <DriverSubscription
                open={openModal}
                plan={selectedPlan}
                userEmail={formData.email}
                profileData={{ ...formData, vehicleOwnerId: userDetail._id }}
                setIsSubscribed={setIsSubscribed}
                onClose={() => setOpenModal(false)}
            />
        </div>
    );
};

export default DriverList;
