import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography, Box, FormControlLabel, Checkbox } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import './breakDownList.css';

const BreakDownList = () => {
    const [rows, setRows] = useState([]);
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({ noteId: '', senderId: '', note: '', numberPlate: '', breakdown: '', timestamp: '' });
    const [searchText, setSearchText] = useState('');
    const [filteredRows, setFilteredRows] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedTechnician, setSelectedTechnician] = useState(null);
    const [senders, setSenders] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const { userId } = location.state || {};

    useEffect(() => {
        fetchBreakDowns();
        fetchTechnicians();
    }, []);

    useEffect(() => {
        setFilteredRows(
            rows.filter(
                (row) =>
                    row.noteId.toLowerCase().includes(searchText.toLowerCase()) ||
                    row.note.toLowerCase().includes(searchText.toLowerCase()) ||
                    row.numberPlate.toLowerCase().includes(searchText.toLowerCase()) ||
                    row.breakdown.toLowerCase().includes(searchText.toLowerCase()) ||
                    row.timestamp.toLowerCase().includes(searchText.toLowerCase())

            )
        );
    }, [searchText, rows]);

    useEffect(() => {
        if (searchQuery) {
            axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/user/truckDrivers?query=${searchQuery}`)
                .then(response => setSenders(response.data));
        }
    }, [searchQuery]);

    const fetchBreakDowns = async () => {
        try {
            const response = await axios.get('${import.meta.env.VITE_API_BASE_URL}/backend/message/breakDown', {
                params: { userId }
            });

            const breakDowns = await Promise.all(response.data.map(async breakDown => {
                let senderDetails = null;
                if (breakDown.senderId) {
                    try {
                        const senderResponse = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/user/${breakDown.senderId}`);
                        senderDetails = senderResponse.data;
                    } catch (techError) {
                        console.error(`Error fetching technician ${breakDown.senderId}:`, techError);
                    }
                }

                return {
                    ...breakDown,
                    id: breakDown.noteId,  // Use noteId as the unique id
                    senders: senderDetails ? `${senderDetails.firstName} ${senderDetails.lastName}` : 'N/A'
                };
            }));

            setRows(breakDowns);
        } catch (error) {
            console.error('Error fetching items:', error);
        }
    };

    const fetchTechnicians = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/user/technicians`);
            setSenders(response.data);
        } catch (error) {
            console.error('Error fetching technicians:', error);
        }
    };

    const handleOpen = () => {
        setFormData({ noteId: '', senderId: '', note: '', numberPlate: '', breakdown: '', timestamp: '' });
        setOpen(true);
        setIsEditing(false);
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
            if (selectedTechnician) {
                formData.technician = selectedTechnician._id;
            }

            if (isEditing) {
                await axios.put(`${import.meta.env.VITE_API_BASE_URL}/backend/installation/${formData._id}`, formData);
            } else {
                await axios.post(`${import.meta.env.VITE_API_BASE_URL}/backend/installation`, formData);
            }
            fetchBreakDowns();
            handleClose();
        } catch (error) {
            console.error('Error submitting form:', error);
        }
    };

    const handleEdit = (id) => {
        const item = rows.find((row) => row.id === id);
        setFormData(item);
        setIsEditing(true);
        setOpen(true);
    };

    const columns = [
        { field: 'note', headerName: 'Note', width: 500, editable: true },
        { field: 'numberPlate', headerName: 'Number Plate', width: 150, editable: true },
        { field: 'breakdown', headerName: 'Breakdown', type: 'boolean', width: 100, editable: true },
        { field: 'timestamp', headerName: 'Timestamp', width: 250, editable: true },
        { field: 'senders', headerName: 'Sender', width: 250 }
    ];

    return (
        <>
            <div className="breakDown-list-container">
                <Typography variant="h4" gutterBottom>BreakDowns</Typography>
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
                    getRowId={(row) => row.id}  // Use the custom id
                    className="data-grid"
                    data-testid="dataGrid"
                />
                <Dialog open={open} onClose={handleClose}>
                    <DialogTitle>{isEditing ? 'Edit Breakdown' : 'Add Breakdown'}</DialogTitle>
                    <DialogContent>
                        <form onSubmit={handleSubmit} className="dialog-form">
                            <TextField
                                label="Note ID"
                                name="noteId"
                                type="text"
                                value={formData.noteId}
                                onChange={handleChange}
                                className="text-field"
                                data-testid="noteId"
                            />
                            <TextField
                                label="Note"
                                name="note"
                                type="text"
                                value={formData.note}
                                onChange={handleChange}
                                className="text-field"
                                data-testid="note"
                            />
                            <TextField
                                label="Number Plate"
                                name="numberPlate"
                                type="text"
                                value={formData.numberPlate}
                                onChange={handleChange}
                                className="text-field"
                                data-testid="numberPlate"
                            />


                            <FormControlLabel
                                control={
                                    <Checkbox
                                        name="breakdown"
                                        checked={Boolean(formData.breakdown)}  // Convert to boolean
                                        onChange={handleChange}
                                        disabled
                                        data-testid="breakdown"
                                    />
                                }
                                label="breakdown"
                                className="text-field"
                            />

                            <TextField
                                label="Timestamp"
                                name="timestamp"
                                type="text"
                                value={formData.timestamp}
                                onChange={handleChange}
                                className="text-field"
                                data-testid="breakdown"
                            />
                            <DialogActions>
                                <Button onClick={handleClose} color="primary" data-testid="cancelBtn">
                                    Cancel
                                </Button>
                                <Button type="submit" color="primary" data-testid="submitBtn">
                                    {isEditing ? 'Save' : 'Add'}
                                </Button>
                            </DialogActions>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
};

export default BreakDownList;
