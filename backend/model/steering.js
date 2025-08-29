const mongoose = require('mongoose');
const User = require('./user');

const SteeringSchema = new mongoose.Schema({
  latitude: Number,
  longitude: Number,
  steeringAngle: Number,
  speed: Number,
  timestamp: Date,
  serialNumber: String,
  voucherProcessed: { type: Boolean, default: false },
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  vehicleOwnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

// Automatically populate driverId and vehicleOwnerId if missing
SteeringSchema.pre('save', async function (next) {
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

SteeringSchema.post('save', async function (doc) {
  try {
    const updates = [];

    if (doc.driverId) {
      updates.push(
        User.findByIdAndUpdate(
          doc.driverId,
          { $addToSet: { steerings: doc._id } }
        )
      );
    }

    if (doc.vehicleOwnerId) {
      updates.push(
        User.findByIdAndUpdate(
          doc.vehicleOwnerId,
          { $addToSet: { steerings: doc._id } }
        )
      );
    }

    await Promise.all(updates);
    console.log("User(s) successfully updated");

  } catch (error) {
    console.error("Failed to update user(s)", error.message);
  }
});

module.exports = mongoose.model('Steering', SteeringSchema);
