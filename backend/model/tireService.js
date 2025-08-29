const mongoose = require('mongoose');

const tireServiceSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },

  tireMileage: Number,
  lastTireServiceDate: Date,
  nextTireServiceDate: Date,
  deviceSerialNumber: String,

  truck: { type: mongoose.Schema.Types.ObjectId, ref: 'Truck' },
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  vehicleOwnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});
tireServiceSchema.pre('save', async function (next) {
  if (!this.driverId && this.serialNumber) {
    try {
      const Truck = mongoose.model('Truck');
      const truckInfo = await Truck.findOne({ serialNumber: this.serialNumber });

      if (truckInfo) {
        this.userId = truckInfo.driverId;
        this.vehicleOwnerId = truckInfo.vehicleOwner;
      }
    } catch (error) {
      return next(error); // Pass error to save handler
    }
  }

  next();
});

module.exports = mongoose.model('tireService', tireServiceSchema); 