
import React, { useState, useEffect } from 'react';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import axios from 'axios';
import { DeleteOutline, EditOutlined } from "@mui/icons-material";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';

const Admin = () => {
    const [rows, setRows] = useState([]);
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
        _id: '',
        firstName: '',
        lastName: '',
        email: '',
        userRole: 'Admin',
        addedBy: ''
    });
    const [searchText, setSearchText] = useState('');
    const [filteredRows, setFilteredRows] = useState([]);
    const [isEditing, setIsEditing] = useState(false);

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
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/user/admins`);
            setRows(response.data);
        } catch (error) {
            console.error('Error fetching admins:', error);
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
        setIsEditing(false);
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            userRole: 'Admin',
            addedBy: ''
        });
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
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
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
        setIsEditing(true);
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
                    />
                    <GridActionsCellItem
                        icon={<DeleteOutline />}
                        label="Delete"
                        onClick={() => handleDeleteItem(params.id)}
                    />
                </>
            ),
        },
    ];

    return (
        <>
            <div className="Admins">
                <div className="info">
                    <h1>Admins</h1>
                    <div style={{ height: 400, width: '100%' }}>
                        <TextField
                            label="Search"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            onChange={(e) => setSearchText(e.target.value)}
                            data-testid="search"
                        />
                        <Button onClick={handleOpen} variant="contained" color="primary" data-testid="AddAdmin">Add Admin</Button>
                        <DataGrid
                            rows={filteredRows}
                            columns={columns}
                            pageSize={5}
                            rowsPerPageOptions={[5]}
                            getRowId={(row) => row._id} // Use _id as the unique identifier
                            data-testid="dataGrid"
                        />
                        <Dialog open={open} onClose={handleClose}  >
                            <DialogTitle>{isEditing ? 'Edit Admin' : 'Add Admin'}</DialogTitle>
                            <DialogContent>
                                <form onSubmit={handleSubmit}>
                                    <TextField
                                        label="First Name"
                                        name="firstName"
                                        type="text"
                                        value={formData.firstName || ''}
                                        onChange={handleChange}
                                        fullWidth
                                        margin="normal"
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
                                        data-testid="email"
                                    />
                                    <TextField
                                        label="User Role"
                                        name="userRole"
                                        type="text"
                                        value={formData.userRole || 'Technician'}
                                        onChange={handleChange}
                                        fullWidth
                                        margin="normal"
                                        data-testid="userRole"
                                      
                                    />
                                    <DialogActions>
                                        <Button onClick={handleClose} color="primary" data-testid="cancelBtn">Cancel</Button>
                                        <Button type="submit" color="primary" data-testid="SubmitBtn">{isEditing ? 'Save' : 'Add'}</Button>
                                    </DialogActions>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Admin;
