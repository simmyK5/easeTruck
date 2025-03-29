import React from 'react';
import { Modal, Box, Button, Typography } from '@mui/material';
import axios from 'axios';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

const InstallationPayment = ({ open, items, totalAmount, userEmail, onClose, clearCart }) => {
    const createOrder = async () => {
        console.log(items)
        console.log(totalAmount)
        console.log(userEmail)
        try {
            const getUser = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/user/users/${userEmail}`);
            const buyer = {
                name: {
                    given_name: getUser.data.firstName,
                    surname: getUser.data.lastName
                },
                email_address: getUser.data.email
            };

            const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/backend/installation/create-order`, {
                buyer,
                items,
                totalAmount
            });

            if (!response.data.id) {
                throw new Error('Order ID not found in the response');
            }

            return response.data.id;
        } catch (error) {
            console.error("Error creating PayPal order:", error);
            throw error;
        }
    };

    const onApprove = async (data) => {
        try {

            await axios.post(`${import.meta.env.VITE_API_BASE_URL}/backend/installation/capture-order`, {
                orderID: data.orderID,
                items,
                totalAmount,
                userEmail,
            });

            alert('Installation payment successful!');
            clearCart();  // Clear the cart after successful payment
            onClose();
        } catch (error) {
            console.error("Error capturing PayPal order:", error);
            alert("Error completing payment, please try again.");
        }
    };

    return (
        <PayPalScriptProvider options={{ 'client-id':import.meta.env.VITE_PAYPAL_CLIENT_ID }}>
            <Modal open={open} onClose={onClose}>
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 400,
                        bgcolor: 'white',
                        boxShadow: 24,
                        p: 4,
                    }}
                >
                    <Typography variant="h6" gutterBottom>Checkout</Typography>
                    {items.map((item, index) => (
                        <Typography key={index}>{item.name} - R{item.price} x {item.quantity}</Typography>
                    ))}
                    <Typography variant="body1">Total: R{totalAmount.toFixed(2)}</Typography>
                    <PayPalButtons
                        createOrder={createOrder}
                        onApprove={onApprove}
                    />
                    <Button variant="outlined" onClick={onClose} style={{ marginTop: '10px' }}>
                        Close
                    </Button>
                </Box>
            </Modal>
        </PayPalScriptProvider>
    );
};

export default InstallationPayment;
