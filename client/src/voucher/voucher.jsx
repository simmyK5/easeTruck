import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import RedeemVoucherButton from './redeemVoucherButton';
import { DataGrid } from '@mui/x-data-grid';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button } from '@mui/material';
import { useAuth0 } from '@auth0/auth0-react';

const Voucher = () => {
  const [vouchers, setVouchers] = useState([]);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const { user } = useAuth0();
  const [userDetail, setUserDetails] = useState({ _id: '' });

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

  const fetchItems =useCallback( async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/voucher/${userDetail._id}`);
      setVouchers(response.data);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  }, [userDetail]);


  
  useEffect(() => {
    if (userDetail) {
      fetchItems();
    }

  }, [userDetail, fetchItems]);


  // Fetch all vouchers for a use

  const handleSelectedVoucher = (voucher) => {
    setSelectedVoucher(voucher);
    setOpenDialog(true);
  };

  const closeDialog = () => {
    setOpenDialog(false);
    setSelectedVoucher(null);
  };

  const columns = [
    { field: 'code', headerName: 'Voucher Code', width: 150 },
    { field: 'value', headerName: 'Amount', width: 100 },
    { field: 'expiryDate', headerName: 'Expiry Date', width: 150 },
    { field: 'isRedeemed', headerName: 'Redeemed?', width: 120 },
    { field: 'driver', headerName: 'Driver ID', width: 150 },
    {
      field: 'action',
      headerName: 'Action',
      width: 120,
      renderCell: (params) => (
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleSelectedVoucher(params.row)}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <PayPalScriptProvider options={{ 'client-id':import.meta.env.VITE_PAYPAL_CLIENT_ID }}>
      <div>
        <h1>Vouchers</h1>
        <div style={{ height: 400, width: '100%' }}>
          <DataGrid
            rows={vouchers}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5]}
            disableSelectionOnClick
            getRowId={(row) => row._id}
          />
        </div>

        {selectedVoucher && (
          <Dialog open={openDialog} onClose={closeDialog}>
            <DialogTitle>Voucher Details</DialogTitle>
            <DialogContent>
              <p>Code: {selectedVoucher.code}</p>
              <p>Value: ${selectedVoucher.value}</p>
              <p>Expiry Date: {new Date(selectedVoucher.expiryDate).toLocaleDateString()}</p>
              <p>Redeemed: {selectedVoucher.isRedeemed ? 'Yes' : 'No'}</p>
              {!selectedVoucher.isRedeemed && (
                <RedeemVoucherButton
                  voucherCode={selectedVoucher.code}
                  amount={selectedVoucher.value}
                />
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={closeDialog} color="primary">
                Close
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </div>
    </PayPalScriptProvider>
  );
};

export default Voucher;
