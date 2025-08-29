import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Box } from '@mui/material';
import { useAuth0 } from '@auth0/auth0-react';
import { useForm, Controller } from 'react-hook-form';
import './voucher.css';

const Voucher = () => {
  const { user } = useAuth0();
  const [vouchers, setVouchers] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [filteredRows, setFilteredRows] = useState([]);
  const [open, setOpen] = useState(false);
  const [redeemOpen, setRedeemOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  // Form for Claim Voucher
  const {
    register: claimRegister,
    handleSubmit: handleClaimSubmit,
    formState: { errors: claimErrors },
    reset: resetClaimForm,
  } = useForm({
    defaultValues: {
      resellerName: '',
      resellerSurname: '',
      resellerEmail: '',
      clientName: '',
      clientSurname: '',
      clientEmail: '',
    },
  });

  // Form for Redeem Voucher
  const {
    register: redeemRegister,
    handleSubmit: handleRedeemSubmit,
    formState: { errors: redeemErrors },
    reset: resetRedeemForm,
  } = useForm({
    defaultValues: {
      fullName: '',
      bankName: '',
      accountNumber: '',
      accountType: '',
      branchCode: '',
    },
  });

  // 1️⃣ Fetch user details for ID
  const [userId, setUserId] = useState(null);
  const [redeemVoucherId, setRedeemVoucherId] = useState(null);



  useEffect(() => {
    if (!user) return;
    axios
      .get(`${import.meta.env.VITE_API_BASE_URL}/backend/user/users/${user.email}`)
      .then(resp => setUserId(resp.data._id))
      .catch(console.error);
  }, [user]);


  const fetchVouchers = useCallback(async () => {
    if (!searchText) return;
    try {
      console.log("worship rise", searchText);
      const resp = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/voucher/${searchText}`);
      setVouchers(resp.data);
    } catch (err) {
      console.error('Error fetching vouchers:', err);
    }
  }, [searchText, userId]);



  useEffect(() => {
    console.log(searchText)
    setFilteredRows(
      vouchers.filter(v => v.code.toLowerCase().includes(searchText.toLowerCase()))
    );
  }, [searchText, vouchers]);

  // 4️⃣ Redeem handler
  const handleRedeem = async (formData) => {
    console.log("welele")
    if (!redeemVoucherId) return alert("No voucher selected.");
    try {
      const updatedData = {
        ...formData,
        isRedeemed: true
      };

      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/backend/claimVoucher/payouts/${redeemVoucherId}`,
        updatedData
      );

      alert(`Voucher redeemed successfully!`);
      setRedeemOpen(false);
      setRedeemVoucherId(null);
      fetchVouchers(); // refresh list
    } catch (err) {
      console.error('Redeem error:', err);
    }
  };


  // 5️⃣ Columns
  const columns = [
    { field: 'code', headerName: 'Voucher Code', width: 150 },
    { field: 'value', headerName: 'Amount (R)', width: 120 },
    {
      field: 'expiryDate',
      headerName: 'Expiry Date',
      width: 150,
      valueFormatter: ({ value }) =>
        new Date(value).toLocaleDateString('en-ZA'),
    },
    {
      field: 'isRedeemed',
      headerName: 'Redeemed?',
      width: 120,
      valueFormatter: ({ value }) => (value ? 'Yes' : 'No'),
    },
    {
      field: 'claim',
      headerName: 'Claim',
      width: 150,
      renderCell: (params) => (
        <Button
          variant="contained"
          color="primary"
          disabled={params.row.isRedeemed}
          onClick={() => {
            setSelectedVoucher(params.row); // keep if needed
            setRedeemVoucherId(params.row._id);
            setRedeemOpen(true);
            resetRedeemForm();
          }}

        >
          Redeem
        </Button>

      ),
    },
  ];

  const handleOpen = () => {
    resetClaimForm();
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setRedeemOpen(false);
  };

  const handleOnSubmit = async (data) => {
    try {
      const formData = { ...data };
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/backend/claimVoucher/claim`, formData);
      handleClose();
      resetClaimForm({
        resellerName: '',
        resellerSurname: '',
        resellerEmail: '',
        clientName: '',
        clientSurname: '',
        clientEmail: '',
      });
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <div className="voucher-list-container">
      <Box className="box">
        <Box>
          <TextField
            label="Search Code"
            variant="outlined"
            fullWidth
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                fetchVouchers();  // Trigger the fetch on Enter
              }
            }}
          />
        </Box>
        <Box className="box">
          <Button onClick={handleOpen} variant="contained" color="primary" data-testid="addClaim">Add Claim</Button>
        </Box>
      </Box>
      <DataGrid
        rows={filteredRows}
        columns={columns}
        pageSize={10}
        rowsPerPageOptions={[10]}
        getRowId={row => row._id}
        autoHeight
        className="data-grid"
        data-testid="dataGrid"
      />

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle> Claim Voucher</DialogTitle>
        <DialogContent>
          <form onSubmit={handleClaimSubmit(handleOnSubmit)} className="dialog-form">
            <TextField
              label="Reseller Name"
              name="resellerName"
              type="text"
              margin="normal"
              className="text-field"
              data-testid="resellerName"
              {...claimRegister('resellerName', { required: 'Reseller Name is required' })}
              error={!!claimErrors.resellerName}
              helperText={claimErrors.resellerName?.message}
            />
            <TextField
              label="reseller Surname"
              name="resellerSurname"
              type="text"
              margin="normal"
              className="text-field"
              data-testid="resellerSurname"
              {...claimRegister('resellerSurname', { required: 'Reseller Surname is required' })}
              error={!!claimErrors.resellerSurname}
              helperText={claimErrors.resellerSurname?.message}
            />
            <TextField
              label="Reseller Email"
              name="resellerEmail"
              type="text"
              margin="normal"
              className="text-field"
              data-testid="resellerEmail"
              {...claimRegister('resellerEmail', { required: 'resellerEmail is required' })}
              error={!!claimErrors.resellerEmail}
              helperText={claimErrors.resellerEmail?.message}
            />
            <TextField
              label="Client Name"
              name="clientName"
              type="text"
              margin="normal"
              className="text-field"
              data-testid="clientName"
              {...claimRegister('clientName', { required: 'Client Name is required' })}
              error={!!claimErrors.clientName}
              helperText={claimErrors.clientName?.message}
            />
            <TextField
              label="Client Surname"
              name="clientSurname"
              type="text"
              margin="normal"
              className="text-field"
              data-testid="clientSurname"
              {...claimRegister('clientSurname', { required: 'Client Surname is required' })}
              error={!!claimErrors.clientSurname}
              helperText={claimErrors.clientSurname?.message}
            />
            <TextField
              label="Client Email"
              name="clientEmail"
              type="text"
              margin="normal"
              className="text-field"
              data-testid="clientEmail"
              {...claimRegister('clientEmail', { required: 'Client Email is required' })}
              error={!!claimErrors.clientEmail}
              helperText={claimErrors.clientEmail?.message}
            />

            <DialogActions>
              <Button onClick={handleClose} color="secondary" data-testid="cancel">Cancel</Button>
              <Button type="submit" color="primary" data-testid="submit">Add</Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={redeemOpen} onClose={handleClose}>
        <DialogTitle> Enter baking details</DialogTitle>
        <DialogContent>
          <form onSubmit={handleRedeemSubmit(() => handleRedeem(selectedVoucher))} className="dialog-form">
            <TextField
              label="Full Name"
              name="fullName"
              type="text"
              margin="normal"
              className="text-field"
              data-testid="fullName"
              {...redeemRegister('fullName', { required: 'Full Name is required' })}
              error={!!redeemErrors.fullName}
              helperText={redeemErrors.fullName?.message}
            />
            <TextField
              label="Bank Name"
              name="bankName"
              type="text"
              margin="normal"
              className="text-field"
              data-testid="bankName"
              {...redeemRegister('bankName', { required: 'Bank Name is required' })}
              error={!!redeemErrors.bankName}
              helperText={redeemErrors.bankName?.message}
            />
            <TextField
              label="Account Number"
              name="accountNumber"
              type="text"
              margin="normal"
              className="text-field"
              data-testid="accountNumber"
              {...redeemRegister('accountNumber', { required: 'Account Number is required' })}
              error={!!redeemErrors.accountNumber}
              helperText={redeemErrors.accountNumber?.message}
            />
            <TextField
              label="Account Type"
              name="accountType"
              type="text"
              margin="normal"
              className="text-field"
              data-testid="accountType"
              {...redeemRegister('accountType', { required: 'Account Type is required' })}
              error={!!redeemErrors.accountType}
              helperText={redeemErrors.accountType?.message}
            />
            <TextField
              label="Branch Code"
              name="branchCode"
              type="text"
              margin="normal"
              className="text-field"
              data-testid="branchCode"
              {...redeemRegister('branchCode', { required: 'Branch Code is required' })}
              error={!!redeemErrors.branchCode}
              helperText={redeemErrors.branchCode?.message}
            />

            <DialogActions>
              <Button onClick={handleClose} color="secondary" data-testid="cancel">Cancel</Button>
              <Button type="submit" color="primary" data-testid="submit">Add</Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Voucher;
