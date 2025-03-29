import React, { useState, useEffect ,useCallback} from 'react';
import axios from 'axios';
import { Typography, Container, Dialog, DialogTitle, DialogContent } from '@mui/material';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import { useLocation } from 'react-router-dom';
import { DeleteOutline, VisibilityOutlined } from '@mui/icons-material';

const AllNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [voucherNotifications, setVoucherNotifications] = useState([]);
    const [newTaskNotifications, setNewTaskNotifications] = useState([]);
    const [rows, setRows] = useState([]);
    const [selectedNotification, setSelectedNotification] = useState(null);
    const location = useLocation();
    const { userId } = location.state || {};
    const [open, setOpen] = useState(false);

    console.log(userId)

    const handleToggle = (id) => {
        axios.put(`${import.meta.env.VITE_API_BASE_URL}/backend/notification/notifications/${id}`, { read: true, userId })
            .then(response => {
                console.log('Notification marked as read:', response.data);
            })
            .catch(error => {
                console.error('Error marking notification as read:', error);
            });
    };

    const fetchAllTaskNotifications = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/notification/completedNotification`, {
                params: { userId }
            });
            setNotifications(response.data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const fetchAllVoucherNotifications = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/notification/voucherNotification`, {
                params: { userId }
            });
            setVoucherNotifications(response.data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const fetchAllNewTaskNotifications = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/notification/newTaskNotification`, {
                params: { userId }
            });
            setNewTaskNotifications(response.data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const handleDeleteItem = async (id) => {
        try {
            await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/backend/notification/${id}`);
            fetchAllNotifications(); // Refresh data after deletion
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const handleView = (id) => {
        const item = rows.find((row) => row._id === id);
        setSelectedNotification(item);
        setOpen(true);
        handleToggle(id); // Mark the notification as read
    };

    const fetchAllNotifications =useCallback( () => {
        if (userId) {
            fetchAllTaskNotifications();
            fetchAllVoucherNotifications();
            fetchAllNewTaskNotifications();
        }
    }, [userId]);

    useEffect(() => {
        fetchAllNotifications();
    }, [fetchAllNotifications]);

    useEffect(() => {
        // Combine all notifications into a single array and set rows
        setRows([
            ...notifications,
            ...voucherNotifications,
            ...newTaskNotifications
        ]);
    }, [notifications, voucherNotifications, newTaskNotifications]);

    // Define the columns for the DataGrid
    /*const columns = [
        { field: 'timestamp', headerName: 'Timestamp', width: 200, valueGetter: (params) => new Date(params.value).toLocaleString() },
        { field: 'message', headerName: 'Message', width: 400 },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 150,
            renderCell: (params) => (
                <div>
                    <GridActionsCellItem icon={<DeleteOutline />} label="Delete" onClick={() => handleDeleteItem(params.row._id)} data-testid="deleteBtn" />
                    <GridActionsCellItem icon={<VisibilityOutlined />} label="View" onClick={() => handleView(params.row._id)} data-testid="viewBtn"/>
                </div>
            ),
        },
    ];*/

    return (
        <Container>
            <Typography variant="h4" gutterBottom>
                All Notifications
            </Typography>
            <div style={{ height: 600, width: '100%' }}>
                <DataGrid
                    rows={rows}
                    columns={[
                        { field: 'timestamp', headerName: 'Timestamp', width: 200},
                        { field: 'message', headerName: 'Message', width: 400 },
                        {
                            field: 'actions',
                            headerName: 'Actions',
                            width: 150,
                            renderCell: (params) => (
                                <div>
                                    <GridActionsCellItem icon={<DeleteOutline />} label="Delete" onClick={() => handleDeleteItem(params.row._id)} data-testid="deleteBtn" />
                                    <GridActionsCellItem icon={<VisibilityOutlined />} label="View" onClick={() => handleView(params.row._id)} data-testid="viewBtn"/>
                                </div>
                            ),
                        },
                    ]}
                    pageSize={10}
                    getRowId={(row) => row._id}
                    autoHeight
                    data-testid="dataGrid"
                />
            </div>
            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>Notification Details</DialogTitle>
                <DialogContent>
                    {selectedNotification && (
                        <div>
                            <Typography variant="body1"><strong>Message:</strong> {selectedNotification.message}</Typography>
                            <Typography variant="body1"><strong>Timestamp:</strong> {new Date(selectedNotification.timestamp).toLocaleString()}</Typography>
                            {/* Add more fields as needed */}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </Container>
    );
};

export default AllNotifications;
