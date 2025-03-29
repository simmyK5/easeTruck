const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const paypal = require('@paypal/checkout-server-sdk');
const Installation = require('../model/installation');
const User = require('../model/user');

const router = express();
const PORT = process.env.PORT || 5000;
router.use(cors());
router.use(bodyParser.json());

let environment = new paypal.core.SandboxEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET);
let client = new paypal.core.PayPalHttpClient(environment);

// Generate Client Token
router.get('/get-client-token', async (req, res) => {
  try {
    let request = new paypal.orders.OrdersCreateRequest();
    request.requestBody({});

    const response = await client.execute(request);
    res.json({ client_token: response.result.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create PayPal Order
router.post('/create-order', async (req, res) => {
  try {
    const request = new paypal.orders.OrdersCreateRequest();
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'USD',
          value: req.body.totalAmount,  // Use the calculated total amount
        },
      }],
    });

    const response = await client.execute(request);
    res.json(response.result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Capture Payment
router.post('/capture-order', async (req, res) => {
  const { orderID, userEmail } = req.body;  // Make sure this is passed from the frontend after user approves payment
  console.log("the request body", req.body)

  try {
    console.log(orderID)
    const request = new paypal.orders.OrdersCaptureRequest(orderID);
    request.requestBody({});

    const response = await client.execute(request);

    // Here you can save the payment details to your database
    const user = await User.findOne({ email: userEmail });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const newOrder = new Installation({
      user: user._id, // Replace with actual user ID
      totalAmount: req.body.totalAmount, // Pass totalAmount from frontend
      paymentId: response.result.id,
      paymentStatus: response.result.status,
      email: req.body.userEmail,
      items: req.body.items,
      status: 'Not Started',
      technician: null,
      address: response.result.purchase_units[0]?.shipping?.address || null,


    });
console.log(newOrder)
    const savedOrder = await newOrder.save();
    user.installation.push(savedOrder._id);
    await user.save();
    res.json(savedOrder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// get all installations
router.get("/installations", async (req, res) => {

  try {
    const installations = await Installation.find();
    console.log(installations)
    if (installations.length === 0) {
      return res.status(404).json({ message: "No installations found" });
    }
    res.json(installations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
})




//Update installation
router.put("/:id", async (req, res) => {
  console.log('Request Body:', req.body);

  try {
    const updatedItem = await Installation.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedItem);
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;

