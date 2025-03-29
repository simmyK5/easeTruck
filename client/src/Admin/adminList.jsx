import React, { useState, useEffect } from 'react';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import axios from 'axios';
import { DeleteOutline, EditOutlined } from '@mui/icons-material';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Box } from '@mui/material';
import './adminList.css';

const AdminList = () => {
    const [rows, setRows] = useState([]);
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({ _id: '', firstName: '', lastName: '', email: '' ,userRole: 'technician',addedBy: ''});
    const [searchText, setSearchText] = useState('');
    const [filteredRows, setFilteredRows] = useState([]);
    const [isEditing, setIsEditing] = useState('');
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchAdmin();
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

    const fetchAdmin = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/user/admins`);
            setRows(response.data);
        } catch (error) {
            console.error('Error fetching admin:', error);
        }
    };

    const handleDeleteItem = async (id) => {
        try {
            await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/backend/user/${id}`);
            fetchAdmin(); // Refresh data after deletion
        } catch (error) {
            console.error('Error deleting driver:', error);
        }
    };

    const handleOpen = () => {
        setIsEditing("add");
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            userRole: 'admin',
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


                await axios.post(`${import.meta.env.VITE_API_BASE_URL}/backend/user/admin`, formData);
            }


            fetchAdmin(); // Refresh data after adding/editing
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

    const columns = [
        { field: 'firstName', headerName: 'First Name', width: 250, editable: true },
        { field: 'lastName', headerName: 'Last Name', width: 250, editable: true },
        { field: 'email', headerName: 'Email', width: 250, editable: true },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 100,
            renderCell: (params) => (
                <div>
                    <GridActionsCellItem icon={<EditOutlined />} label="Edit" onClick={() => handleEdit(params.row)} data-testid="editBtn" />
                    <GridActionsCellItem icon={<DeleteOutline />} label="Delete" onClick={() => handleDeleteItem(params.row._id)} data-testid="deleteBtn" />
                </div>
            )
        }
    ];

    return (
        <div className="admin-list-container">
            <Box className="flex-container">
                <Box className="box">
                    <TextField
                        label="Search"
                        variant="outlined"
                        size="medium"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        className="search-bar"
                        data-testid="periodFourMonth"
                    />
                </Box>
                <Box className="box">
                    <Button variant="contained" color="primary" onClick={handleOpen} data-testid="addAdmin">
                        Add Admin
                    </Button>
                </Box>
            </Box>
            <DataGrid
                rows={filteredRows}
                columns={columns}
                autoHeight
                pageSize={10} // Show 10 rows per page
                rowsPerPageOptions={[10]} // Options for the number of rows per page
                getRowId={(row) => row._id}
                className="data-grid"
                data-testid="dataGrid"
            />
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>{isEditing ? 'Edit Driver' : 'Add Driver'}</DialogTitle>
                <DialogContent>
                    <form onSubmit={handleSubmit} className="dialog-form" data-testid="dataGrid">
                        <TextField
                            label="First Name"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            fullWidth
                            className="text-field"
                            data-testid="firstName"
                            error={!!errors.firstName}
                            helperText={errors.firstName}
                            variant="outlined"
                        />
                        <TextField
                            label="Last Name"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            fullWidth
                            className="text-field"
                            data-testid="lastName"
                            error={!!errors.lastName}
                            helperText={errors.lastName}
                            variant="outlined"
                        />
                        <TextField
                            label="Email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            fullWidth
                            className="text-field"
                            data-testid="email"
                            error={!!errors.email}
                            helperText={errors.email}
                            variant="outlined"
                        />
                        <DialogActions>
                            <Button onClick={handleClose} color="primary" data-testid="cancelBtn">Cancel</Button>
                             <Button type="submit" color="primary" data-testid="submitBtn">{isEditing === "edit" ? 'Update' : 'Add'}</Button>
                        </DialogActions>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminList;

