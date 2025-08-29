const mongoose = require('mongoose');
const User = require('./user');

const brakeSchema = new mongoose.Schema({
    timestamp: { type: Date, default: Date.now },
    latitude: Number,
    longitude: Number,
    acceleration: Number,
    brakeForce: Number,
    speed: Number,
    serialNumber: String,
    voucherProcessed: { type: Boolean, default: false },
    vehicleOwnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});
brakeSchema.pre('save', async function (next) {
    if (!this.driverId && this.serialNumber) {
        try {
            const Truck = mongoose.model('Truck');
            const truckInfo = await Truck.findOne({ serialNumber: this.serialNumber });

            if (truckInfo) {
                this.driverId = truckInfo.driver;
                this.vehicleOwnerId = truckInfo.vehicleOwner;
            }
        } catch (error) {
            return next(error); // Pass error to save handler
        }
    }

    next();
});

brakeSchema.post('save', async function (doc) {
  try {
    const updates = [];

    if (doc.driverId) {
      updates.push(
        User.findByIdAndUpdate(
          doc.driverId,
          { $addToSet: { brake: doc._id } }
        )
      );
    }

    if (doc.vehicleOwnerId) {
      updates.push(
        User.findByIdAndUpdate(
          doc.vehicleOwnerId,
          { $addToSet: { brake: doc._id } }
        )
      );
    }

    await Promise.all(updates);
    console.log("User(s) successfully updated");

  } catch (error) {
    console.error("Failed to update user(s)", error.message);
  }
});

module.exports = mongoose.model('Brake', brakeSchema);