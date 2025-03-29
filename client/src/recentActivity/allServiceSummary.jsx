import React, { useState, useEffect ,useCallback} from 'react';
import axios from 'axios';
import { Typography, TextField, Box } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useAuth0 } from '@auth0/auth0-react';
import './allServiceSummary.css';

const AllServiceSummary = () => {
    const [rows, setRows] = useState([]);
    const { user } = useAuth0();
    const [userDetail, setUserDetails] = useState({ _id: '' });
    const [searchText, setSearchText] = useState('');
    const [filteredRows, setFilteredRows] = useState([]);

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
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/truck/serviceSummaries/${userDetail}`);

            const serviceSummaries = await Promise.all(response.data.map(async serviceSummary => {
                const truckResponse = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/truck/getTrucks/${serviceSummary.truck}`);
                const truck = truckResponse.data;
                return {
                    id: serviceSummary.id,
                    nextServiceDate: new Date(serviceSummary.nextServiceDate).toISOString().split('T')[0], // Correct formatting
                    truck: `${truck.numberPlate} ${truck.make} ${truck.model} ${truck.year}`,
                    mileage: serviceSummary.mileage,
                    lastServiceDate: new Date(serviceSummary.lastServiceDate).toISOString().split('T')[0] // Correct formatting
                };
            }));
            setRows(serviceSummaries);
        } catch (error) {
            console.error('Error fetching items:', error);
        }
    }, [userDetail]);

    useEffect(() => {
        fetchItems();
    }, [userDetail,fetchItems]);

    useEffect(() => {
        setFilteredRows(
            rows.filter((row) =>
                row.nextServiceDate.toLowerCase().includes(searchText.toLowerCase()) ||
                row.truck.toLowerCase().includes(searchText.toLowerCase()) ||
                row.mileage.toLowerCase().includes(searchText.toLowerCase()) ||
                row.lastServiceDate.toLowerCase().includes(searchText.toLowerCase())
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
                <DataGrid
                        rows={rows}
                        columns={[
                            { field: 'nextServiceDate', headerName: 'Next Service Date', width: 250 },
                            { field: 'truck', headerName: 'Truck', width: 400 },
                            { field: 'mileage', headerName: 'Mileage', width: 100 },
                            { field: 'lastServiceDate', headerName: 'Last Service Date', width: 250 },
                            
                        ]}
                        pageSize={10}
                        getRowId={(row) => row.id}
                        autoHeight
                        data-testid="dataGrid"
                    />
        </div>
    );
};

export default AllServiceSummary;
