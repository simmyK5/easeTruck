import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Typography, TextField, Box } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useAuth0 } from '@auth0/auth0-react';
import './allServiceSummary.css';
import { useLocation } from "react-router-dom";

const AllServiceSummary = () => {
    const [rows, setRows] = useState([]);
    const { user } = useAuth0();
    const [userDetail, setUserDetails] = useState({ _id: '' });
    const [searchText, setSearchText] = useState('');
    const [filteredRows, setFilteredRows] = useState([]);
    const location = useLocation();
    const userId = location.state?.userId;

    useEffect(() => {
        if (user) {
            fetchUserDetails(user.email);
        }
    }, [user]);

    const fetchUserDetails = async (email) => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/user/users/${email}`);
            setUserDetails(response.data._id);
        } catch (error) {
            console.error('Error fetching user details:', error);
        }
    };

    const fetchItems = useCallback(async () => {
        try {
            console.log("hectic", userId)
            if (userId) {


                const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/truck/serviceSummaries/${userId}`);
                setRows(response.data);
                console.log("slender", response.data)
            }
        } catch (error) {
            console.error('Error fetching items:', error);
        }
    }, [userDetail]);

    useEffect(() => {
        fetchItems();
    }, [userDetail, fetchItems]);

    useEffect(() => {
        setFilteredRows(
            rows.filter((row) =>
                row.numberPlate.toLowerCase().includes(searchText.toLowerCase()) ||
                row.mileage.toLowerCase().includes(searchText.toLowerCase()) ||
                row.make.toLowerCase().includes(searchText.toLowerCase()) ||
                row.model.toLowerCase().includes(searchText.toLowerCase()) ||
                row.year.toLowerCase().includes(searchText.toLowerCase()) ||
                row.driverName.toLowerCase().includes(searchText.toLowerCase())
            )
        );
    }, [searchText, rows]);



    return (
        <div className="summary-list-container">

            <Box className="flex-container">
                <Box className="box">
                    <Typography variant="h4" gutterBottom>
                        All Service Summaries
                    </Typography>
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
            <Box sx={{ maxHeight: 600, overflowY: 'auto' }}>
                <DataGrid
                    rows={filteredRows}
                    columns={[
                        { field: "numberPlate", headerName: "Number Plate", width: 200 },
                        { field: "mileage", headerName: "Mileage", width: 200 },
                        { field: "make", headerName: "Make", width: 250 },
                        { field: "model", headerName: "Model", width: 250 },
                        { field: "year", headerName: "Year", width: 100 },
                        { field: "driverName", headerName: "Driver Name", width: 400 },
                    ]}
                    pageSize={10}
                    rowsPerPageOptions={[10]}
                    pagination
                    getRowId={(row) => row.id}
                    
                />
            </Box>
        </div>
    );
};

export default AllServiceSummary;
