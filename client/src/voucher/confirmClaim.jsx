import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';
import { Button, TextField, Box } from '@mui/material';
import { useAuth0 } from '@auth0/auth0-react';
import './confirmClaim.css';

const ConfirmClaim = () => {
    const { user } = useAuth0();
    const [claimVouchers, setClaimVouchers] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [filteredRows, setFilteredRows] = useState([]);
    const [userId, setUserId] = useState(null);

    // ✅ Fetch userId based on email
    const fetchUserId = useCallback(async (email) => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/user/users/${email}`);
            return response.data._id;
        } catch (error) {
            console.error('Error fetching user ID:', error);
            return null;
        }
    }, []);

    // ✅ Fetch all vouchers
    const fetchAll = useCallback(async () => {
        try {
            const id = await fetchUserId(user.email);
            if (id) {
                setUserId(id);
                await fetchClaimVouchers(id);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }, [user.email, fetchUserId]);

    // ✅ Initial load
    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    // ✅ Fetch vouchers for user
    const fetchClaimVouchers = async (id) => {
        try {
            const resp = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/claimVoucher/${id}`);
            setClaimVouchers(resp.data);
        } catch (err) {
            console.error('Error fetching claim vouchers:', err);
        }
    };

    // ✅ Filter claim vouchers by reseller info
    useEffect(() => {
        const search = searchText.toLowerCase();
        const filtered = claimVouchers.filter(v =>
            v.resellerName?.toLowerCase().includes(search) ||
            v.resellerSurname?.toLowerCase().includes(search) ||
            v.resellerEmail?.toLowerCase().includes(search)
        );
        setFilteredRows(filtered);
    }, [searchText, claimVouchers]);

    // ✅ Confirm voucher
    const handleConfirm = async (voucherClaim) => {
        try {
            if (voucherClaim) {
                const updated = { ...voucherClaim, isConfirmed: true };
                await axios.put(`${import.meta.env.VITE_API_BASE_URL}/backend/claimVoucher/confirm/${voucherClaim._id}`, updated);
                fetchAll();
            }
        } catch (error) {
            console.error('Error confirming claim:', error);
        }
    };

    // ✅ Columns for DataGrid
    const columns = [
        { field: 'resellerName', headerName: 'Reseller Name', width: 200 },
        { field: 'resellerSurname', headerName: 'Reseller Surname', width: 200 },
        { field: 'resellerEmail', headerName: 'Reseller Email', width: 250 },
        {
            field: 'claim',
            headerName: 'Claim',
            width: 150,
            renderCell: (params) => (
                <Button
                    variant="contained"
                    color="primary"
                    disabled={params.row.isConfirmed}
                    onClick={() => handleConfirm(params.row)}
                >
                    Confirm
                </Button>
            ),
        },
    ];

    return (
        <div className="voucher-list-container">
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <TextField
                    label="Search by Reseller"
                    variant="outlined"
                    fullWidth
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                />
            </Box>
            <DataGrid
                rows={filteredRows}
                columns={columns}
                pageSize={10}
                rowsPerPageOptions={[10]}
                getRowId={(row) => row._id}
                autoHeight
                className="data-grid"
            />
        </div>
    );
};

export default ConfirmClaim;
