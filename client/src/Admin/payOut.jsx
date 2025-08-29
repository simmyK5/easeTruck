import React, { useState, useEffect } from 'react';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import axios from 'axios';
import { EditOutlined } from "@mui/icons-material";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, TextField, Select, MenuItem, Autocomplete, Typography, Box } from '@mui/material';
import './payOut.css';

const PayOut = () => {
    const [rows, setRows] = useState([]);
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({ _id: '', resellerName: '', resellerSurname: '', resellerEmail: '', clientName: '', clientSurname: '', clientEmail: '', isConfirmed: '', isPaid: '', timestamp: '',proccssedBy:'' });
    const [searchText, setSearchText] = useState('');
    const [filteredRows, setFilteredRows] = useState([]);
    const [isEditing, setIsEditing] = useState('');
    const [payouts, setPayouts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const { user, getIdTokenClaims } = useAuth0();
    const [userID, setUserID] = useState('');


    useEffect(() => {
        if (user) {
            fetchUserDetails(user.email);
        }
    }, [user]);

    const fetchUserDetails = async (email) => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/user/users/${email}`);
            setUserID(response.data._id);
        } catch (error) {
            console.error('Error fetching user details:', error);
        }
    };

    useEffect(() => {
        fetchPayouts();
    }, []);

    useEffect(() => {
        setFilteredRows(
            rows.filter(
                (row) =>
                    (row.resellerName && row.resellerName.includes(searchText)) ||
                    (row.resellerSurname && row.resellerSurname.includes(searchText)) ||
                    (row.resellerEmail && row.resellerEmail.includes(searchText)) ||
                    (row.clientName && row.clientName.includes(searchText)) ||
                    (row.clientSurname && row.clientSurname.includes(searchText)) ||
                    (row.clientEmail && row.clientEmail.includes(searchText))
            )
        );
    }, [searchText, rows]);




    const fetchPayouts = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/claimVoucher/payouts`);
            setPayouts(response.data);

        } catch (error) {
            console.error('Error fetching drivers:', error);
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

            if (userID) {
                formData.proccssedBy=userID;
                await axios.put(`${import.meta.env.VITE_API_BASE_URL}/backend/claimVoucher/payouts/${formData._id}`, formData);
            }
            fetchPayouts();
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
        setOpen(true);
    };

    const columns = [
        { field: 'resellerName', headerName: 'Reseller Name', width: 150, editable: true },
        { field: 'resellerSurname', headerName: 'Reseller Surname', width: 120, editable: true },
        { field: 'resellerEmail', headerName: 'Reseller Email', width: 150, editable: true },
        { field: 'clientName', headerName: 'Client Name', width: 100, editable: true },
        { field: 'clientSurname', headerName: 'Client Surname', width: 155, editable: true },
        { field: 'clientEmail', headerName: 'Client Email', width: 155, editable: true },
        { field: 'isConfirmed', headerName: 'Is Confirmed', width: 155, editable: true },
        { field: 'isPaid', headerName: 'Is Paid', width: 155, editable: true },
    ];

    return (
        <>
            <div className="payOut-list-container">
                <Typography variant="h4" gutterBottom>Pay Out</Typography>
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
                    <DialogTitle>Edit</DialogTitle>
                    <DialogContent>
                        <form onSubmit={handleSubmit} className="dialog-form">
                            <TextField
                                label="Reseller Name"
                                name="resellerName"
                                type="text"
                                value={formData.resellerName || ''}
                                onChange={handleChange}
                                disabled={isEditing}
                                className="text-field"
                                data-testid="resellerName"
                            />

                            <TextField
                                label="resellerSurname"
                                name="resellerSurname"
                                type="text"
                                value={formData.resellerSurname || ''}
                                onChange={handleChange}
                                disabled={isEditing}
                                className="text-field"
                                data-testid="resellerSurname"
                            />

                            <TextField
                                label="Reseller Email"
                                name="resellerEmail"
                                type="text"
                                value={formData.resellerEmail || ''}
                                onChange={handleChange}
                                disabled={isEditing}
                                className="text-field"
                                data-testid="resellerEmail"
                            />

                            <TextField
                                label="Client Name"
                                name="clientName"
                                type="text"
                                value={formData.clientName || ''}
                                onChange={handleChange}
                                disabled={isEditing}
                                className="text-field"
                                data-testid="clientName"
                            />


                            <TextField
                                label="clientSurname"
                                name="clientSurname"
                                type="text"
                                value={formData.clientSurname || ''}
                                onChange={handleChange}
                                disabled={isEditing}
                                className="text-field"
                                data-testid="clientSurname"
                            />
                            <TextField
                                label="clientEmail"
                                name="clientEmail"
                                type="text"
                                value={formData.clientEmail || ''}
                                onChange={handleChange}
                                disabled={isEditing}
                                className="text-field"
                                data-testid="clientEmail"
                            />
                            <TextField
                                label="isConfirmed"
                                name="isConfirmed"
                                type="text"
                                value={formData.isConfirmed || ''}
                                onChange={handleChange}
                                disabled={isEditing}
                                className="text-field"
                                data-testid="isConfirmed"
                            />

                            <TextField
                                label="Is Paid"
                                name="isPaid"
                                type="text"
                                value={formData.isPaid || ''}
                                onChange={handleChange}
                                disabled={isEditing}
                                className="text-field"
                                data-testid="isPaid"
                            />

                            <DialogActions>
                                <Button onClick={handleClose} color="primary" data-testid="cancelBtn">
                                    Cancel
                                </Button>
                                <Button type="submit" color="primary" data-testid="submitBtn">
                                    Edit
                                </Button>
                            </DialogActions>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>


        </>
    );
};

export default PayOut;
