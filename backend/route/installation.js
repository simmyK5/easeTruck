const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const paypal = require('@paypal/checkout-server-sdk');
const Installation = require('../model/installation');
const User = require('../model/user');
const crypto = require('crypto');

const router = express();
const PORT = process.env.PORT || 5000;
router.use(cors());
router.use(bodyParser.json());



router.post('/payment/notify', async (req, res) => {
  console.log("Received IPN notification from PayFast:", req.body);

  const {
    payment_status,
    custom_str1, // should be the installation ID
  } = req.body;

  if (payment_status !== 'COMPLETE') {
    return res.status(400).json({ error: 'Payment not completed' });
  }

  try {
    // Update the installation's outstandingInstallation flag to false
    const updatedInstallation = await Installation.findOneAndUpdate(
      { _id: custom_str1 },
      { $set: { outstandingInstallation: false } },
      { new: true } // returns the updated document
    );

    if (!updatedInstallation) {
      return res.status(404).json({ error: 'Installation not found' });
    }

    res.json({ message: 'Installation updated successfully', installation: updatedInstallation });
  } catch (err) {
    console.error('Error processing IPN:', err);
    return res.status(500).json({ error: 'Server error while processing IPN' });
  }
});


// PayFast return URL (after successful payment)
router.get('/success', (req, res) => {

  // You can access query parameters from PayFast here
  const paymentData = req.query;
  console.log("Payment data received: ", paymentData);

  // Redirect user to a success page or render the success page
  
  res.redirect('http://localhost:3000/profile');
});

// PayFast cancel URL (when the user cancels payment)
router.get('/cancel', (req, res) => {
  console.log("Payment cancelled, returning user to cancel page");

  // You can access query parameters from PayFast here
  const paymentData = req.query;
  console.log("Payment data received: ", paymentData);

  // Redirect user to a cancel page or render the cancel page
  res.redirect('http://localhost:3000/');  // You can customize this to redirect to a frontend route or render HTML
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

// get installtions by vehicle owner


router.get("/outstandingInstallations/:email", async (req, res) => {
  console.log("kujola mina",req.params.email)

  try {
    const installations = await Installation.find({ email: req.params.email, outstandingInstallation: true });

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

router.put("/techInstallation/:id", async (req, res) => {
  console.log('Request Body:', req.body);
  

  try {
    const { status } = req.body; // Only extract `status` from the request
    console.log('YINI MANJE', status);
    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }

    const updatedItem = await Installation.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    res.json(updatedItem);
  } catch (error) {
    console.error("Update error:", error);
    res.status(400).send(error);
  }
});


module.exports = router;

