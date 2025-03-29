const mongoose = require('mongoose');

const voucherSchema = new mongoose.Schema({
  code: String,
  value: Number,
  expiryDate: Date,
  isRedeemed: { type: Boolean, default: false },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  vehicleOwnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notificationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Notification' },
  voucherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Voucher' },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Voucher', voucherSchema);
