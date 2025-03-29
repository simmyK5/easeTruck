const Voucher = require('../model/voucher');
const User = require('../model/user');
const Acceleration = require('../model/acceleration');
const { schedule } = require('node-cron');
const Notification = require('../model/notification');

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
                const userId = result._id;
                const recordCount = result.count;
                const accelerationIds = result.accelerationIds;
                

                console.log(`User ${userId} has ${recordCount} unprocessed acceleration records.`);

                // Check user and active subscription
                const user = await User.findById(userId).populate('subscription');
                console.log(user)
                if (!user) {
                    console.warn(`User with ID ${userId} not found. Skipping.`);
                    continue;
                }

                const activeSubscriptions = user.subscription.filter(subscription => {
                    return subscription.expirationDate && new Date(subscription.expirationDate) > new Date();
                });
                
                console.log("haybo subscriptions", activeSubscriptions);
                
                if (activeSubscriptions.length === 0) {
                    console.log(`User ${userId} does not have an active subscription. Skipping.`);
                    continue;
                }
                
                // Use the first subscription
                const activeSubscription = activeSubscriptions[0];
                const subscriptionEnd = new Date(activeSubscription.expirationDate);
                console.log("iyaqala", subscriptionEnd);
                const now = new Date();
                const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
                if (
                    subscriptionEnd.getFullYear() !== nextMonth.getFullYear() ||
                    subscriptionEnd.getMonth() !== nextMonth.getMonth()
                ) {
                    console.log(`User ${userId}'s subscription does not expire next month. Skipping.`);
                    continue;
                }

                // Step 2: Create and save the voucher
                const newVoucher = new Voucher({
                    code: `VOUCHER-${Date.now()}`,
                    value: 100, // Example voucher value
                    expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
                    driver: userId,
                    vehicleOwnerId: user.vehicleOwnerId,
                });

                await newVoucher.save();
                console.log('Voucher created:', newVoucher);

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
                const title = `New voucher created`;
                const message = `A new voucher has been assigned to you by ${vehicleOwner.firstName} ${vehicleOwner.lastName} regarding ${user.firstName}'s driving performance.`;

                const notification = new Notification({
                    driverId: userId,
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
