import React, { useEffect } from 'react';
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import axios from 'axios';

const AdPayment = ({ open, totalAmount, userEmail,selectedImage, items, onClose, onPaymentSuccess, onPaymentError,clearForm }) => {
  const [{ isPending }] = usePayPalScriptReducer();

  useEffect(() => {
    if (open) {
      // Optionally, you can perform some action when the modal opens
    }
  }, [open]);

  const createOrder = async () => {
    console.log(items);
    console.log(totalAmount);
    console.log(userEmail);
  
    try {
      // Fetch user details (first name, last name, and email)
      const getUser = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/user/users/${userEmail}`);
      const buyer = {
        name: {
          given_name: getUser.data.firstName,
          surname: getUser.data.lastName
        },
        email_address: getUser.data.email
      };
  
      // Post the order data to the backend to create the PayPal order
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/backend/ad/create-order`, {
        buyer,        // Send the buyer's name and email
        items,        // Pass the items array with ad details
        totalAmount   // Send the total amount for the order
      });
  
      // Ensure the backend returns an order ID
      if (!response.data.id) {
        throw new Error('Order ID not found in the response');
      }
  
      // Return the PayPal order ID
      return response.data.id;
    } catch (error) {
      console.error("Error creating PayPal order:", error);
      throw error;  // Propagate the error to handle it in the onApprove or caller function
    }
  };

  const onApprove = async (data) => {
    try {
      // Fetch the user info (e.g., email) based on the userEmail
      const getUser = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/user/users/${userEmail}`);
      const email = getUser.data.email; // Assuming `getUser.data.email` contains the user's email
      // Post the order details to the backend to capture the order
      console.log(items)
      console.log("pabi cooper")
      console.log( items[0].unit_amount.value)
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/backend/ad/capture-order`, {
        orderID: data.orderID,  // PayPal order ID
        adName: items[0].name,
        adCurreny: items[0].unit_amount.currency_code,
        adUnitAmount: items[0].unit_amount.value,
        adQuantity: items[0].quantity,            // Pass the items array with ad details
        adDescription: items[0].description,
        adLink: items[0].link,
        adStartDate: items[0].start_date,
        adEndDate: items[0].end_date,
        adType: items[0].ad_type,
        adActive: items[0].active,
        totalAmount: totalAmount,  // Pass the total amount calculated on the frontend
        email: email,     
        imagePath: selectedImage,       // Send the user's email to associate the order
      },{
        headers: {
          'Content-Type': 'multipart/form-data', // Set the correct content type for file uploads
        }});
  
      // Check if the capture was successful (assuming the backend responds with a success indicator)
      alert('Ad payment successful!');
      clearForm()
      onClose();
    } catch (error) {
      console.error("Error capturing PayPal order:", error);
      alert("Error completing payment, please try again.");
    }
  };

  /*const onApprove = async (data, actions) => {
    try {
        console.lo

        const orderData = {
            orderID: data.orderID,
            totalAmount: totalAmount,   // Pass the total amount calculated on the frontend
            items: items,               // Pass the items array with ad details
          };

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/backend/ad/capture-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          orderID: data.orderID
        })
      });
      const captureData = await response.json();
      onPaymentSuccess();
    } catch (error) {
      console.error('Error capturing PayPal order:', error);
      onPaymentError('Failed to capture order. Please try again.');
    }
  };*/

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Complete Your Payment</DialogTitle>
      <DialogContent>
        {isPending ? (
          <div>Loading...</div>
        ) : (
          <PayPalButtons
            createOrder={createOrder}
            onApprove={onApprove}
            onError={(err) => {
              console.error('PayPal Checkout onError:', err);
              onPaymentError('Payment failed. Please try again.');
            }}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AdPayment;
