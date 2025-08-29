const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const User = require('../model/user');
const Subscription = require('../model/subscription');
const Installation = require('../model/installation');

// Signature generation
const generateAPISignature = (data, passPhrase = null) => {
    // Arrange the array by key alphabetically for API calls
    let ordered_data = {};
    Object.keys(data).sort().forEach(key => {
        ordered_data[key] = data[key];
    });
    data = ordered_data;

    // Create the get string
    let getString = '';
    for (let key in data) {
        getString += key + '=' + encodeURIComponent(data[key]).replace(/%20/g, '+') + '&';
    }

    // Remove the last '&'
    getString = getString.substring(0, getString.length - 1);
    if (passPhrase !== null) { getString += `&passphrase=${encodeURIComponent(passPhrase.trim()).replace(/%20/g, "+")}`; }

    // Hash the data and create the signature
    return crypto.createHash("md5").update(getString).digest("hex");
}

router.post('/payment/notify', async (req, res) => {
    console.log("ware ", req.body);
    // Step 2: Continue only if payment status is COMPLETE and signature is valid
    const {
        payment_status,
        email_address,
        item_name,
        amount_gross,
        token,
        billing_date,
        name_last,
        name_first,
        custom_str1,
        custom_str2,
        custom_str3,
        custom_str5,
        custom_str4,
        item_description,
        custom_int1
    } = req.body;

    console.log("wehlukeile", custom_str4)

    if (payment_status !== 'COMPLETE') {
        return res.status(400).json({ error: 'Payment not completed' });
    }

    try {
        const user = await User.findOne({ email: email_address });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const subscription = new Subscription({
            planName: item_name,
            price: amount_gross,
            user: user._id,
            status: 'ACTIVE',
            subscriptionId: token,
            startDate: billing_date,
        });

        const savedSubscription = await subscription.save();

        console.log("full of nosne",savedSubscription)

        if (custom_str3!="{}") {
            console.log("full of bullshit")
            const newOrder = new Installation({
                user: user._id,
                totalAmount: custom_int1,
                paymentId: null,
                paymentStatus: payment_status,
                email: email_address,
                items: custom_str3,
                status: 'Not Started',
                technician: null,
                outstandingInstallation: custom_str5,
                address: custom_str4 || null,
    
    
            });
            const savedOrder = await newOrder.save();
            user.installation.push(savedOrder._id);
        }

        console.log("awuhlikile")
        const updatedUser = await User.findOneAndUpdate(
            { email: email_address },
            {
                firstName: name_first,
                lastName: name_last,
                userRole: custom_str1,
                termsAndConditions: true,
                $addToSet: { subscription: savedSubscription._id }
            },
            { new: true }
        );

        console.log('Updated User:', updatedUser);
        return res.status(200).json(savedSubscription);
    } catch (err) {
        console.error('Error processing IPN:', err);
        return res.status(500).json({ error: 'Server error while processing IPN' });
    }
});


router.post('/driverPayment/notify', async (req, res) => {
    console.log("ware ", req.body);
    // Step 2: Continue only if payment status is COMPLETE and signature is valid
    const {
        payment_status,
        email_address,
        item_name,
        amount_gross,
        token,
        billing_date,
        name_last,
        name_first,
        custom_str1,
        custom_str2,
    } = req.body;


    if (payment_status !== 'COMPLETE') {
        return res.status(400).json({ error: 'Payment not completed' });
    }

    try {
        let user = await User.findOne({ email: email_address });

        if (!user) {
            // If user doesn't exist, create a new user
            user = new User({
                email: email_address,
                firstName: name_first,
                lastName: name_last,
                userRole: custom_str1,
                isLive: false,
                vehicleOwnerId: custom_str2,
            });

            user = await user.save();
        }
        console.log("walk in my shoes", user)

        const subscription = new Subscription({
            planName: item_name,
            price: amount_gross,
            user: user._id,
            status: 'ACTIVE',
            subscriptionId: token,
            startDate: billing_date,
        });

        const savedSubscription = await subscription.save();

        const updatedUser = await User.findOneAndUpdate(
            { email: email_address },
            {
                firstName: name_first,
                lastName: name_last,
                userRole: custom_str1,
                termsAndConditions: true,
                $addToSet: { subscription: savedSubscription._id }
            },
            { new: true }
        );

        console.log('Updated User:', updatedUser);
        return res.status(200).json(savedSubscription);
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
    //res.redirect('http://localhost:3000/');
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


module.exports = router;
