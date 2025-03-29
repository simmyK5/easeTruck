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
    const [selectedDriver, setSelectedDriver] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [drivers, setDrivers] = useState([]);
    const [userDetail, setUserDetails] = useState({ _id: '' });
    const [editingId, setEditingId] = useState(null); // New state to store the truck id being edited
    const { user } = useAuth0();
    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        reset
    } = useForm({
        defaultValues: {
            make: '',
            model: '',
            year: '',
            numberPlate: '',
            serialNumber: '',
            driver: null
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
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/truck/${userDetail._id}`);

            const trucks = await Promise.all(response.data.map(async truck => {
                const driverResponse = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/user/${truck.driver}`);
                const driver = driverResponse.data;
                return {
                    id: truck._id,
                    driverId: truck.driverId,
                    driverName: `${driver.firstName} ${driver.lastName}`,
                    make: truck.make,
                    model: truck.model,
                    year: truck.year,
                    numberPlate: truck.numberPlate,
                    status: truck.status,
                    serialNumber: truck.serialNumber,
                };
            }));
            setRows(trucks);
        } catch (error) {
            console.error('Error fetching items:', error);
        }
    }, [userDetail]);


    const fetchDrivers = useCallback(async () => {
        if (!userDetail) return;
    
        try {
            const params = searchQuery ? { query: searchQuery } : {}; 
    
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/user/truckDrivers/${userDetail._id}`, { params });
    
            setDrivers(response.data);
        } catch (error) {
            console.error('Error fetching drivers:', error);
        }
    }, [userDetail, searchQuery]);
    



    const handleDriverChange = (event, value) => {
        setSelectedDriver(value);
    };

    useEffect(() => {
        fetchItems();
        fetchDrivers();
    }, [userDetail, fetchItems, fetchDrivers]);

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








    const handleDeleteItem = async (id) => {
        try {
            await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/backend/truck/${id}`);
            fetchItems();
        } catch (error) {
            console.error('Error deleting truck:', error);
        }
    };

    const handleOpen = () => {
        setIsEditing(false);
        reset();
        setSelectedDriver(null);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleOnSubmit = async (data) => {
        try {
            const formData = { ...data };

            if (selectedDriver) {
                formData.driverId = selectedDriver._id;
            }
            if (userDetail._id) {
                formData.vehicleOwner = userDetail._id;
            }
            if (isEditing) {
                formData._id = editingId; // Set the _id when editing
                await axios.put(`${import.meta.env.VITE_API_BASE_URL}/backend/truck/${formData._id}`, formData);
            } else {
                await axios.post(`${import.meta.env.VITE_API_BASE_URL}/backend/truck/`, formData);
            }
            fetchItems();
            handleClose();
            reset({
                make: '',
                model: '',
                year: '',
                numberPlate: '',
                serialNumber: '',
                driver: null
            });
            setSelectedDriver(null); // Reset the selected driver state
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
            serialNumber: item.serialNumber,
            driver: item.driverId,
        });
        setSelectedDriver(drivers.find(driver => driver._id === item.driverId) || null);
        setIsEditing(true);
        setEditingId(item.id); // Set the editing id
        setOpen(true);
    };

    const columns = [
        { field: 'make', headerName: 'Make', width: 200, editable: true },
        { field: 'model', headerName: 'Model', width: 200, editable: true },
        { field: 'year', headerName: 'Year', type: 'number', width: 150, editable: true },
        { field: 'numberPlate', headerName: 'Number Plate', width: 150, editable: true },
        { field: 'driverName', headerName: 'Driver', width: 150, editable: true },
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
                    <Box className="box">
                        <Button onClick={handleOpen} variant="contained" color="primary" data-testid="addTruck">Add Truck</Button>
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
                    <DialogTitle>{isEditing ? 'Edit Truck' : 'Add Truck'}</DialogTitle>
                    <DialogContent>
                        <form onSubmit={handleSubmit(handleOnSubmit)} className="dialog-form">
                            <TextField
                                label="Make"
                                name="make"
                                type="text"
                                margin="normal"
                                className="text-field"
                                data-testid="make"
                                {...register('make', { required: 'Make is required' })}
                                error={!!errors.make}
                                helperText={errors.make?.message}
                            />
                            <TextField
                                label="Model"
                                name="model"
                                type="text"
                                margin="normal"
                                className="text-field"
                                data-testid="model"
                                {...register('model', { required: 'Model is required' })}
                                error={!!errors.model}
                                helperText={errors.model?.message}
                            />
                            <TextField
                                label="Year"
                                name="year"
                                type="number"
                                margin="normal"
                                className="text-field"
                                data-testid="year"
                                {...register('year', { required: 'Year is required' })}
                                error={!!errors.year}
                                helperText={errors.year?.message}
                            />
                            <TextField
                                label="Number Plate"
                                name="numberPlate"
                                type="text"
                                margin="normal"
                                className="text-field"
                                data-testid="numberPlate"
                                {...register('numberPlate', { required: 'Number Plate is required' })}
                                error={!!errors.numberPlate}
                                helperText={errors.numberPlate?.message}
                            />
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
                            <Controller
                                name="driver"
                                control={control}
                                render={({ field }) => (
                                    <Autocomplete
                                        {...field}
                                        value={selectedDriver}
                                        onChange={handleDriverChange}
                                        onInputChange={(event, newInputValue) => {
                                            setSearchQuery(newInputValue);
                                        }}
                                        options={drivers}
                                        getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
                                        renderInput={(params) => <TextField {...params} label="Driver" margin="normal" />}
                                    />
                                )}
                            />
                            <DialogActions>
                                <Button onClick={handleClose} color="secondary" data-testid="cancel">Cancel</Button>
                                <Button type="submit" color="primary" data-testid="submit">{isEditing ? 'Update' : 'Add'}</Button>
                            </DialogActions>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}

export default TruckList;
