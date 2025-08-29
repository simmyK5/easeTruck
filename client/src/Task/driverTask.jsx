import React, { useState, useEffect, useCallback } from 'react';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import axios from 'axios';
import { useAuth0 } from '@auth0/auth0-react';
import { VisibilityOutlined, EditOutlined } from "@mui/icons-material";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Tabs, Tab, Box, FormControl, InputLabel, Select, MenuItem, Typography } from '@mui/material';
import './driverTask.css';
import { useNavigate } from 'react-router-dom';

const DriverTask = () => {
    const [rows, setRows] = useState([]);
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({ _id: '', vehicleOwnerId: '', driverId: '', numberPlate: '', startPoint: '', endPoint: '', status: '', onload: '', offload: '', fileUrls: '' });
    const [searchText, setSearchText] = useState('');
    const [filteredRows, setFilteredRows] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const { user } = useAuth0();
    const [tabIndex, setTabIndex] = useState(0);
    const [files, setFiles] = useState({ onload: null, offload: null, document3: null });
    const [userDetail, setUserDetails] = useState({ _id: '', firstName: '', lastName: '', email: '', userRole: '', isLive: '', vehicleOwnerId: '' });
    const navigate = useNavigate();


    const handleFileChange = (event, fileType) => {
        const selectedFile = event.target.files[0]; // Get the selected file
        if (!selectedFile) return;

        console.log("Selected File:", fileType, selectedFile);

        setFiles(prevFiles => ({
            ...prevFiles,
            [fileType]: selectedFile, // Preserve previous files while adding a new one
        }));
    };


    useEffect(() => {
        if (user) {
            fetchUserDetails(user.email); // Fetch the user's details
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
            if (userDetail._id) {
                const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/task/driver/${userDetail._id}`);
                console.log(response.data)
                setRows(response.data);
            }
        } catch (error) {
            console.error('Error fetching drivers pool:', error);
        }
    }, [userDetail]);

    useEffect(() => {
        if (userDetail) {
            fetchItems(userDetail._id);
        }
    }, [userDetail, fetchItems]);

    useEffect(() => {
        setFilteredRows(
            rows.filter((row) =>
                (row.numberPlate.toLowerCase().includes(searchText.toLowerCase())) ||
                (row.startPoint.toLowerCase().includes(searchText.toLowerCase())) ||
                (row.endPoint.toLowerCase().includes(searchText.toLowerCase())) ||
                (row.status.toLowerCase().includes(searchText.toLowerCase()))
            )
        );
    }, [searchText, rows]);



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
        console.log(isEditing)
        try {
            if (isEditing === "edit") {
                // Create a new FormData object
                const form = new FormData();

                // Append each file to the form data
                Object.keys(files).forEach(fileType => {
                    const file = files[fileType];
                    if (file && file instanceof File) {
                        form.append(fileType, file);
                    }
                });




                console.log("see something", formData)

                // Append other form data
                form.append('_id', formData._id);
                form.append('vehicleOwnerId', formData.vehicleOwnerId);
                form.append('driverId', formData.driverId);
                form.append('numberPlate', formData.numberPlate);
                form.append('startPoint', formData.startPoint);
                form.append('endPoint', formData.endPoint);
                form.append('status', formData.status);
                form.append('onload', formData.onload);
                form.append('offload', formData.offload);


                // Send the form data using axios
                await axios.put(`${import.meta.env.VITE_API_BASE_URL}/backend/task/${formData._id}`, form);
            }
            else if (isEditing === "view") {
                navigate('/driverMap', {
                    state: {
                        fromAddress: formData.startPoint,
                        toAddress: formData.endPoint
                    }
                });
            }
            fetchItems();
            handleClose();


            fetchItems();
            handleClose();
        } catch (error) {
            console.error('Error submitting driver form:', error);
        }
    };

    const handleEdit = (id) => {
        const item = rows.find((row) => row._id === id._id);
        setFormData(item);
        setIsEditing(true);
        setOpen(true);
        setIsEditing("edit");
    };

    const handleView = (id) => {
        const item = rows.find((row) => row._id === id._id);
        setIsEditing("view");
        setFormData(item);
        setOpen(true);
    };

    const handleTabChange = (event, newIndex) => {
        setTabIndex(newIndex);
    };

    const columns = [
        { field: 'numberPlate', headerName: 'Number Plate', width: 90, editable: true },
        { field: 'startPoint', headerName: 'Start Point', width: 150, editable: true },
        { field: 'endPoint', headerName: 'End Point', width: 150, editable: true },
        { field: 'status', headerName: 'Status', width: 150, editable: true },
        { field: 'loadCapacity', headerName: 'Load Capacity', width: 150, editable: true },
        {
            field: "actions", headerName: "Actions", width: 150,
            renderCell: (params) => (
                <>
                    <GridActionsCellItem
                        icon={<EditOutlined />}
                        label="Edit"
                        onClick={() => handleEdit(params.row)}
                        data-testid="editBtn"
                    />
                    <GridActionsCellItem
                        icon={<VisibilityOutlined />}
                        label="View"
                        onClick={() => handleView(params.row)}
                        data-testid="viewBtn"
                    />
                </>

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
                <DialogTitle>{isEditing === "edit" ? "Edit Task" : (isEditing === "add" ? "Add Task" : "View Task")}</DialogTitle>
                <DialogContent>
                    <Tabs value={tabIndex} onChange={handleTabChange} aria-label="Tabs">
                        <Tab label="Task Info" data-testid="taskInfo" />
                        <Tab label="Documents" data-testid="document" />
                        <Tab label="Load Info" data-testid="loadInfo" />
                    </Tabs>

                    {tabIndex === 0 && (
                        <Box>
                            <form onSubmit={handleSubmit} className="dialog-form">
                                <p>Assignee: {formData.vehicleOwnerId}</p>
                                <p>Driver: {formData.driverId}</p>
                                <p>Truck ID: {formData.numberPlate}</p>
                                <p>Trip Status: {formData.status}</p>
                                <FormControl fullWidth data-testid="satusFormControl">
                                    <InputLabel id="status-label" data-testid="downloadBtn">Task Status</InputLabel>
                                    <Select
                                        labelId="status-label"
                                        id="status"
                                        name="status"  // Set the name prop to match the field in formData
                                        value={formData.status}  // Bind value to formData.status
                                        label="Task Status"
                                        onChange={handleChange}  // Handle the change event
                                        className="text-field"
                                        disabled={isEditing === "view"}
                                        data-testid="satusSelect"
                                    >
                                        <MenuItem value="Not Started" data-testid="notStarted">Not Started</MenuItem>
                                        <MenuItem value="In Progress" data-testid="inProgress">In Progress</MenuItem>
                                        <MenuItem value="Completed" data-testid="completed">Completed</MenuItem>
                                    </Select>
                                </FormControl>

                                <TextField
                                    label="Start Point"
                                    name="startPoint"
                                    type="text"
                                    value={formData.startPoint || ''}
                                    onChange={handleChange}
                                    disabled
                                    className="text-field"
                                    data-testid="startPoint"
                                />
                                <TextField
                                    label="End Point"
                                    name="endPoint"
                                    type="text"
                                    value={formData.endPoint || ''}
                                    onChange={handleChange}
                                    disabled
                                    className="text-field"
                                    data-testid="endPoint"
                                />
                                <DialogActions>
                                    <Button onClick={handleClose} color="primary" data-testid="taskCancelBtn">Cancel</Button>
                                    <Button type="submit" color="primary" >{isEditing === "view" ? "View Map" : "Submit"}</Button>
                                </DialogActions>
                            </form>
                        </Box>
                    )}

                    {tabIndex === 1 && (
                        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <div>
                                <Typography variant="subtitle1">On Load Receipt</Typography>
                                <TextField
                                    type="file"
                                    variant="outlined"
                                    fullWidth
                                    onChange={(e) => handleFileChange(e, 'onload')}
                                    InputLabelProps={{ shrink: true }}
                                    InputProps={{
                                        readOnly: isEditing === "view",  // Prevent input when 'view' mode
                                    }}
                                    disabled={isEditing === "view"}  // Completely disable the file input when 'view' mode
                                    data-testid="onLoadReceipt"
                                />

                                {formData.fileUrls[0] && (
                                    <Typography variant="body2" style={{ marginTop: "10px" }}>
                                        <a
                                            href={`http://localhost:8800/uploadFile/uploads/${encodeURIComponent(formData.fileUrls[0].url.split('/').pop())}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            crossOrigin="anonymous"
                                        >
                                            View onload
                                        </a>
                                    </Typography>
                                )}




                            </div>
                            <div>
                                <Typography variant="subtitle1">Off Load Receipt</Typography>
                                <TextField
                                    type="file"
                                    variant="outlined"
                                    fullWidth
                                    onChange={(e) => handleFileChange(e, 'offload')}
                                    InputLabelProps={{ shrink: true }}
                                    InputProps={{
                                        readOnly: isEditing === "view",  // Prevent input when 'view' mode
                                    }}
                                    disabled={isEditing === "view"}  // Completely disable the file input when 'view' mode
                                    data-testid="offLoadReciept"
                                />

                                {formData.fileUrls[1] && (
                                    <Typography variant="body2" style={{ marginTop: "10px" }}>
                                        <a
                                            href={`http://localhost:8800/uploadFile/uploads/${encodeURIComponent(formData.fileUrls[1].url.split('/').pop())}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            crossOrigin="anonymous"
                                        >
                                            View offload
                                        </a>
                                    </Typography>
                                )}

                            </div>

                            <DialogActions>
                                <Button onClick={handleClose} color="primary" data-testid="documentCancelBtn">Cancel</Button>
                                <Button type="submit" color="primary" >{isEditing === "view" ? "View Map" : "Submit"}</Button>
                            </DialogActions>
                        </Box>
                    )}

                    {tabIndex === 2 && (
                        <Box>
                            <form onSubmit={handleSubmit} className="dialog-form">
                                <TextField
                                    label="On Load in Kgs"
                                    name="onload"
                                    type="text"
                                    value={formData.onload || ''}
                                    onChange={handleChange}
                                    className="text-field"
                                    InputProps={{
                                        readOnly: isEditing === "view",
                                    }}
                                    data-testid="onload"
                                />
                                <TextField
                                    label="Off Load in Kgs"
                                    name="offload"
                                    type="text"
                                    value={formData.offload || ''}
                                    onChange={handleChange}
                                    className="text-field"
                                    InputProps={{
                                        readOnly: isEditing === "view",
                                    }}
                                    data-testid="offload"
                                />
                                <DialogActions>
                                    <Button onClick={handleClose} color="primary" data-testid="loadInfoCancelBtn">Cancel</Button>
                                    <Button type="submit" color="primary" >{isEditing === "view" ? "View Map" : "Submit"}</Button>
                                </DialogActions>
                            </form>
                        </Box>
                    )}
                </DialogContent>
            </Dialog>
        </div>

    );
};

export default DriverTask;
