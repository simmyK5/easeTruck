// models/emailTrail.js

const mongoose = require('mongoose');

const emailTrailSchema = new mongoose.Schema({
    //user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // New field
    to: String,
    from: String,
    subject: String,
    message: String,
    timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("EmailTrail", emailTrailSchema)