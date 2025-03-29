require('dotenv').config();
const paypal = require('@paypal/checkout-server-sdk');
const express = require('express');
const router = express.Router();
const Subscription = require('../model/subscription');
const User = require('../model/user');
const Voucher = require('../model/voucher');
const PAYPAL_API = 'https://api-m.sandbox.paypal.com';
const axios = require('axios');
const mongoose = require('mongoose'); // Import mongoose


const environment = new paypal.core.SandboxEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET);
const client = new paypal.core.PayPalHttpClient(environment);


// Step 1: Create Product Function
const createProduct = async (accessToken, productData) => {
    try {
        const response = await axios.post(
            'https://api.sandbox.paypal.com/v1/catalogs/products',
            {
                name: productData.name,
                description: productData.description,
                type: 'SERVICE', // Adjust depending on your product
                category: 'SOFTWARE', // Adjust based on your product type
            },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error creating product', error);
        throw error;
    }
};



// Your existing route for creating the subscription
router.post('/create', async (req, res) => {
    try {
        const { plan, subscriber } = req.body;
        console.log("Subscriber info:", plan);
        console.log("Subscriber email:", subscriber.email_address);

        // Step 2: Obtain PayPal Access Token
        const getAccessToken = async () => {
            const response = await axios.post('https://api.sandbox.paypal.com/v1/oauth2/token', null, {
                params: { grant_type: 'client_credentials' },
                headers: {
                    Authorization: `Basic ${Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64')}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
            return response.data.access_token;
        };

        const accessToken = await getAccessToken();

        // Step 3: Create the Product
        const productData = {
            name: plan.title,  // Replace with actual product name
            description: plan.description, // Replace with actual product description
        };

        const createProduct = async (accessToken, productData) => {
            const response = await axios.post(
                'https://api.sandbox.paypal.com/v1/catalogs/products',
                productData,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            return response.data;
        };

        const product = await createProduct(accessToken, productData);
        console.log('Product created:', product);

        const productId = product.id;  // This is the product_id to use when creating a plan

        // Step 4: Create Subscription Plan
        const createSubscriptionPlan = async (accessToken, plan, productId) => {
            try {
                const requestBody = {
                    product_id: productId,  // Use productId directly as the correct argument
                    name: plan.title,
                    description: plan.description,
                    billing_cycles: [
                        {
                            sequence: 1,  // Define the sequence, e.g., first billing cycle
                            tenure_type: 'REGULAR',  // Valid values: REGULAR, TRIAL
                            frequency: {
                                interval_unit: 'DAY',  // Valid values: MONTH, DAY, YEAR, etc.
                                interval_count: 1,       // Number of months for the cycle
                            },
                            pricing_scheme: {
                                fixed_price: {
                                    value: plan.price.toString(),  // Price as a string
                                    currency_code: 'USD',  // Currency should be USD or other supported currencies
                                },
                            },
                            total_cycles: 0,  
                        },
                    ],
                    payment_preferences: {
                        auto_bill_outstanding: true,
                        payment_failure_threshold: 3,  // 🔥 Number of retry attempts before cancellation
                        setup_fee: {
                            value: plan.price.toString(),
                            currency_code: 'USD',
                        },
                    },
                };

                const response = await axios.post(
                    'https://api.sandbox.paypal.com/v1/billing/plans',
                    requestBody,
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );

                return response.data;

            } catch (error) {
                console.error("Error creating subscription plan:", error.response ? error.response.data : error.message);
                throw error;
            }
        };

        const subscriptionPlan = await createSubscriptionPlan(accessToken, plan, productId);
        console.log('Subscription plan created:', subscriptionPlan);

        // Step 5: Create Subscription for the User
        const createSubscription = async (accessToken, subscriptionPlan, subscriber) => {
            const requestBody = {
                plan_id: subscriptionPlan.id,
                subscriber: {
                    name: {
                        given_name: subscriber.name.given_name || null,  // Allow null if no value is provided
                        surname: subscriber.name.surname || null,
                    },
                    email_address: subscriber.email_address,
                },
                application_context: {
                    brand_name: 'Notion Innovation Solutions',
                    locale: 'en-US',
                    shipping_preference: 'NO_SHIPPING',
                    user_action: 'SUBSCRIBE_NOW',
                    payment_method: {
                        payer_selected: 'PAYPAL', // Allow PayPal and card payments
                        payee_preferred: 'IMMEDIATE_PAYMENT_REQUIRED',
                    },
                },
            };

            const response = await axios.post(
                'https://api.sandbox.paypal.com/v1/billing/subscriptions',
                requestBody,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            return response.data;
        };

        const subscriptionResponse = await createSubscription(accessToken, subscriptionPlan, subscriber);
        console.log('Subscription created:', subscriptionResponse);

        // Return the result to the client
        res.json({
            success: true,
            orderId: subscriptionResponse.id,
            product: product,
            plan: subscriptionPlan,
            subscription: subscriptionResponse,
        });
    } catch (error) {
        console.error('Error creating or subscribing user to plan:', error);
        res.status(500).json({ error: 'Failed to create or subscribe user to plan' });
    }
});


router.post('/approve', async (req, res) => {
    console.log("do we get here approve")
    try {
        const { subscriptionId, orderId ,plan,profileData,userEmail} = req.body;  // Obtain subscriptionId and orderId from the frontend
        console.log("Approving subscription", subscriptionId, "for order", orderId);
        console.log("user email shaking",userEmail)

        // Step 1: Obtain PayPal Access Token
        const getAccessToken = async () => {
            const response = await axios.post('https://api.sandbox.paypal.com/v1/oauth2/token', null, {
                params: { grant_type: 'client_credentials' },
                headers: {
                    Authorization: `Basic ${Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64')}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
            return response.data.access_token;
        };

        const accessToken = await getAccessToken();

        // Step 2: Fetch the order details using orderId to get payerId
        const getOrderDetails = async (orderId, accessToken) => {
            const response = await axios.get(
                `https://api.sandbox.paypal.com/v2/checkout/orders/${orderId}`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );
            return response.data;
        };

        const orderDetails = await getOrderDetails(orderId, accessToken);
        console.log("orderDetails in it", orderDetails.payer.payer_id);

        // Step 2: Get the subscription details
        const getSubscriptionDetails = async (subscriptionId, accessToken) => {
            const response = await axios.get(
                `https://api.sandbox.paypal.com/v1/billing/subscriptions/${subscriptionId}`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );
            return response.data;
        };

        const subscriptionDetails = await getSubscriptionDetails(subscriptionId, accessToken);
        console.log("Subscription Details:", subscriptionDetails);

        //const payerId = orderDetails.payer.payer_id;  // Extract payer_id from the order details
      
       // const email = orderDetails.payer.email_address;

        if (subscriptionDetails.status === 'ACTIVE') {
            const user = await User.findOne({ email:userEmail }); // Retrieve the user first
            console.log("user  shaking",user)

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            const subscription = new Subscription({
                planId: orderDetails.plan_id,
                planName: plan.title,
                price: plan.price,
                features: plan.features,
                user: user._id, // Now user._id is defined
                //user:meghjg,
                status: 'ACTIVE',
                subscriptionId: subscriptionId,
            });

            const savedSubscription = await subscription.save();
            console.log("loud speaker")
            console.log('what is up', profileData);
            const updatedUser = await User.findOneAndUpdate(
                { email:userEmail },  // Search by email
                {
                    firstName: profileData.firstName, // Update firstName
                    lastName: profileData.lastName,   // Update lastName
                    userRole: profileData.userRole,
                    termsAndConditions: profileData.termsAndConditions || false,
                    $addToSet: { subscription: savedSubscription._id } // Add subscription ID if it doesn't already exist
                },
                { new: true }  // Return the updated document
            );

            console.log('Updated User:', updatedUser);
            res.json(savedSubscription);
        } else {
            res.status(400).json({ error: 'Payment not completed' });
        }

       
    } catch (error) {
        console.error('Error confirming PayPal subscription:', error);
        res.status(500).json({ error: 'Failed to confirm PayPal subscription' });
    }
});


router.post('/driverApprove', async (req, res) => {
    try {
        const { subscriptionId, orderId, plan, profileData, userEmail } = req.body;  // Obtain subscriptionId, orderId, plan, profileData, and userEmail

        // Step 1: Obtain PayPal Access Token
        const getAccessToken = async () => {
            const response = await axios.post('https://api.sandbox.paypal.com/v1/oauth2/token', null, {
                params: { grant_type: 'client_credentials' },
                headers: {
                    Authorization: `Basic ${Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64')}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
            return response.data.access_token;
        };

        const accessToken = await getAccessToken();

        // Step 2: Fetch the order details using orderId to get payerId
        const getOrderDetails = async (orderId, accessToken) => {
            const response = await axios.get(
                `https://api.sandbox.paypal.com/v2/checkout/orders/${orderId}`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );
            return response.data;
        };

        const orderDetails = await getOrderDetails(orderId, accessToken);

        // Step 3: Get the subscription details
        const getSubscriptionDetails = async (subscriptionId, accessToken) => {
            const response = await axios.get(
                `https://api.sandbox.paypal.com/v1/billing/subscriptions/${subscriptionId}`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );
            return response.data;
        };

        const subscriptionDetails = await getSubscriptionDetails(subscriptionId, accessToken);

        if (subscriptionDetails.status === 'ACTIVE') {
            let user = await User.findOne({ email: userEmail }); // Retrieve the user first

            if (!user) {
                // If user doesn't exist, create a new user
                user = new User({
                    email: userEmail,
                    firstName: profileData.firstName,
                    lastName: profileData.lastName,
                    userRole: profileData.userRole,
                    isLive: profileData.isLive,
                    vehicleOwnerId: profileData.vehicleOwnerId,
                });

                user = await user.save();
            }

            const subscription = new Subscription({
                planId: orderDetails.plan_id,
                planName: plan.title,
                price: plan.price,
                features: plan.features,
                user: user._id,
                status: 'ACTIVE',
                subscriptionId: subscriptionId
            });

            const savedSubscription = await subscription.save();

            const updatedUser = await User.findOneAndUpdate(
                { email: userEmail },
                {
                    firstName: profileData.firstName,
                    lastName: profileData.lastName,
                    userRole: profileData.userRole,
                    termsAndConditions: profileData.termsAndConditions || false,
                    $addToSet: { subscription: savedSubscription._id } // Add subscription ID if it doesn't already exist
                },
                { new: true }
            );

            console.log('Updated User:', updatedUser);
            res.json(savedSubscription);
        } else {
            res.status(400).json({ error: 'Payment not completed' });
        }
    } catch (error) {
        console.error('Error approving subscription:', error);
        res.status(500).json({ error: 'Server error' });
    }
});


router.post('/cancel', async (req, res) => {
    try {
        const { subscriptionId } = req.body; // Obtain the subscription ID from the frontend
        console.log("Cancelling subscription:", subscriptionId);

        // Step 1: Obtain PayPal Access Token
        const getAccessToken = async () => {
            const response = await axios.post('https://api.sandbox.paypal.com/v1/oauth2/token', null, {
                params: { grant_type: 'client_credentials' },
                headers: {
                    Authorization: `Basic ${Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64')}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
            return response.data.access_token;
        };

        const accessToken = await getAccessToken();

        // Step 2: Get the subscription details
        const getSubscriptionDetails = async (subscriptionId, accessToken) => {
            const response = await axios.get(
                `https://api.sandbox.paypal.com/v1/billing/subscriptions/${subscriptionId}`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );
            return response.data;
        };

        const subscriptionDetails = await getSubscriptionDetails(subscriptionId, accessToken);
        console.log("Subscription Details:", subscriptionDetails);

        // Step 3: Check subscription status
        if (!['ACTIVE', 'SUSPENDED'].includes(subscriptionDetails.status)) {
            return res.status(400).json({
                error: `Cannot cancel subscription. Current status: ${subscriptionDetails.status}`,
            });
        }

        // Step 4: Cancel the subscription
        const cancelSubscription = async (subscriptionId, accessToken) => {
            const response = await axios.post(
                `https://api.sandbox.paypal.com/v1/billing/subscriptions/${subscriptionId}/cancel`,
                { reason: 'Customer requested cancellation' },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            return response.data;
        };

        const cancellationResponse = await cancelSubscription(subscriptionId, accessToken);
        console.log('Subscription canceled successfully:', cancellationResponse);

        //step 5
        const updatedSubscription = await Subscription.findOneAndUpdate(
            { subscriptionId },
            { status: 'CANCELLED' },
            { new: true }
        );

        if (!updatedSubscription) {
            return res.status(404).json({ error: 'Subscription not found in database' });
        }


        res.json({
            success: true,
            message: 'Subscription cancelled successfully',
        });
    } catch (error) {
        console.error('Error cancelling PayPal subscription:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to cancel PayPal subscription' });
    }
});





module.exports = router