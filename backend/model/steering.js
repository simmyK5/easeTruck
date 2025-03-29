const mongoose = require('mongoose');
const SteeringSchema = new mongoose.Schema({
    latitude: Number,
    longitude: Number,
    steeringAngle: Number,
    speed: Number,
    timestamp: Date,
    voucherProcessed: { type: Boolean, default: false },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

module.exports = mongoose.model('Steering', SteeringSchema);