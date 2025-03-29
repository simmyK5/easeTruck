import React, { useState, useEffect } from 'react';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import axios from 'axios';
import { DeleteOutline, EditOutlined } from '@mui/icons-material';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';

const Technician = () => {
    const [rows, setRows] = useState([]);
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
        _id: '',
        firstName: '',
        lastName: '',
        email: '',
        userRole: 'technician',
        addedBy: ''
    });
    const [searchText, setSearchText] = useState('');
    const [filteredRows, setFilteredRows] = useState([]);
    const [isEditing, setIsEditing] = useState('');
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchTechnicians();
    }, []);

    useEffect(() => {
        setFilteredRows(
            rows.filter((row) =>
                row.firstName.toLowerCase().includes(searchText.toLowerCase()) ||
                row.lastName.toLowerCase().includes(searchText.toLowerCase()) ||
                row.email.toLowerCase().includes(searchText.toLowerCase())
            )
        );
    }, [searchText, rows]);

    const fetchTechnicians = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/user/technicians`);
            setRows(response.data);
        } catch (error) {
            console.error('Error fetching technicians:', error);
        }
    };

    const handleDeleteItem = async (id) => {
        try {
            await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/backend/user/${id}`);
            fetchTechnicians(); // Refresh data
        } catch (error) {
            console.error('Error deleting technician:', error);
        }
    };

    const handleOpen = () => {
        setIsEditing("add");
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            userRole: 'technician',
            addedBy: ''
        });
        setErrors({});
        setOpen(true);
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
        validateField(name, value);
    };

    const validateField = (name, value) => {
        console.log("umhlengi", name)
        console.log("yona", value)
        let error = '';
        switch (name) {
            case 'firstName':
                if (!value) {
                    error = 'First Name is required';
                } else if (!/^[A-Za-z]+$/.test(value)) { // Regex to check for alphabetic characters only
                    error = 'First Name can only contain letters';
                }
                break;
            case 'lastName':
                if (!value) {
                    error = 'Last Name is required';
                } else if (!/^[A-Za-z]+$/.test(value)) { // Regex to check for alphabetic characters only
                    error = 'Last Name can only contain letters';
                }
                break;
            case 'email':
                if (!value) {
                    error = 'Email is required';
                } else if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) { // Regex to validate email format
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
        // Validate all fields before submitting
        const requiredFields = ['firstName', 'lastName', 'email'];
        let valid = true;
        requiredFields.forEach(field => {
            validateField(field, formData[field]);
            if (!formData[field] || errors[field]) valid = false;
        });
        if (!valid) return;
        try {
            if (isEditing === "edit") {
                await axios.put(`${import.meta.env.VITE_API_BASE_URL}/backend/user/${formData._id}`, formData);
            } else {
                await axios.post(`${import.meta.env.VITE_API_BASE_URL}/backend/user/`, formData);
            }
            fetchTechnicians();
            handleClose();
        } catch (error) {
            console.error('Error submitting form:', error);
        }
    };

    const handleEdit = (params) => {
        const item = rows.find((row) => row._id === params.id);
        setFormData({
            _id: item._id,
            firstName: item.firstName,
            lastName: item.lastName,
            email: item.email,
            userRole: item.userRole,
            addedBy: item.addedBy,
        });
        setErrors({});
        setIsEditing("edit");
        setOpen(true);
    };

    const columns = [
        { field: 'firstName', headerName: 'First Name', width: 150, editable: true },
        { field: 'lastName', headerName: 'Last Name', width: 150, editable: true },
        { field: 'email', headerName: 'Email', width: 200, editable: true },
        {
            field: "actions", headerName: "Actions", width: 150,
            renderCell: (params) => (
                <>
                    <GridActionsCellItem
                        icon={<EditOutlined />}
                        label="Edit"
                        onClick={() => handleEdit(params)}
                        data-testid="editBtn"
                    />
                    <GridActionsCellItem
                        icon={<DeleteOutline />}
                        label="Delete"
                        onClick={() => handleDeleteItem(params.id)}
                        data-testid="deleteBtn"
                    />
                </>
            ),
        },
    ];

    return (
        <>
            <div className="technician-list-container">
                <Box className="flex-container">
                    <Box>
                        <TextField
                            label="Search"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            onChange={(e) => setSearchText(e.target.value)}
                            data-testid="search"
                        />
                    </Box>
                    <Box>
                        <Button onClick={handleOpen} variant="contained" color="primary" data-testid="addTechnician">Add Technician</Button>
                    </Box>
                </Box>
                <DataGrid
                    rows={filteredRows}
                    columns={columns}
                    pageSize={10}
                    rowsPerPageOptions={[10]}
                    getRowId={(row) => row._id} // Use _id as the unique identifier
                    data-testid="dataGrid"
                />
                <Dialog open={open} onClose={handleClose}>
                    <DialogTitle>{isEditing === "edit" ? 'Edit Driver' : 'Add Driver'}</DialogTitle>
                    <DialogContent>
                        <form onSubmit={handleSubmit} className="dialog-form">
                            <TextField
                                label="First Name"
                                name="firstName"
                                type="text"
                                value={formData.firstName || ''}
                                onChange={handleChange}
                                fullWidth
                                margin="normal"
                                className="text-field"
                                error={!!errors.firstName}
                                helperText={errors.firstName}
                                variant="outlined"
                                data-testid="firstName"
                            />
                            <TextField
                                label="Last Name"
                                name="lastName"
                                type="text"
                                value={formData.lastName || ''}
                                onChange={handleChange}
                                fullWidth
                                margin="normal"
                                className="text-field"
                                error={!!errors.lastName}
                                helperText={errors.lastName}
                                variant="outlined"
                                data-testid="lastName"
                            />
                            <TextField
                                label="Email"
                                name="email"
                                type="email"
                                value={formData.email || ''}
                                onChange={handleChange}
                                fullWidth
                                margin="normal"
                                className="text-field"
                                error={!!errors.email}
                                helperText={errors.email}
                                variant="outlined"
                                data-testid="email"
                            />
                            <TextField
                                label="User Role"
                                name="userRole"
                                type="text"
                                value={formData.userRole || 'technician'}
                                onChange={handleChange}
                                fullWidth
                                margin="normal"
                                disabled={isEditing === "view" || isEditing === "add" || isEditing === "add"}
                                className="text-field"
                                data-testid="userRole"
                            />
                            <DialogActions>
                                <Button onClick={handleClose} color="primary" data-testid="cancelBtn">Cancel</Button>
                                <Button type="submit" color="primary" data-testid="submitBtn">{isEditing === "edit" ? 'Update' : 'Add'}</Button>
                            </DialogActions>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
};

export default Technician;
