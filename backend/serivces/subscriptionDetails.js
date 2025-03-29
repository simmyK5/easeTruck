const cron = require('node-cron');
const axios = require('axios');
const Subscription = require('../model/subscription');
const User = require('../model/user');

const subscriptionDetails = () => {
  // Schedule cron job to run daily at midnight
 
  cron.schedule('0 1 * * *', async () => { // Runs daily at midnight
  //cron.schedule('*/1 * * * *', async () => {
    console.log("Running subscription sync and payment job...");

    // Fetch active and expired subscriptions only
    const subscriptions = await Subscription.find({ status: { $in: ['ACTIVE', 'EXPIRED'] } });

    for (const sub of subscriptions) {
      try {
        // Step 1: Obtain PayPal Access Token
        const getAccessToken = async () => {
          const response = await axios.post(
            'https://api.sandbox.paypal.com/v1/oauth2/token',
            null,
            {
              params: { grant_type: 'client_credentials' },
              headers: {
                Authorization: `Basic ${Buffer.from(
                  `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
                ).toString('base64')}`,
                'Content-Type': 'application/x-www-form-urlencoded',
              },
            }
          );
          return response.data.access_token;
        };

        const accessToken = await getAccessToken();

        // Step 2: Get subscription details from PayPal
        const response = await axios.get(
          `https://api.sandbox.paypal.com/v1/billing/subscriptions/${sub.subscriptionId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        console.log("mele sidube",response.data)

        const paypalStatus = response.data.status;

        // Step 3: Handle expired subscriptions
        if (paypalStatus === 'EXPIRED') {
          console.log(`Subscription ${sub.subscriptionId} is expired.`);

          // Fetch billing token directly from PayPal
          try {
            const billingTokenResponse = await axios.get(
              `https://api.sandbox.paypal.com/v1/billing/billing-agreements/${sub.subscriptionId}`,
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
              }
            );
            console.log("lets see",billingTokenResponse.data)
            const billingToken = billingTokenResponse.data.token;

            // Step 4: Make payment using billing token
            if (billingToken) {
              const paymentResponse = await axios.post(
                'https://api.sandbox.paypal.com/v1/billing/subscriptions',
                {
                  plan_id: sub.planId,
                  payment_source: {
                    token: {
                      id: billingToken,
                      type: 'BILLING_AGREEMENT',
                    },
                  },
                },
                {
                  headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                  },
                }
              );

              // Update subscription with new ID and status
              const newSubscriptionId = paymentResponse.data.id;
              sub.subscriptionId = newSubscriptionId;
              sub.status = 'ACTIVE';
              sub.updatedAt = new Date();
              await sub.save();

              console.log(`Renewed subscription for user ${sub.user}`);
            } else {
              console.warn(`No billing token found for subscription ${sub.subscriptionId}.`);
            }
          } catch (billingTokenError) {
            console.error(
              `Failed to fetch billing token for subscription ${sub.subscriptionId}:`, billingTokenError.message
            );
          }
        }
      } catch (error) {
        console.error(`Error syncing subscription ${sub.subscriptionId}:`, error.response?.data || error.message);
      }
    }
  });

  console.log("Subscription sync and payment job initialized.");
};

module.exports = subscriptionDetails;
