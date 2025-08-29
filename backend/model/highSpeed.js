const mongoose = require('mongoose');
const User = require('./user');

const highSpeedSchema = new mongoose.Schema({
    timestamp: { type: Date, default: Date.now },
    latitude: Number,
    longitude: Number,
    speed: Number,
    speedLimit: Number,
    street: String,
    serialNumber: String,
    voucherProcessed: { type: Boolean, default: false },
    vehicleOwnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

});
// In highSpeedSchema
highSpeedSchema.pre('save', async function (next) {
    if (!this.driverId && this.serialNumber) {
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
    next();
});

highSpeedSchema.post('save', async function (doc) {
  try {
    const updates = [];

    if (doc.driverId) {
      updates.push(
        User.findByIdAndUpdate(
          doc.driverId,
          { $addToSet: { highSpeed: doc._id } }
        )
      );
    }

    if (doc.vehicleOwnerId) {
      updates.push(
        User.findByIdAndUpdate(
          doc.vehicleOwnerId,
          { $addToSet: { highSpeed: doc._id } }
        )
      );
    }

    await Promise.all(updates);
    console.log("User(s) successfully updated");

  } catch (error) {
    console.error("Failed to update user(s)", error.message);
  }
});


module.exports = mongoose.model('HighSpeed', highSpeedSchema);
