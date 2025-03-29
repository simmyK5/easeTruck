import { Modal, Box, Button, Typography } from '@mui/material';
import React, { useState } from 'react';
import axios from 'axios';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

const Subscription = ({ open, plan, userEmail, onClose, setIsSubscribed, setSubscriptionId, profileData }) => {
    console.log("ziyakhala manje plan", plan)
    console.log("ziyakhala manje userEmail", userEmail)
    console.log("ziyakhala manje setIsSubscribed", setIsSubscribed)
    console.log("ziyakhala manje setSubscriptionId", setSubscriptionId)
    console.log("ziyakhala manje profileData", profileData)
    const [isProcessing, setIsProcessing] = useState(false);

    const createSubscription = async (data, actions) => {
        try {
            // Fetch subscriber details
            const getUser = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/user/users/${userEmail}`);
            const subscriber = {
                name: {
                    given_name: getUser.data.firstName,
                    surname: getUser.data.lastName,
                },
                email_address: getUser.data.email,
            };

            // Call backend to get the subscription plan details
            const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/backend/subscription/create`, {
                plan,
                subscriber,
            });

            return response.data.orderId;

            /* const {orderId, billingToken } = response.data;
             console.log("orderId" , orderId)
             console.log("billingToken" , billingToken)
 
             // Return the plan_id to PayPal
             //return {id: orderId, billingToken };
             /*console.log("see data from create method", response.data)
             const { billingToken } = response.data;
             console.log("hay billing content",billingToken)
             return response.data.orderId;*/
        } catch (error) {
            console.error("Error creating subscription:", error);
            alert("Error initializing subscription. Please try again.");
            throw error;
        }
    };

    const onApprove = async (data) => {

        try {
            // Extract subscription ID
            console.log("nithini bafana", data)
            const subscriptionId = data.subscriptionID;
            const orderId = data.orderID;
            console.log(userEmail)

            setSubscriptionId(data.subscriptionID);

            // Confirm subscription approval with backend
            const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/backend/subscription/approve`, {
                subscriptionId,
                profileData,
                orderId,
                plan,
                userEmail,

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

export default Subscription;