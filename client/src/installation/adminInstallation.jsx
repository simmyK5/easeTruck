import React, { useState, useEffect } from 'react';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import axios from 'axios';
import { EditOutlined } from "@mui/icons-material";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl,InputLabel, TextField, Select, MenuItem, Autocomplete, Typography, Box } from '@mui/material';
import './adminInstallation.css';

const AdminInstallation = () => {
    const [rows, setRows] = useState([]);
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({ _id: '', email: '', status: '', paymentStatus: '', userId: '', paymentId: '', items: '', totalAmount: '', technician: '', createdAt: '', address: '' });
    const [searchText, setSearchText] = useState('');
    const [filteredRows, setFilteredRows] = useState([]);
    const [isEditing, setIsEditing] = useState('');
    const [selectedTechnician, setSelectedTechnician] = useState(null);
    const [technicians, setTechnicians] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchItems();
        fetchTechnician();
    }, []);

    useEffect(() => {
        setFilteredRows(
            rows.filter(
                (row) =>
                    (row.email && row.email.includes(searchText)) ||
                    (row.status && row.status.includes(searchText)) ||
                    (row.paymentStatus && row.paymentStatus.includes(searchText)) ||
                    (row.userId && row.userId.includes(searchText)) ||
                    (row.paymentId && row.paymentId.includes(searchText)) ||
                    (JSON.stringify(row.items).includes(searchText)) ||
                    (row.totalAmount && row.totalAmount.includes(searchText)) ||
                    (row.technician && row.technician.includes(searchText)) ||
                    (row.address && row.address.includes(searchText))
            )
        );
    }, [searchText, rows]);

    useEffect(() => {
        if (searchQuery) {
            axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/user/technician?query=${searchQuery}`)
                .then(response => setTechnicians(response.data));
        }
    }, [searchQuery]);

    const fetchItems = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/installation/installations`);

            const installations = await Promise.all(response.data.map(async installation => {
                let technicianDetails = null;
                if (installation.technician) {
                    try {
                        const technicianResponse = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/user/${installation.technician}`);
                        technicianDetails = technicianResponse.data;
                    } catch (techError) {
                        console.error(`Error fetching technician ${installation.technician}:`, techError);
                    }
                }


                return {
                    _id: installation._id,
                    email: installation.email,
                    status: installation.status, // Corrected spelling
                    paymentStatus: installation.paymentStatus,
                    userId: installation.userId,
                    paymentId: installation.paymentId,
                    items: installation.items,
                    totalAmount: installation.totalAmount,
                    technician: technicianDetails ? `${technicianDetails.firstName} ${technicianDetails.lastName}` : 'N/A', // Check for null
                    createdAt: installation.createdAt,
                    address: installation.address

                };
            }));

            setRows(installations);
        } catch (error) {
            console.error('Error fetching items:', error);
        }
    };

    const fetchTechnician = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/user/technicians`);
            setTechnicians(response.data);

        } catch (error) {
            console.error('Error fetching drivers:', error);
        }
    };


    const handleClose = () => {
        setOpen(false);
    };

    const handleTechnicianChange = (event, value) => {
        setSelectedTechnician(value);
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

            if (selectedTechnician) {
                formData.technician = selectedTechnician._id;
            }

            const dataToSubmit = {
                ...formData,
                items: JSON.parse(formData.items)  // Parse items back to an array
            };

            if (isEditing === "edit") {
                console.log(dataToSubmit);
                await axios.put(`${import.meta.env.VITE_API_BASE_URL}/backend/installation/${formData._id}`, dataToSubmit);
            }
            fetchItems();
            handleClose();
        } catch (error) {
            console.error('Error submitting form:', error);
        }
    };

    const handleEdit = (id) => {
        const item = rows.find((row) => row._id === id._id);
        setFormData({
            ...item,
            items: JSON.stringify(item.items) // Convert items array to string for editing
        });
        setSelectedTechnician(technicians.find(technician => technician._id === item.technician) || null);
        setIsEditing("edit");
        setOpen(true);
    };

    const columns = [
        { field: 'email', headerName: 'email', width: 150, editable: true },
        {
            field: 'address',
            headerName: 'Address',
            width: 250,
            editable: true,
            valueGetter: (params) => {
                // Ensure that addresses exist and is an object
                const address = params;
                if (address) {
                    return `${address.address_line_1}, ${address.address_line_2}, ${address.admin_area_2}, ${address.admin_area_1}, ${address.postal_code},${address.country_code}`;
                }
                return '';  // Return an empty string if `addresses` doesn't exist
            }
        },
        {
            field: 'items',
            headerName: 'Items',
            width: 250,
            editable: true,
            valueGetter: (params) => {
                if (params && Array.isArray(params)) {
                    return params.map(item => item.name).join(', ');
                }
                return '';  // Return an empty string if `items` doesn't exist or isn't an array
            }
        },
        { field: 'paymentStatus', headerName: 'paymentStatus', width: 120, editable: true },
        { field: 'technician', headerName: 'technician', width: 150, editable: true },
        { field: 'status', headerName: 'status', width: 100, editable: true },
        { field: 'createdAt', headerName: 'createdAt', width: 155, editable: true },
        {
            field: "actions", headerName: "Actions", width: 70,
            renderCell: (params) => (
                <>
                    <GridActionsCellItem
                        icon={<EditOutlined />}
                        label="Edit"
                        onClick={() => handleEdit(params.row)}
                        data-testid="editBtn"
                    />
                </>
            ),
        },
    ];

    return (
        <>
            <div className="installation-list-container">
                <Typography variant="h4" gutterBottom>Installations</Typography>
                <Box className="flex-container">
                    <Box className="box">
                        <TextField
                            label="Search"
                            variant="outlined"
                            fullWidth
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            className="search-bar"
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
                    <DialogTitle>{isEditing === 'edit' ? 'Edit Mode' : isEditing === 'add' ? 'Add Mode' : 'View Mode'}</DialogTitle>
                    <DialogContent>
                        <form onSubmit={handleSubmit} className="dialog-form">
                            <TextField
                                label="Email"
                                name="email"
                                type="text"
                                value={formData.email || ''}
                                onChange={handleChange}
                                disabled={isEditing}
                                className="text-field"
                                data-testid="email"
                            />

                            <FormControl fullWidth data-testid="satusFormControl">
                                <InputLabel id="status-label" data-testid="downloadBtn">Status</InputLabel>
                                <Select
                                    labelId="status-label"
                                    id="status"
                                    name="status"  // Set the name prop to match the field in formData
                                    value={formData.status}  // Bind value to formData.status
                                    label="Status"
                                    onChange={handleChange}  // Handle the change event
                                    className="text-field"
                                    data-testid="satusSelect"
                                >
                                    <MenuItem value="Not Started" data-testid="notStarted">Not Started</MenuItem>
                                    <MenuItem value="In Progress" data-testid="inProgress">In Progress</MenuItem>
                                    <MenuItem value="Completed" data-testid="completed">Completed</MenuItem>
                                </Select>
                            </FormControl>

                            <TextField
                                label="Payment Status"
                                name="paymentStatus"
                                type="text"
                                value={formData.paymentStatus || ''}
                                onChange={handleChange}
                                disabled={isEditing}
                                className="text-field"
                                data-testid="paymentStatus"
                            />
                            <TextField
                                label="userId"
                                name="userId"
                                type="text"
                                value={formData.userId || ''}
                                onChange={handleChange}
                                disabled={isEditing}
                                className="text-field"
                                data-testid="userId"
                            />
                            <TextField
                                label="items"
                                name="items"
                                type="text"
                                value={formData.items || ''}
                                onChange={handleChange}
                                disabled={isEditing}
                                className="text-field"
                                data-testid="items"
                            />

                            <TextField
                                label="Total Amount"
                                name="totalAmount"
                                type="text"
                                value={formData.totalAmount || ''}
                                onChange={handleChange}
                                disabled={isEditing}
                                className="text-field"
                                data-testid="totalAmount"
                            />

                            <TextField
                                label="Technician"
                                name="technician"
                                type="text"
                                value={formData.technician || ''}
                                onChange={handleChange}
                                disabled={isEditing}
                                className="text-field"
                                data-testid="technician"
                            />

                            <Autocomplete
                                options={technicians}
                                getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
                                renderInput={(params) => <TextField {...params} label="Search Tehnician" variant="outlined" />}
                                onInputChange={(event, value) => setSearchQuery(value)}
                                onChange={handleTechnicianChange}
                                value={selectedTechnician}
                                fullWidth
                                margin="normal"
                                className="text-field"
                                data-testid="selectedTechnician"
                            />

                            <TextField
                                label="createdAt"
                                name="createdAt"
                                type="text"
                                value={formData.createdAt || ''}
                                onChange={handleChange}
                                disabled={isEditing}
                                className="text-field"
                                data-testid="createdAt"
                            />

                            <DialogActions>
                                <Button onClick={handleClose} color="primary" data-testid="cancelBtn">
                                    Cancel
                                </Button>
                                <Button type="submit" color="primary" data-testid="submitBtn">
                                    {isEditing === 'edit' ? 'Save' : isEditing === 'add' ? 'Add' : 'View Map'}
                                </Button>
                            </DialogActions>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>


        </>
    );
};

export default AdminInstallation;
