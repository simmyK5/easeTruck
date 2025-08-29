import React, { useState, useEffect, useCallback } from 'react';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import axios from 'axios';
import { DeleteOutline, EditOutlined } from "@mui/icons-material";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Autocomplete, Box } from '@mui/material';
import { useAuth0 } from '@auth0/auth0-react';
import './truckList.css';
import { useForm, Controller } from 'react-hook-form';

const TruckList = () => {
    const [rows, setRows] = useState([]);
    const [open, setOpen] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [filteredRows, setFilteredRows] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [userDetail, setUserDetails] = useState({ _id: '' });
    const [editingId, setEditingId] = useState(null); // New state to store the truck id being edited
    const { user } = useAuth0();
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm({
        defaultValues: {
            make: '',
            model: '',
            year: '',
            numberPlate: '',
            serialNumber: ''
        }
    });

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

    const fetchItems = useCallback(async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/trucks`);
            setRows(response);
        } catch (error) {
            console.error('Error fetching trucks:', error);
        }
    }, [userDetail]);


    useEffect(() => {
        fetchItems();
    }, [userDetail, fetchItems]);

    useEffect(() => {
        setFilteredRows(
            rows.filter((row) =>
                row.make.toLowerCase().includes(searchText.toLowerCase()) ||
                row.model.toLowerCase().includes(searchText.toLowerCase()) ||
                row.year.toLowerCase().includes(searchText.toLowerCase()) ||
                row.numberPlate.toLowerCase().includes(searchText.toLowerCase()) ||
                row.driverName.toLowerCase().includes(searchText.toLowerCase())
            )
        );
    }, [searchText, rows]);

    const handleClose = () => {
        setOpen(false);
    };

    const handleOnSubmit = async (data) => {
        try {
            const formData = { ...data };
            if (editingId) {
                formData._id = editingId; // Set the _id when editing
                await axios.put(`${import.meta.env.VITE_API_BASE_URL}/backend/truck/${formData._id}`, formData);
            }
            fetchItems();
            handleClose();
            reset({
                make: '',
                model: '',
                year: '',
                numberPlate: '',
                serialNumber: '',
            });
        } catch (error) {
            console.error('Error submitting form:', error);
        }
    };

    const handleEdit = (params) => {
        const item = rows.find((row) => row.id === params.row.id);
        reset({
            make: item.make,
            model: item.model,
            year: item.year,
            numberPlate: item.numberPlate,
            serialNumber: item.serialNumber
        });
        setIsEditing(true);
        setEditingId(item.id); // Set the editing id
        setOpen(true);
    };

    const columns = [
        { field: 'make', headerName: 'Make', width: 200, editable: true },
        { field: 'model', headerName: 'Model', width: 200, editable: true },
        { field: 'year', headerName: 'Year', type: 'number', width: 150, editable: true },
        { field: 'numberPlate', headerName: 'Number Plate', width: 150, editable: true },
        { field: 'serialNumber', headerName: 'Serial Number', width: 300, editable: true },
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
                </>
            ),
        },
    ];

    return (
        <>
            <div className="truck-list-container">
                <Box className="flex-container">
                    <Box className="box">
                        <TextField
                            label="Search"
                            variant="outlined"
                            fullWidth
                            margin="normal"
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
                    getRowId={(row) => row.id}
                    className="data-grid"
                    data-testid="dataGrid"
                />
                <Dialog open={open} onClose={handleClose}>
                    <DialogTitle>Edit Truck</DialogTitle>
                    <DialogContent>
                        <form onSubmit={handleSubmit(handleOnSubmit)} className="dialog-form">
                            <TextField
                                label="Serial Number"
                                name="serialNumber"
                                type="text"
                                margin="normal"
                                className="text-field"
                                data-testid="serialNumber"
                                {...register('serialNumber', { required: 'Serial Number is required' })}
                                error={!!errors.serialNumber}
                                helperText={errors.serialNumber?.message}
                            />
                            <DialogActions>
                                <Button onClick={handleClose} color="secondary" data-testid="cancel">Cancel</Button>
                                <Button type="submit" color="primary" data-testid="submit">Save</Button>
                            </DialogActions>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}

export default TruckList;
