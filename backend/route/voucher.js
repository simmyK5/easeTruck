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
/*router.post('/redeem-voucher', async (req, res) => {
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
});*/

router.get('/:code', async (req, res) => {
  try {
    const code = req.params.code;
    if (!code) {
      return res.status(400).json({ error: 'Missing code query parameter' });
    }

    console.log("yini bo", code)
    // Find vouchers whose code contains the search term (case‑insensitive)
    const vouchers = await Voucher.find({
      code: { $regex: code, $options: 'i' }
    });
    res.json(vouchers);
  } catch (err) {
    console.error('Voucher lookup error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put("/payouts", async (req, res) => {
  const {
    voucherId,
    fullName,
    bankName,
    accountNumber,
    accountType,
    branchCode
  } = req.body;

  try {
    console.log("see body", req.body);

    // Find the voucher by ID
    const voucher = await Voucher.findById(voucherId).populate('claimVoucher');

    if (!voucher) {
      return res.status(400).json({ error: 'Voucher not found' });
    }

    // Update voucher fields
    voucher.isRedeemed = true;

    // Ensure claimVoucher is populated and exists
    if (voucher.claimVoucher) {
      voucher.claimVoucher.fullName = fullName;
      voucher.claimVoucher.bankName = bankName;
      voucher.claimVoucher.accountNumber = accountNumber;
      voucher.claimVoucher.accountType = accountType;
      voucher.claimVoucher.branchCode = branchCode;

      await voucher.claimVoucher.save(); // Save claimVoucher changes
    }

    await voucher.save(); // Save voucher changes

    res.json({ success: true, voucherId });
  } catch (error) {
    console.error("Payout error:", error);
    res.status(500).send({ error: 'Internal Server Error' });
  }
});


module.exports = router;