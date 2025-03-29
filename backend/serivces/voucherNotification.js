const User = require('../model/user');
const { schedule } = require('node-cron');
const Notification = require('../model/notification');

const { DateTime } = require('luxon');
const voucher = require('../model/voucher');

const VoucherNotification = () => {
    // Run every day at 3 AM
    schedule('0 5 * * *', async () => {
    //schedule('* * * * *', async () => {
        try {
            const now = DateTime.utc().startOf('day');
            const tenDaysFromNow = now.plus({ days: 10 }).startOf('day');

            console.log(`Scheduled task ran at ${now.toISO()}`);
            console.log(`Looking for vouchers expiring between ${now.toISO()} and ${tenDaysFromNow.toISO()}`);

            // Fetch users and populate their vouchers
            const users = await User.find().populate('vouchers').exec();

            // Iterate over each user and filter for expiring vouchers
            for (const user of users) {
                console.log("Processing user:", user);

                // Filter the vouchers based on expiry date
                const expiringVouchers = user.vouchers.filter(voucher => {
                    console.log("Checking voucher:", voucher);

                    if (!voucher.expiryDate) {
                        console.log(`No expiry date for voucher ${voucher._id}`);
                        return false;
                    }

                    const jsDate = new Date(voucher.expiryDate);
                    console.log(`JS Date object for voucher ${voucher._id}: ${jsDate.toString()}`);

                    voucherExpiryDate = DateTime.fromJSDate(jsDate, { zone: 'utc' }).startOf('day');

                    // Log the alternative parsing attempt
                    console.log(`Alternative parsing of voucher ${voucher._id} expiry date using JS Date: ${voucherExpiryDate.toISO()}`);

                    /*// Log the raw expiry date string
                    console.log(`Raw expiry date for voucher ${voucher._id}: ${voucher.expiryDate}`);

                    // Attempt to parse expiryDate in ISO format
                    let voucherExpiryDate = DateTime.fromISO(voucher.expiryDate);

                    // Log the initial parsing attempt
                    console.log(`Initial parsing of voucher ${voucher._id} expiry date: ${voucherExpiryDate.toISO()}`);
                    console.log(`Alternative parsing of voucher ${voucher._id} expiry date using JS Date: ${voucherExpiryDate.toISO()}`);*/


                    // If the date is still invalid, log it and skip the voucher
                    if (!voucherExpiryDate.isValid) {
                        console.log(`Invalid expiry date for voucher ${voucher._id} after alternative parsing: ${voucher.expiryDate}`);
                        return false;
                    }

                    // Filter vouchers based on expiration date
                    console.log("cjeck different dates")
                    console.log(tenDaysFromNow)
                    console.log(voucherExpiryDate)
                    if (voucherExpiryDate <= tenDaysFromNow) {
                        console.log("ziyakhala")
                    }

                    if (voucherExpiryDate >= now) {
                        console.log("yebobo")
                    }

                    return voucherExpiryDate <= tenDaysFromNow && voucherExpiryDate >= now;
                });

                console.log("I'm hustling");
                console.log(expiringVouchers);

                // Ensure that empty arrays are excluded
                if (expiringVouchers.length > 0) {
                    console.log(expiringVouchers);

                    const message = `You have ${expiringVouchers.length} voucher(s) expiring soon!`;

                    // Create a notification for the user
                    const notification = new Notification({
                        driverId: user._id,
                        message,
                        timestamp: DateTime.now().toISO(),
                        read: false,
                        vouchers: expiringVouchers.map(voucher => voucher._id) // Store voucher IDs
                    });

                    // Save the notification to the database
                    await notification.save();

                    // Optionally, you can also update the user's notification field, if applicable
                    user.notification.push(notification._id);
                    await user.save();

                    console.log(`Notification created for user ${user._id}`);
                }
            }
        } catch (error) {
            console.error('Error creating voucher notifications:', error);
        }
    });
};

module.exports = VoucherNotification;
