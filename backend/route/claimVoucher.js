const Voucher = require('../model/voucher');
const User = require('../model/user');
const express = require('express');
const cors = require('cors');
const bcrypt = require("bcryptjs")
const router = express();
const bodyParser = require('body-parser');
const ClaimVoucher = require('../model/claimVoucher');
router.use(cors());
router.use(bodyParser.json());
const fs = require("fs");
const path = require("path");
const ejs = require("ejs");
require("dotenv").config();
const mailjet = require('node-mailjet')
const client = mailjet.apiConnect(process.env.MAILJET_API_KEY, process.env.MAILJET_API_SECRET);

const MILEAGE_THRESHOLDS = [25000, 30000, 35000]; // Add more if needed


const sendVoucherEmail = async (to, subject, body) => {
    const request = client.post('send', { 'version': 'v3.1' }).request({
        Messages: [
            {
                From: {
                    Email: process.env.MAILJET_FROM_EMAIL, // Your email from Mailjet account
                },
                To: [
                    {
                        Email: to,
                    },
                ],
                Subject: subject,
                HTMLPart: body, // HTML content of the email
            },
        ],
    });

    try {
        const response = await request;
        // console.log("Email sent:", response.body);
        console.log("Email sent:", JSON.stringify(response.body, null, 2));

    } catch (error) {
        console.error("Error sending email:", error);
    }
};

// Function to load the email template & send reminder
const sendVoucherReminder = async (firstName, lastName, email, voucherCode, voucherValue, expiryDate) => {
    console.log("firstName Data:", firstName);
    console.log("lastName Data:", lastName);
    console.log("email Data:", email);
    console.log("voucherCode:", voucherCode);
    console.log("voucherValue:", voucherValue);
    console.log("expiryDate:", expiryDate);

    console.log("__dirname is:", __dirname);

    const templatePath = path.join(__dirname, "..", "services", "voucherNotification.ejs");
    console.log("templatePath is:", templatePath);
    

    const template = fs.readFileSync(templatePath, "utf-8");
    const emailBody = ejs.render(template, {
        firstName: firstName,
        lastName: lastName,
        voucherCode: voucherCode,
        voucherValue: voucherValue,
        expiryDate: expiryDate,
        claimdUrl: "http://localhost:3000/voucher",
        supportEmail: "easetruck@info.co.za"
    });

    try {
        await sendVoucherEmail(email, "You’ve Earned a Driving Voucher! Here’s How to Redeem ", emailBody);
        console.log(`Price Increase Email Sent to ${email}`);
    } catch (error) {
        console.error(`Failed to send email to ${email}:`, error.message);
    }
};

router.post('/claim', async (req, res) => {
    const {
        resellerName,
        resellerSurname,
        resellerEmail,
        clientName,
        clientSurname,
        clientEmail
    } = req.body;

    try {
        // 1️⃣ Validate that the client exists (by email OR name)
        const user = await User.findOne({
            $or: [
                { email: clientEmail, userRole: 'vehicleOwner' },
                { firstName: clientName, lastName: clientSurname }
            ]
        });
        console.log("cap it",user)
        if (!user) {
            return res.status(400).json({
                success: false,
                error: 'No matching client found'
            });
        }

        // 2️⃣ Create the claim record
        const claim = new ClaimVoucher({
            resellerName,
            resellerSurname,
            resellerEmail,
            clientName,
            clientSurname,
            clientEmail,
            clientId: user._id,        // link to the User
            claimedAt: new Date()
        });

        const savedClaim = await claim.save();
        console.log('Claim saved:', savedClaim);

        // 3️⃣ Return success
        res.status(200).json({
            success: true,
            claim: savedClaim
        });

    } catch (error) {
        console.error('Error processing claim:', error);
        res.status(500).json({
            success: false,
            error: 'Server error while processing claim.'
        });
    }
});

router.put('/confirm/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const {
        resellerName,
        resellerSurname,
        resellerEmail,
        clientEmail
      } = req.body;
  
      console.log("Confirming claim ID:", id);
      console.log("Confirming req.body:", req.body);
  
     
      const updatedClaim = await ClaimVoucher.findByIdAndUpdate(
        id,
        { $set: req.body },
        { new: true }
      );
      if (!updatedClaim) {
        return res.status(404).json({ success: false, error: 'Claim not found' });
      }
  
      
      const user = await User.findOneAndUpdate(
        { email: clientEmail },
        { $set: { isClaimed: true } },
        { new: true }
      );
      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }
  
     
      const newVoucher = await Voucher.create({
        code:        `VOUCHER-${Date.now()}`,
        value:       300,  // example fixed value, adjust as needed
        expiryDate:  new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        vehicleOwnerId: user._id
      });
      console.log('Voucher created:', newVoucher);
  
    
      user.vouchers = user.vouchers || [];
      user.vouchers.push(newVoucher._id);
      await user.save();
  
      
      await sendVoucherReminder(
        resellerName,
        resellerSurname,
        resellerEmail,
        newVoucher.code,
        newVoucher.value,
        newVoucher.expiryDate
      );
  
      // 6️⃣ Respond with the updated claim and the new voucher
      res.json({
        success: true,
        claim:   updatedClaim,
        voucher: newVoucher
      });
    } catch (error) {
      console.error('Error confirming claim:', error);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });

router.get('/:id', async (req, res) => {
    console.log("study")
    try {
        
        const { id } = req.params;
        
        if (!id) {
            return res.status(400).json({ error: 'Missing code query parameter' });
        }
        // Find vouchers whose code contains the search term (case‑insensitive)
        const claimmVouchers = await ClaimVoucher.find({
            clientId: id,
            isConfirmed:false
        });
        console.log("hundred",claimmVouchers)
        res.json(claimmVouchers);
    } catch (err) {
        console.error('Voucher lookup error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});


router.get("/payouts", async (req, res) => {

  try {
    const claimVoucher = await ClaimVoucher.find({ isPaid:false });

    if (claimVoucher.length === 0) {
      return res.status(404).json({ message: "No Claim Voucher found" });
    }
    res.json(claimVoucher);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
})

//Update truck
router.put("/payouts/:id", async (req, res) => {
  try {
    console.log("see id", req.params.id)
    console.log("see body", req.body)
    const updatedItem = await ClaimVoucher.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedItem);
  } catch (error) {
    res.status(400).send(error);
  }
});



module.exports = router;