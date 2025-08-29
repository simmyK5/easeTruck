const mongoose = require('mongoose');

const claimVoucherSchema = new mongoose.Schema({
  resellerName: String,
  resellerSurname: String,
  resellerEmail: String,
  clientName: String,
  clientSurname: String,
  clientEmail: String,
  isConfirmed: { type: Boolean, default: false },
  isPaid: { type: Boolean, default: false },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  proccssedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notificationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Notification' },
  voucherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Voucher' },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ClaimVoucher', claimVoucherSchema);
