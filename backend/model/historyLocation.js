const mongoose = require('mongoose');

const coordinateSchema = new mongoose.Schema({
  lat: Number,
  lng: Number,
  timestamp: { type: Date, default: Date.now },
});

const historyLocationSchema = new mongoose.Schema({
  serialNumber: { type: String, required: true, unique: true },
  coordinates: { type: [coordinateSchema], default: [] },
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  vehicleOwnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

historyLocationSchema.pre('save', async function (next) {
  if (userId && this.serialNumber) {
    try {
      const Truck = mongoose.model('Truck');
      const truckInfo = await Truck.findOne({ serialNumber: this.serialNumber });
      if (truckInfo) {
        this.driverId = truckInfo.driver;
        this.vehicleOwnerId = truckInfo.vehicleOwner;
      }
    } catch (error) {
      return next(error);
    }
  }

  if (this.coordinates.length > 5) {
    this.coordinates = this.coordinates.slice(-5); // keep last 5 only
  }

  next();
});

module.exports = mongoose.model('HistoryLocation', historyLocationSchema);
