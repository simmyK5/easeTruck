const Voucher = require('../model/voucher');
const User = require('../model/user');
const Acceleration = require('../model/acceleration');
const { schedule } = require('node-cron');
const Notification = require('../model/notification');

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
const sendSubscriptionReminder = async (user, voucherCode,voucherValue,expiryDate) => {
    console.log("User Data:", user);
    console.log("voucherCode:", voucherCode);
    console.log("voucherValue:", voucherValue);
    console.log("expiryDate:", expiryDate);
    

    const templatePath = path.join(__dirname, "voucherNotification.ejs");
    const template = fs.readFileSync(templatePath, "utf-8");
    const emailBody = ejs.render(template, {
        firstName: user.firstName,
        lastName: user.lastName,
        voucherCode:voucherCode,
        voucherValue:voucherValue,
        expiryDate:expiryDate,
        claimdUrl:"http://localhost:3000/voucher",
        supportEmail:"easetruck@info.co.za"
    });

    try {
        await sendVoucherEmail(user.email, "You’ve Earned a Driving Voucher! Here’s How to Redeem ", emailBody);
        console.log(`Price Increase Email Sent to ${user.email}`);
    } catch (error) {
        console.error(`Failed to send email to ${user.email}:`, error.message);
    }
};

const scheduleVoucherGeneration = () => {

    schedule('0 3 * * *', async () => {
    //schedule('*/1 * * * *', async () => {
        console.log('Starting voucher generation process...');

        try {
            // Step 1: Aggregate unprocessed acceleration data by userId
            const results = await Acceleration.aggregate([
                {
                    $match: { voucherProcessed: false }, // Only unprocessed records
                },
                {
                    $group: {
                        _id: '$user', // Group by userId
                        count: { $sum: 1 }, // Count the number of records
                        accelerationIds: { $push: '$_id' }, // Collect record IDs
                    },
                },
                {
                    $match: { count: { $lt: 10 } }, // Filter users with fewer than 10 records
                },
            ]);

            console.log("Results:", results);

            for (const result of results) {
                const driverId = result._id;
                const vehicleOwnerId = result._id;
                const recordCount = result.count;
                const accelerationIds = result.accelerationIds;
                

                console.log(`User ${driverId} has ${recordCount} unprocessed acceleration records.`);

                // Check user and active subscription
                const user = await User.findById(vehicleOwnerId).populate('subscription');
                console.log(user)
                if (!user) {
                    console.warn(`User with ID ${vehicleOwnerId} not found. Skipping.`);
                    continue;
                }

                const activeSubscriptions = user.subscription.filter(subscription => {
                    return subscription.expirationDate && new Date(subscription.expirationDate) > new Date();
                });
                
                console.log("haybo subscriptions", activeSubscriptions);
                
                if (activeSubscriptions.length === 0) {
                    console.log(`User ${vehicleOwnerId} does not have an active subscription. Skipping.`);
                    continue;
                }
                
                // Use the first subscription
                const activeSubscription = activeSubscriptions[0];
                const subscriptionEnd = new Date(activeSubscription.expirationDate);
                console.log("iyaqala", subscriptionEnd);
                const now = new Date();
                const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
               /* if (
                    subscriptionEnd.getFullYear() !== nextMonth.getFullYear() ||
                    subscriptionEnd.getMonth() !== nextMonth.getMonth()
                ) {
                    console.log(`User ${userId}'s subscription does not expire next month. Skipping.`);
                    continue;
                }*/
                console.log("haybo driver", userId);
                console.log("haybo accelerationIds", accelerationIds);


                // Step 2: Create and save the voucher
                const newVoucher = new Voucher({
                    code: `VOUCHER-${Date.now()}`,
                    value: activeSubscription.price * 0.10, // Example voucher value
                    expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
                    driver: driverId,
                    vehicleOwnerId: user.vehicleOwnerId,
                });

                await newVoucher.save();
                console.log('Voucher created:', newVoucher);
                console.log("see me now",accelerationIds)

                // Step 3: Mark acceleration records as processed
                await Acceleration.updateMany(
                    { _id: { $in: accelerationIds } },
                    { $set: { voucherProcessed: true } }
                );
                console.log(`Marked ${accelerationIds.length} acceleration records as processed.`);

                // Add voucher to the user's account
                user.vouchers.push(newVoucher._id);
                await user.save();
                console.log('User updated with new voucher:', user);

                // Send notification
                const vehicleOwner = await User.findById(user.vehicleOwnerId);
                await sendSubscriptionReminder(vehicleOwner, newVoucher.code,newVoucher.value,newVoucher.expiryDate);
                console.log('Email sent:');
                
                const title = `New voucher created`;
                const message = `A new voucher has been assigned to you by ${vehicleOwner.firstName} ${vehicleOwner.lastName} regarding ${user.firstName}'s driving performance.`;

                const notification = new Notification({
                    driverId: driverId,
                    title,
                    message,
                    vehicleOwnerId: vehicleOwner._id,
                    vouchers: newVoucher._id,
                });

                const savedNotification = await notification.save();
                console.log('Notification created:', savedNotification);

                vehicleOwner.notification.push(savedNotification._id);
                await vehicleOwner.save();
            }

            console.log('Voucher generation process completed.');
        } catch (error) {
            console.error('Error during voucher generation:', error);
        }
    });
};

module.exports = scheduleVoucherGeneration;
