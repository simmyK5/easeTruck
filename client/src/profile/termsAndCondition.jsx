// TermsAndConditions.jsx
import React, { useState } from 'react';
import { Checkbox, FormControlLabel, Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import axios from 'axios';  // Make sure axios is imported
import TermsAndConditonsContent from './termsAndConditonsContent';

const TermsAndConditions = ({ open, handleClose, setAgreedToTandC, userEmail }) => {
  const [checked, setChecked] = useState(false);
 
  const [error, setError] = useState(null);  // Track error

  // Handle checkbox change
  const handleCheckboxChange = (event) => {
    setChecked(event.target.checked);
   
  };

  // Handle agreeing to terms
  const handleAgreeClick = async () => {
    if (checked) {
      try {
        const getUser = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/user/users/${userEmail}`);
        const email = getUser.data.email;
        console.log("User email retrieved:", email);

        // Post to update the terms and conditions
        await axios.post(`${import.meta.env.VITE_API_BASE_URL}/backend/user/termsAndCondition`, {
          email,
          checked,
        });

        setAgreedToTandC(true)
        handleClose(); // Close the dialog
      } catch (error) {
        console.error("Error updating Terms and Conditions:", error);
        setError("Error completing subscription, please try again.");
      }
    }
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Terms and Conditions</DialogTitle>
      <DialogContent>
      <TermsAndConditonsContent /> 
        <FormControlLabel
          control={<Checkbox checked={checked} onChange={handleCheckboxChange} />}
          label="I agree to the Terms and Conditions"
        />
        {error && <p style={{ color: 'red' }}>{error}</p>}  {/* Display error message */}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleAgreeClick} color="primary" disabled={!checked}>
          Agree
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TermsAndConditions;
