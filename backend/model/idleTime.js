const mongoose = require('mongoose');

const idleTimeSchema = new mongoose.Schema({
    timestamp: { type: Date, default: Date.now },
    latitude: Number,
    longitude: Number,
    idleTime: Number,
    speed: Number,
    deviceSerialNumber: String ,
    voucherProcessed: { type: Boolean, default: false },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

module.exports = mongoose.model('Idletimes', idleTimeSchema);