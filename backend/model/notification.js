const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    vehicleOwnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    task: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }] ,
    vouchers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Voucher' }],
    Title: String,
    message: String,
    read: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Notification', notificationSchema); 