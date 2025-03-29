const express = require('express');
const cors = require('cors');
const bcrypt = require("bcryptjs")
const router = express();
const bodyParser = require('body-parser');
router.use(cors());
router.use(bodyParser.json());
const EmailTrail = require('../model/emailTrail');
const User = require('../model/user');

// POST /backend/email/trail
router.post('/trail', async (req, res) => {
    try {
        const { to, from, subject, message } = req.body;
        const emailTrail = new EmailTrail({ to, from, subject, message });
        await emailTrail.save();
        res.status(201).send(emailTrail);
      } catch (error) {
        res.status(500).send({ error: 'Failed to log email trail' });
      }
    /*console.log("do we get here")
    console.log(req.body)
    try {
        const { userId, emailData } = req.body;

        // Find the user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Create a new email trail document
        const newEmailTrail = new EmailTrail({
            user: user._id, // Link to the user
            emailData
        });

        // Save the email trail to the database
        const savedEmailTrail = await newEmailTrail.save();

        // Add the email trail reference to the user
        user.emailTrails.push(savedEmailTrail._id);
        await user.save();

        res.status(201).json({ message: 'Email trail saved successfully' });
    } catch (error) {
        console.error('Error saving email trail:', error);
        res.status(500).json({ message: 'Internal server error' });
    }*/
});

module.exports = router;
