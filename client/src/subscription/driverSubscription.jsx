import { Modal, Box, Button, Typography } from '@mui/material';
import React, { useState } from 'react';
import axios from 'axios';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';


const DriverSubscription = ({ open, plan, userEmail, onClose, setIsSubscribed, profileData }) => {
    const [isProcessing, setIsProcessing] = useState(false);

    console.log("see plan",plan)
    const createSubscription = async (data, actions) => {
        try {
            console.log("see profile",profileData)
           
            // Fetch subscriber details
          //  const getUser = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/user/driverSubUsers/${userEmail}`, { params: profileData });
          //  console.log("getUser",getUser)

            const subscriber = {
                name: {
                    given_name: profileData.firstName,
                    surname: profileData.lastName,
                },
                email_address: profileData.email,
            };

            // Call backend to get the subscription plan details
            const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/backend/subscription/create`, {
                plan,
                subscriber,
            });

            // Return the plan_id to PayPal
            return response.data.orderId;
        } catch (error) {
            console.error("Error creating subscription:", error);
            alert("Error initializing subscription. Please try again.");
            throw error;
        }
    };

    const onApprove = async (data) => {
        console.log("nithini bafana")
        try {
            // Extract subscription ID
            console.log(data)
            const subscriptionId = data.subscriptionID;
            const orderId = data.orderID;
            const billingToken = data.billingToken;
            console.log(userEmail)

            // Confirm subscription approval with backend
            const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/backend/subscription/driverApprove`, {
                subscriptionId,
                profileData,
                orderId,
                plan,
                userEmail,
                billingToken

            });

            alert('Subscription successful!');
            setIsSubscribed(true);
            onClose();
        } catch (error) {
            console.error("Error approving subscription:", error);
            alert("Error completing subscription. Please try again.");
        }
    };

    return (
        <PayPalScriptProvider options={{ 'client-id': import.meta.env.VITE_PAYPAL_CLIENT_ID, vault: true, intent: "subscription" }}>
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
                            <Typography variant="h6" gutterBottom>{plan?.title}</Typography>
                            <Typography variant="body1">Price: ${plan?.price}</Typography>
                            <Typography variant="body2">Features:</Typography>
                            <ul>
                                {plan?.features.map((feature, index) => (
                                    <li key={index}>{feature}</li>
                                ))}
                            </ul>
                            <div data-testid="payPalButtonWrapper">
                                <PayPalButtons
                                    data-testid="payPalButtons"
                                    style={{ layout: "vertical", label: "subscribe" }} // Forces inline rendering
                                    fundingSource="paypal" // Ensures PayPal button works inline
                                    forceReRender={[plan?.price]} // Ensures correct re-rendering
                                    createSubscription={(data, actions) => createSubscription(data, actions)}
                                    onApprove={(data, actions) => {
                                        console.log("Subscription Approved:", data);
                                        onApprove(data, actions); // Ensure inline approval
                                    }}
                                    onError={(error) => {
                                        console.error("PayPal error:", error);
                                        alert("Error with PayPal. Please try again.");
                                    }}
                                />
                            </div>
                            {isProcessing && <Typography variant="body2">Processing your subscription...</Typography>}
                            <Button variant="outlined" onClick={onClose} style={{ marginLeft: '10px' }} data-testid="closeButton">
                                Close
                            </Button>
                        </Box>
                    </Modal>
                </PayPalScriptProvider>
    );
};

export default DriverSubscription;