const mongoose = require("mongoose");
const serviceDueSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  mileage: Number,
  serialNumber: String,
  truck: { type: mongoose.Schema.Types.ObjectId, ref: 'Truck' },
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  vehicleOwnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

});
serviceDueSchema.pre('save', async function (next) {
  if (!this.driverId && this.serialNumber) {
    try {
      const Truck = mongoose.model('Truck');
      const truckInfo = await Truck.findOne({ serialNumber: this.serialNumber });

      if (truckInfo) {
        this.driverId = truckInfo.driver;
        this.vehicleOwnerId = truckInfo.vehicleOwner;
        this.truck = truckInfo._id;
      }
    } catch (error) {
      return next(error); // Pass error to save handler
    }
  }

  next();
})


module.exports = mongoose.model('ServiceDue', serviceDueSchema); 