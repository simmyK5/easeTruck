const Voucher = require('../model/voucher');
//const paypal = require('paypal-rest-sdk');
const paypal = require('@paypal/checkout-server-sdk');
const User = require('../model/user');
const express = require('express');
const cors = require('cors');
const bcrypt = require("bcryptjs")
const router = express();
const bodyParser = require('body-parser');
const { contentSecurityPolicy } = require('helmet');
router.use(cors());
router.use(bodyParser.json());
const axios = require('axios');
const braintree = require('braintree');
const qs = require('qs');

//exports.generateVoucher = async (req, res) => {
router.post("/generateVoucher", async (req, res) => {
  try {
    const vouchers = await Voucher.find({ driver: req.params.driverId });
    res.json(vouchers);
  } catch (err) {
    res.status(500).send(err);
  }
});

const gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,  // Or braintree.Environment.Production for live transactions
  merchantId: process.env.BRAINTREE_MERCHANT_ID,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY,
});

router.get('/client-token', async (req, res) => {
  try {
      gateway.clientToken.generate({}, (err, response) => {
          if (err) {
              console.error('Error generating client token:', err);
              return res.status(500).json({ success: false, error: 'Error generating client token.' });
          }
          res.json({ clientToken: response.clientToken });
      });
  } catch (error) {
      console.error('Unexpected error:', error.message);
      res.status(500).json({ success: false, error: 'Unexpected error occurred.' });
  }
});

// Route to redeem voucher and process payment
router.post('/redeem-voucher', async (req, res) => {
  const { voucherCode, paymentMethodNonce, amount } = req.body;

  try {
    // Step 1: Validate voucher (you already have this part)
    const voucher = await Voucher.findOne({ code: voucherCode, isRedeemed: false });
    if (!voucher) {
      return res.status(400).json({ success: false, error: 'Invalid or already redeemed voucher.' });
    }
    console.log("do we get here",paymentMethodNonce)

    // Step 2: Process the transaction
    const result = await gateway.transaction.sale({
      amount: amount.toString(),
      paymentMethodNonce: paymentMethodNonce,
      options: {
        submitForSettlement: true,
      },
    });
    console.log("see reulst",result)

    if (result.success) {
      // Mark the voucher as redeemed
      voucher.isRedeemed = true;
      await voucher.save();

      res.json({ success: true, transaction: result.transaction });
    } else {
      res.status(400).json({ success: false, error: result.message });
    }
  } catch (error) {
    console.error("Error processing payment:", error);
    res.status(500).json({ success: false, error: 'Failed to process payment.' });
  }
});

router.get("/:userid", async (req, res) => {

  console.log("kwnzakalani",req.params)
  const currentVehicleOwner= req.params.userid

  try {
    const vouchers = await Voucher.find({  vehicleOwnerId: currentVehicleOwner});
    console.log("what happening")
    console.log(vouchers)
    res.json(vouchers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
})


/*
router.post('/redeem-voucher', async (req, res) => {
  const { voucherCode, recipientEmail } = req.body;
  console.log("menzi okuhle",voucherCode)
  console.log("ngiphe amadla",recipientEmail)

  try {
    // Step 1: Validate voucher
    const voucher = await Voucher.findOne({ code: voucherCode, isRedeemed: false });
    if (!voucher) {
      return res.status(400).json({ success: false, error: 'Invalid or already redeemed voucher.' });
    }

    // Step 2: Get PayPal Access Token
    const tokenResponse = await axios.post(
      'https://api-m.sandbox.paypal.com/v1/oauth2/token',
      'grant_type=client_credentials',
      {
        auth: {
          username: process.env.PAYPAL_CLIENT_ID,
          password: process.env.PAYPAL_CLIENT_SECRET,
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const accessToken = tokenResponse.data.access_token;

    // Step 3: Initiate Payout
    const payoutRequest = {
      sender_batch_header: {
        sender_batch_id: `batch-${Date.now()}`,
        email_subject: "You've received a payout!",
      },
      items: [
        {
          recipient_type: "EMAIL",
          amount: {
            value: voucher.value.toString(),
            currency: "USD",
          },
          receiver: recipientEmail, // User's PayPal email
          note: "Voucher Redemption Payout",
        },
      ],
    };

    const payoutResponse = await axios.post(
      'https://api-m.sandbox.paypal.com/v1/payments/payouts',
      payoutRequest,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Step 4: Mark the voucher as redeemed
    voucher.isRedeemed = true;
    await voucher.save();

    res.json({ success: true, payout: payoutResponse.data });
  } catch (error) {
    console.error("Error processing payout:", error.response?.data || error.message);
    res.status(500).json({ success: false, error: 'Failed to process payout.' });
  }
});
*/

module.exports = router;