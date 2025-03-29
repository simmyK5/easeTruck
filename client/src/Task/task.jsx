import React, { useState, useEffect,useCallback } from 'react';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import axios from 'axios';
import { DeleteOutline, VisibilityOutlined, EditOutlined } from "@mui/icons-material";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Select, MenuItem, Autocomplete, FormControl, InputLabel, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import './task.css';

const TaskList = () => {
    const [rows, setRows] = useState([]);
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({ _id: '', vehicleOwnerId: '', driverId: '', numberPlate: '', startPoint: '', endPoint: '', status: '', loadCapacity: '' });
    const [searchText, setSearchText] = useState('');
    const [filteredRows, setFilteredRows] = useState([]);
    const [isEditing, setIsEditing] = useState('');
    const navigate = useNavigate();
    const [selectedDriver, setSelectedDriver] = useState(null);
    const [drivers, setDrivers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchNumberPlate, setSearchNumberPlate] = useState('');
    const [numberPlates, setNumberPlates] = useState([]);
    const [selectedNumberPlate, setSelectedNumberPlate] = useState(null);
    const [userDetail, setUserDetails] = useState({ _id: '', firstName: '', lastName: '', email: '', userRole: '', isLive: '', vehicleOwnerId: '' });
    const { user } = useAuth0();

    // Validation states
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (user) {
            fetchUserDetails(user.email); // Fetch the user's details
        }
    }, [user]);

    const fetchUserDetails = async (email) => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/user/users/${email}`);
            console.log(response.data);
            setUserDetails(response.data);
        } catch (error) {
            console.error('Error fetching user details:', error);
        }
    };

    const fetchItems = useCallback(async () => {
        try {
            console.log(userDetail._id);
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/task/vehicleOnwerTask/${userDetail._id}`);
            const tasks = await Promise.all(response.data.map(async (task) => {
                console.log(task);
                const taskResponse = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/user/${task.driverId}`);
                console.log(taskResponse);
                const driver = taskResponse.data;
                console.log(driver);
                return {
                    id: task._id, // Ensure this id is unique
                    driverId: driver._id, // Save driverId instead of name for easier reference
                    driverName: `${driver.firstName} ${driver.lastName}`, // Save driverName for display purposes
                    numberPlate: task.numberPlate,
                    startPoint: task.startPoint,
                    endPoint: task.endPoint,
                    status: task.status,
                    loadCapacity: task.loadCapacity,
                    files: task.files,
                };
            }));
            setRows(tasks);
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
            rows.filter(
                (row) =>
                    (row.numberPlate.toLowerCase().includes(searchText.toLowerCase())) ||
                    (row.startPoint.toLowerCase().includes(searchText.toLowerCase())) ||
                    (row.endPoint.toLowerCase().includes(searchText.toLowerCase())) ||
                    (row.status.toLowerCase().includes(searchText.toLowerCase())) ||
                    (row.loadCapacity.toLowerCase().includes(searchText.toLowerCase())) ||
                    (row.driverName.toLowerCase().includes(searchText.toLowerCase()))
            )
        );
    }, [searchText, rows]);

    useEffect(() => {
        if (searchNumberPlate) {
            axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/truck/numberPlate`, {
                params: {
                    searchNumberPlate,
                    userId: userDetail._id
                }
            })
                .then(response => {
                    setNumberPlates(response.data);
                })
                .catch(error => {
                    console.error('Error fetching number plates:', error);
                });
        }
    }, [searchNumberPlate,userDetail]);

    const handleNumberPlateChange = (event, value) => {
        setSelectedNumberPlate(value);
    };

    const handleDeleteItem = async (id) => {
        try {
            await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/backend/task/${id}`);
            fetchItems(); // Refresh data
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    const handleOpen = () => {
        setFormData({ vehicleOwnerId: '', driverId: '', numberPlate: '', startPoint: '', endPoint: '', status: '', loadCapacity: '' });
        setOpen(true);
        setSelectedDriver(null);
        setSelectedNumberPlate(null);
        setIsEditing('add');
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

        let error = '';
        switch (name) {
            case 'startPoint':
                if (!value) error = 'Start Point is required';
                break;
            case 'endPoint':
                if (!value) error = 'End Point is required';
                break;
            case 'loadCapacity':
                if (!value) error = 'Load Capacity is required';
                if (isNaN(value)) error = 'Load Capacity must be a number';
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
        const requiredFields = ['startPoint', 'endPoint', 'loadCapacity'];
        let valid = true;
        requiredFields.forEach(field => {
            validateField(field, formData[field]);
            if (!formData[field] || errors[field]) valid = false;
        });
        if (!valid) return;

        try {
            if (selectedDriver) {
                formData.driverId = selectedDriver._id;
            }
            if (selectedNumberPlate) {
                formData.numberPlate = selectedNumberPlate.numberPlate;
            }
            if (userDetail) {
                formData.vehicleOwnerId = userDetail._id;
            }
            if (isEditing === "edit") {
                console.log("awa bafana")
                console.log(formData);
                await axios.put(`${import.meta.env.VITE_API_BASE_URL}/backend/task/${formData.id}`, formData);
            } else if (isEditing === "add") {
                formData.status = "Not Started";
                await axios.post(`${import.meta.env.VITE_API_BASE_URL}/backend/task/`, formData);
            } else if (isEditing === "view") {
                navigate('/driverMap', {
                    state: {
                        fromAddress: formData.startPoint,
                        toAddress: formData.endPoint
                    }
                });
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
            driverId: item.driverId // Ensure driverId is set correctly
        });
        setSelectedDriver(drivers.find(driver => driver._id === item.driverId) || null);
        setSearchNumberPlate(numberPlates.find(numberPlate => numberPlate._id === item.driverId) || null);
        setIsEditing("edit");
        setOpen(true);
    };

    const handleView = (id) => {
        const item = rows.find((row) => row._id === id._id);
        setIsEditing("view");
        setFormData(item);
        setOpen(true);
    };

    const columns = [
        { field: 'driverName', headerName: 'Driver', width: 250, editable: true }, // Use driverName for display
        { field: 'numberPlate', headerName: 'Number Plate', width: 90, editable: true },
        { field: 'startPoint', headerName: 'Start Point', width: 150, editable: true },
        { field: 'endPoint', headerName: 'End Point', width: 150, editable: true },
        { field: 'status', headerName: 'Status', width: 150, editable: true },
        { field: 'loadCapacity', headerName: 'Load Capacity', width: 150, editable: true },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 150,
            renderCell: (params) => (
                <div>
                    <GridActionsCellItem
                        icon={<EditOutlined />}
                        label="Edit"
                        onClick={() => handleEdit(params.row)}
                        data-testid="editBtn"
                    />
                    <GridActionsCellItem
                        icon={<DeleteOutline />}
                        label="Delete"
                        onClick={() => handleDeleteItem(params.id)}
                    />
                    <GridActionsCellItem
                        icon={<VisibilityOutlined />}
                        label="View"
                        onClick={() => handleView(params.row)}
                    />
                </div>
            ),
        },
    ];

    return (

        <div className="task-list-container">
            <Box className="flex-container">
                <Box className="box">
                    <TextField
                        label="Search"
                        variant="outlined"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        className="search"
                    />
                </Box>
                <Box>
                    <Button variant="contained" color="primary" onClick={handleOpen} data-testid="addTaskBtn">
                        Add New Task
                    </Button>
                </Box>
            </Box>
            <DataGrid
                rows={filteredRows}
                columns={columns}
                pageSize={10}
                rowsPerPageOptions={[10]}
                disableSelectionOnClick
                className="data-grid"
                data-testid="dataGrid"
            />

            <Dialog open={open} onClose={handleClose} >
                <DialogTitle>{isEditing === "view" ? "View Task" : isEditing === "edit" ? "Edit Task" : "Add New Task"}</DialogTitle>
                <DialogContent>
                    <form className="dialog-form">
                        <FormControl>
                            <Autocomplete
                                value={selectedDriver}
                                onChange={handleDriverChange}
                                inputValue={searchQuery}
                                onInputChange={(e, newInputValue) => setSearchQuery(newInputValue)}
                                options={drivers}
                                getOptionLabel={(driver) => `${driver.firstName} ${driver.lastName}`}
                                renderInput={(params) => <TextField {...params} label="Driver" variant="outlined" />}
                            />
                        </FormControl>
                        <FormControl>
                            <Autocomplete
                                value={selectedNumberPlate}
                                onChange={handleNumberPlateChange}
                                inputValue={searchNumberPlate}
                                onInputChange={(e, newInputValue) => setSearchNumberPlate(newInputValue)}
                                options={numberPlates}
                                getOptionLabel={(numberPlate) => `${numberPlate.numberPlate}`}
                                renderInput={(params) => <TextField {...params} label="Number Plate" variant="outlined" />}
                            />
                        </FormControl>
                        <TextField
                            label="Start Point"
                            name="startPoint"
                            value={formData.startPoint}
                            onChange={handleChange}
                            error={!!errors.startPoint}
                            helperText={errors.startPoint}
                            variant="outlined"
                            fullWidth
                        />
                        <TextField
                            label="End Point"
                            name="endPoint"
                            value={formData.endPoint}
                            onChange={handleChange}
                            error={!!errors.endPoint}
                            helperText={errors.endPoint}
                            variant="outlined"
                            fullWidth
                        />
                        <TextField
                            label="Load Capacity"
                            name="loadCapacity"
                            value={formData.loadCapacity}
                            onChange={handleChange}
                            error={!!errors.loadCapacity}
                            helperText={errors.loadCapacity}
                            variant="outlined"
                            fullWidth
                        />
                        <FormControl>
                            <InputLabel>Status</InputLabel>
                            <Select
                                label="Status"
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                fullWidth
                                variant="outlined"
                            >
                                <MenuItem value="Not Started">Not Started</MenuItem>
                                <MenuItem value="Ongoing">Ongoing</MenuItem>
                                <MenuItem value="Completed">Completed</MenuItem>
                            </Select>
                        </FormControl>
                    </form>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Cancel
                    </Button>
                    {isEditing !== "view" && (
                        <Button onClick={handleSubmit} color="primary" variant="contained" data-testid="submitBtn">
                            {isEditing === "edit" ? "Update" : "Add"}
                        </Button>
                    )}
                    {isEditing === "view" && (
                        <Button onClick={handleSubmit} color="primary" variant="contained" data-testid="viewBtn">
                            View Route
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default TaskList;
