const mongoose = require('mongoose');

const adminAiSchema = new mongoose.Schema({
    timestamp: { type: Date, default: Date.now },
    sessionId: String,
    customerName: String,
    customerSurname: String,
    reason: String,
    customerNo: String,
    callSummary: [],
    recordUrl: String,
    isClosed: { type: Boolean, default: false },
    isMoved: { type: Boolean, default: false },
    consultant: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    exportedBy: String,
    exportedWhen:Date

});


module.exports = mongoose.model('AdminAi', adminAiSchema);
