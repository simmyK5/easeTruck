const mongoose = require('mongoose');

const accelerationSchema = new mongoose.Schema({
    timestamp: { type: Date, default: Date.now },
    latitude: Number,
    longitude: Number,
    acceleration: Number,
    speed: Number,
    speedLimit: Number,
    deviceSerialNumber: String ,
    voucherProcessed: { type: Boolean, default: false }, 
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    
});

module.exports = mongoose.model('Acceleration', accelerationSchema);
