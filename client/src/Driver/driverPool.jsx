import React, { useState, useEffect } from 'react';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import axios from 'axios';
import { useAuth0 } from '@auth0/auth0-react';
import { VisibilityOutlined } from "@mui/icons-material";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, FormControlLabel, Checkbox, Box } from '@mui/material';
import './driverPool.css';

const DriverPool = () => {
    const [rows, setRows] = useState([]);
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({ _id: '', firstName: '', lastName: '', email: '', userRole: '', isLive: '',driverPool: '', vehicleOwnerId: '' });
    const [userDetail, setUserDetails] = useState({ _id: '', firstName: '', lastName: '', email: '', userRole: '', isLive: '', driverPool: '',vehicleOwnerId: '' });
    const [searchText, setSearchText] = useState('');
    const [filteredRows, setFilteredRows] = useState([]);
    const { user } = useAuth0();

    useEffect(() => {
        
        fetchUserDetails(user.email)
    },  [user?.email])

    const fetchUserDetails = async (email) => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/user/users/${email}`);
            setUserDetails(response.data);
        } catch (error) {
            console.error('Error fetching items:', error);
        }
    };



    useEffect(() => {
        fetchItems();
    }, []);

    useEffect(() => {
        setFilteredRows(
            rows.filter((row) =>
                row.firstName.toLowerCase().includes(searchText.toLowerCase()) ||
                row.lastName.toLowerCase().includes(searchText.toLowerCase()) ||
                row.email.toLowerCase().includes(searchText.toLowerCase()) ||
                row.userRole.toLowerCase().includes(searchText.toLowerCase()) ||
                row.isLive.toLowerCase().includes(searchText.toLowerCase()) ||
                row.driverPool.toLowerCase().includes(searchText.toLowerCase()) ||
                row.vehicleOwnerId.toLowerCase().includes(searchText.toLowerCase())

            )
        );
    }, [searchText, rows]);

    const fetchItems = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/user/drivers/live`);
            setRows(response.data);
        } catch (error) {
            console.error('Error fetching drivers pool:', error);
        }
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value,
        }));
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            console.log("loud speaker")
            console.log(userDetail.userRole)
            if (userDetail.userRole === "vehicleOwner") {
                console.log("I debug a lot")
                formData.vehicleOwnerId = userDetail._id
                formData.isLive = false
                formData.driverPool = true
            }

            await axios.put(`${import.meta.env.VITE_API_BASE_URL}/backend/user/${formData._id}`, formData);

            fetchItems();
            handleClose();
        } catch (error) {
            console.error('Error submitting driver form:', error);
        }
    };

    const handleEdit = (id) => {
        const item = rows.find((row) => row._id === id._id);
        setFormData(item);
        setOpen(true);
    };

    const columns = [
        { field: 'firstName', headerName: 'First Name', width: 300 },
        { field: 'lastName', headerName: 'Last Name', width: 300, editable: true },
        { field: 'email', headerName: 'email', width: 300, editable: true },
        { field: 'userRole', headerName: 'userRole', width: 150, editable: true },
        { field: 'isLive', headerName: 'Live', type: 'boolean', width: 100, editable: true },
        {
            field: "actions", headerName: "Actions", width: 150,
            renderCell: (params) => (
                <>
                    <GridActionsCellItem
                        icon={<VisibilityOutlined />}
                        label="View"
                        onClick={() => handleEdit(params.row)}
                        data-testid="viewBtn"
                    />
                </>

            ),
        },
    ];

    return (

        <>

            <div className="driver-list-container">
                <Box className="flex-container">
                    <Box className="box">
                        <TextField
                            label="Search"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            onChange={(e) => setSearchText(e.target.value)}
                            data-testid="search"

                        />
                    </Box>
                </Box>

                <DataGrid
                    rows={filteredRows}
                    columns={columns}
                    pageSize={10}
                    rowsPerPageOptions={[10]}
                    onCellDoubleClick={(params) => handleEdit(params.id)}
                    getRowId={(row) => row._id}
                    className="data-grid"
                    data-testid="dataGrid"
                />
                <Dialog open={open} onClose={handleClose}>
                    <DialogTitle>View Item</DialogTitle>
                    <DialogContent >
                        <form onSubmit={handleSubmit} className="dialog-form" >
                            <TextField
                                label="First Name"
                                name="firstName"
                                type="text"
                                value={formData.firstName || ''}
                                onChange={handleChange}
                                disabled
                                className="text-field"
                                data-testid="firstName"
                            />

                            <TextField
                                label="last Name"
                                name="lastName"
                                type="text"
                                value={formData.lastName || ''}
                                onChange={handleChange}
                                disabled
                                className="text-field"
                                data-testid="lastName"
                            />

                            <TextField
                                label="Email"
                                name="email"
                                type="text"
                                value={formData.email || ''}
                                onChange={handleChange}
                                disabled
                                className="text-field"
                                data-testid="email"
                            />
                             <TextField
                                label="User Role"
                                name="userRole"
                                type="text"
                                value={formData.userRole || ''}
                                onChange={handleChange}
                                disabled
                                className="text-field"
                                data-testid="userRole"
                            />

                            <FormControlLabel
                                control={
                                    <Checkbox
                                        name="isLive"
                                        checked={Boolean(formData.isLive)}  // Convert to boolean
                                        onChange={handleChange}
                                        disabled
                                        data-testid="isLive"
                                    />
                                }
                                label="Live"
                                className="text-field"
                                data-testid="isLiveFormController"
                            />

                            <DialogActions>
                                <Button onClick={handleClose} color="primary" data-testid="cancelBtn">
                                    Cancel
                                </Button>
                                <Button type="submit" color="primary" data-testid="submitBtn">
                                    Add Driver
                                </Button>
                            </DialogActions>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

        </>
    );
};

export default DriverPool;
