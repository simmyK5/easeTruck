import React, { useState, useEffect } from 'react';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import axios from 'axios';
import { EditOutlined } from "@mui/icons-material";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, TextField, Select, MenuItem, Autocomplete, Typography, Box } from '@mui/material';
import './adminInstallation.css';
import { useAuth0 } from '@auth0/auth0-react';
import { useForm, Controller } from 'react-hook-form';

const OutstandingInstallation = () => {
    const [rows, setRows] = useState([]);
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({ _id: '', email: '', status: '', paymentStatus: '', userId: '', paymentId: '', items: '', totalAmount: '', technician: '', createdAt: '', address: '' });
    const [searchText, setSearchText] = useState('');
    const [filteredRows, setFilteredRows] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const { user } = useAuth0();
    const {
        control,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm({
        defaultValues: {
            address: '',
        }
    });

    useEffect(() => {
        console.log("ikahle", user)
        if (user.email) {
            fetchItems(user.email);
        }
    }, [user]);

    useEffect(() => {
        setFilteredRows(
            rows.filter(
                (row) =>
                    (row.email && row.email.includes(searchText)) ||
                    (JSON.stringify(row.items).includes(searchText)) ||
                    (row.address && row.address.includes(searchText))
            )
        );
    }, [searchText, rows]);

    const fetchItems = async (email) => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/installation/outstandingInstallations/${email}`);
            const parsed = response.data.map((row) => ({
                ...row,
                items: Array.isArray(row.items)
                    ? row.items.map(item => typeof item === 'string' ? JSON.parse(item) : item)
                    : typeof row.items === 'string' ? JSON.parse(row.items) : row.items
            }));
            setRows(parsed);
        } catch (error) {
            console.error('Error fetching items:', error);
        }
    };

    const handleOnSubmit = async (data) => {
        try {

            console.log(editingId)
            if (editingId) {
                await axios.put(`${import.meta.env.VITE_API_BASE_URL}/backend/installation/${editingId}`, data);
            }
            fetchItems();
            handleClose();
            reset({
                address: '',
            });
        } catch (error) {
            console.error('Error submitting form:', error);
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

    const handleEdit = (params) => {
        //console.log(params._id)
        const item = rows.find((row) => row._id === params._id);
        console.log(item)
        reset({
            address: item.address,
        });
        setOpen(true);
        setEditingId(item._id); // Set the editing id
    };

    const columns = [
        { field: 'email', headerName: 'email', width: 150, editable: true },
        { field: 'address', headerName: 'address', width: 250, editable: true },
        {
            field: 'items',
            headerName: 'Items',
            width: 450,
            renderCell: (params) => {
                const items = params.row.items; // Accessing the items from the row
                if (Array.isArray(items)) {
                    return items
                        .map(item => `${item.name}, Price: ${item.price}, Quantity: ${item.quantity}`)
                        .join(' | ');
                }
                return ''; // Return empty string if items is not an array or does not exist
            }
        },
        { field: 'createdAt', headerName: 'createdAt', width: 155, editable: true },
        {
            field: 'payment',
            headerName: 'Make Payment',
            width: 150,
            renderCell: (params) => (
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handlePayment(params.row)}
                >
                    Pay Now
                </Button>
            ),
        },
        {
            field: "actions", headerName: "Actions", width: 70,
            renderCell: (params) => (
                <GridActionsCellItem
                    icon={<EditOutlined />}
                    label="Edit"
                    onClick={() => handleEdit(params.row)}
                    data-testid="editBtn"
                />
            ),
        },
    ];

    const handlePayment = (row) => {
        console.log("row", row)
        const paymentData = {
            amount: row.totalAmount,
            item_name: row.items,
            email_address: row.email,
            installationId: row._id,
            // You can add more fields like user ID, installation ID, etc.
        };

        // Redirect to PayFast payment page

        window.location.href = `https://sandbox.payfast.co.za/eng/process?merchant_id=${import.meta.env.VITE_PAYFAST_MERCHANT_ID}&merchant_key=${import.meta.env.VITE_PAYFAST_MERCHANT_KEY}&amount=${paymentData.amount}&item_name=${encodeURIComponent(paymentData.item_name)}&email_address=${paymentData.email_address}&return_url=${import.meta.env.VITE_PAYFAST_INSTALLATION_RETURN_URL}&cancel_url=${import.meta.env.VITE_PAYFAST_INSTALLATION_CANCEL_URL}&notify_url=${import.meta.env.VITE_PAYFAST_INSTALLATION_NOTIFY_URL}&custom_str1=${paymentData.installationId}`;

    };

    return (
        <>
            <div className="installation-list-container">
                <Typography variant="h4" gutterBottom>Installations</Typography>
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
                    <DialogTitle>Edit Installation</DialogTitle>
                    <form onSubmit={handleSubmit(handleOnSubmit)}>
                        <DialogContent>
                            <FormControl fullWidth margin="normal">
                                <Controller
                                    name="address"
                                    control={control}
                                    defaultValue=""
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            placeholder="Enter the address here"
                                            label="Address"
                                        />
                                    )}
                                />
                            </FormControl>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleClose} color="primary">
                                Cancel
                            </Button>
                            <Button type="submit" color="primary" data-testid="submitBtn">
                                Save
                            </Button>
                        </DialogActions>
                    </form>
                </Dialog>


            </div>
        </>
    );
};

export default OutstandingInstallation;
