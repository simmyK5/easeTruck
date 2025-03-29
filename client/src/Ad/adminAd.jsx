import React, { useState, useEffect ,useCallback} from 'react';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import axios from 'axios';
import { DeleteOutline, EditOutlined ,VisibilityOutlined} from '@mui/icons-material';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Box, Typography, FormControl, InputLabel, Select, MenuItem, TextField } from '@mui/material';
import './adminAd.css';

const AdminAd = () => {
    const [rows, setRows] = useState([]);
    const [open, setOpen] = useState(false);
    const [adData, setAdData] = useState({
        _id: '',
        title: '',
        content: '',
        imagePath: '',
        linkUrl: '',
        startDate: '',
        endDate: '',
        active: '',
        adType: '',
        totalAmount: '',
        paymentStatus: ''
    });
    
    const [period, setPeriod] = useState('today'); // Added state for period
    const [filteredRows, setFilteredRows] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [searchText, setSearchText] = useState(''); // Added state for search text

    const fetchItems =useCallback( async () => {
        console.log("see period change",period)
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/ad/adminAds`,{ params: {
                period: period,
            }});
            console.log("see me now",response)
            setAdData(response.data);
            setRows(response.data);
        } catch (error) {
            console.error('Error fetching drivers:', error);
        }
    }, [period]);

    useEffect(() => {
        fetchItems();
    }, [period,fetchItems]);

    useEffect(() => {
        setFilteredRows(
            rows.filter((row) =>
                (row.title ? row.title.toLowerCase() : '').includes(searchText.toLowerCase()) ||
                (row.content ? row.content.toLowerCase() : '').includes(searchText.toLowerCase()) ||
                (row.imagePath ? row.imagePath.toLowerCase() : '').includes(searchText.toLowerCase()) ||
                (row.linkUrl ? row.linkUrl.toLowerCase() : '').includes(searchText.toLowerCase()) ||
                (row.startDate ? row.startDate.toLowerCase() : '').includes(searchText.toLowerCase()) ||
                (row.endDate ? row.endDate.toLowerCase() : '').includes(searchText.toLowerCase()) ||
                (row.active ? row.active.toString().toLowerCase() : '').includes(searchText.toLowerCase()) ||
                (row.adType ? row.adType.toLowerCase() : '').includes(searchText.toLowerCase()) ||
                (row.totalAmount ? row.totalAmount.toLowerCase() : '').includes(searchText.toLowerCase()) ||
                (row.paymentStatus ? row.paymentStatus.toLowerCase() : '').includes(searchText.toLowerCase())
            )
        );
    }, [searchText, rows]);

   

    const handleDeleteItem = async (id) => {
        try {
            await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/backend/feedback/${id}`);
            fetchItems(); // Refresh data after deletion
        } catch (error) {
            console.error('Error deleting driver:', error);
        }
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setAdData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await axios.put(`${import.meta.env.VITE_API_BASE_URL}/backend/feedback/${adData._id}`, adData);
            }
            fetchItems(); // Refresh data after adding/editing
            handleClose();
        } catch (error) {
            console.error('Error submitting driver form:', error);
        }
    };

    const handleEdit = (id) => {
        const item = rows.find((row) => row._id === id._id);
        setAdData(item);
        setIsEditing(true);
        setOpen(true);
    };

    const handleView = (id) => {
        const item = rows.find((row) => row._id === id._id);
        setIsEditing("view");
        setAdData(item);
        setOpen(true);
    };

    const columns = [
        { field: 'title', headerName: 'Title', width: 120, editable: true },
        { field: 'content', headerName: 'Content', width: 200, editable: true },
        { field: 'linkUrl', headerName: 'Link Url', width: 200, editable: true },
        { field: 'startDate', headerName: 'Start Date', width: 100, editable: true },
        { field: 'endDate', headerName: 'End Date', width: 100, editable: true },
        { field: 'active', headerName: 'Active', width: 70, editable: true },
        { field: 'adType', headerName: 'Ad Type', width: 100, editable: true },
        { field: 'totalAmount', headerName: 'Total Amount', width: 110, editable: true },
        { field: 'paymentStatus', headerName: 'Payment Status', width: 120, editable: true },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 100,
            renderCell: (params) => (
                <div>
                    <GridActionsCellItem icon={<EditOutlined />} label="Edit" onClick={() => handleEdit(params.row)} />
                    <GridActionsCellItem icon={<DeleteOutline />} label="Delete" onClick={() => handleDeleteItem(params.row._id)} />
                    <GridActionsCellItem icon={<VisibilityOutlined />}label="View" onClick={() => handleView(params.row)}
                    />
                </div>
            )
        }
    ];

    return (
        <div className="ad-list-container">
            <Typography variant="h4" gutterBottom>Ad List</Typography>
            <Box className="flex-container">
            
            <Box className="box" >
                <FormControl fullWidth data-testid="periodFormControl">
                    <InputLabel>Period</InputLabel>
                    <Select value={period} onChange={(e) => setPeriod(e.target.value)} data-testid="periodFormControl">
                        <MenuItem value="today" data-testid="periodToday">Today</MenuItem>
                        <MenuItem value="week" data-testid="periodWeek">This Week</MenuItem>
                        <MenuItem value="month" data-testid="periodMonth">This Month</MenuItem>
                        <MenuItem value="4months" data-testid="periodFourMonths">Last 4 Months</MenuItem>
                        <MenuItem value="year" data-testid="periodYear">This Year</MenuItem>
                    </Select>
                </FormControl>
            </Box>
            <Box className="box" >
                <TextField
                    label="Search"
                    variant="outlined"
                    fullWidth
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    data-testid="search"
                />
            </Box>
            </Box>
            <DataGrid
                rows={filteredRows}
                columns={columns}
                autoHeight
                pageSize={10} // Show 10 rows per page
                rowsPerPageOptions={[10]} // Options for the number of rows per page
                getRowId={(row) => row._id}  // Specify the unique id field
                className="data-grid"
                data-testid="dataGrid"
            />
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>{isEditing ? 'Edit Driver' : 'Add Driver'}</DialogTitle>
                <DialogContent>
                    <form onSubmit={handleSubmit} lassName="dialog-form">
                        <TextField
                            label="Title"
                            name="title"
                            value={adData.title}
                            onChange={handleChange}
                            margin="normal"
                            variant="outlined"
                            InputProps={{
                                readOnly: isEditing === "view",
                            }}
                            className="text-field"
                            data-testid="title"
                            
                        />
                        <TextField
                            label="Content"
                            name="content"
                            value={adData.content}
                            onChange={handleChange}
                            margin="normal"
                            variant="outlined"
                            InputProps={{
                                readOnly: isEditing === "view",
                            }}
                            className="text-field"
                            data-testid="content"
                        />
                        <TextField
                            label="Link Url"
                            name="linkUrl"
                            value={adData.linkUrl}
                            onChange={handleChange}
                            margin="normal"
                            variant="outlined"
                            InputProps={{
                                readOnly: isEditing === "view",
                            }}
                            className="text-field"
                            data-testid="linkUrl"
                        />
                        <TextField
                            label="Start Date"
                            name="startDate"
                            value={adData.startDate}
                            onChange={handleChange}
                            margin="normal"
                            variant="outlined"
                            InputProps={{
                                readOnly: isEditing === "view",
                            }}
                            className="text-field"
                            disabled
                            data-testid="startDate"
                        />
                        <TextField
                            label="End Date"
                            name="endDate"
                            value={adData.endDate}
                            onChange={handleChange}
                            margin="normal"
                            variant="outlined"
                            InputProps={{
                                readOnly: isEditing === "view",
                            }}
                            className="text-field"
                            disabled
                            data-testid="endDate"
                        />
                        <TextField
                            label="Active"
                            name="active"
                            value={adData.active}
                            onChange={handleChange}
                            margin="normal"
                            variant="outlined"
                            InputProps={{
                                readOnly: isEditing === "view",
                            }}
                            className="text-field"
                            disabled
                            data-testid="active"
                        />
                        <TextField
                            label="Total Amount"
                            name="totalAmount"
                            value={adData.totalAmount}
                            onChange={handleChange}
                            margin="normal"
                            variant="outlined"
                            InputProps={{
                                readOnly: isEditing === "view",
                            }}
                            className="text-field"
                            disabled
                            data-testid="totalAmount"
                        />
                        <TextField
                            label="Payment Status"
                            name="paymentStatus"
                            value={adData.paymentStatus}
                            onChange={handleChange}
                            margin="normal"
                            variant="outlined"
                            InputProps={{
                                readOnly: isEditing === "view",
                            }}
                            className="text-field"
                            disabled
                            data-testid="paymentStatus"
                        />
                        <TextField
                            label="Ad Type"
                            name="adType"
                            value={adData.adType}
                            onChange={handleChange}
                            margin="normal"
                            variant="outlined"
                            InputProps={{
                                readOnly: isEditing === "view",
                            }}
                            className="text-field"
                            disabled
                            data-testid="adType"
                        />
                        <DialogActions>
                            <Button onClick={handleClose} color="primary" data-testid="cancelBtn">Cancel</Button>
                            <Button type="submit" color="primary" disabled={isEditing === "view"} data-testid="submitBtn">
                                {isEditing ? 'Update' : 'Add'} 
                            </Button>
                        </DialogActions>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminAd;
