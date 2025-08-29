const mongoose = require('mongoose');
const User = require('./user');

const puncherSchema = new mongoose.Schema({
    puncher: Boolean,
    vehicleOwnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    serialNumber: String,
    recordUrl: String,
    timestamp: Date,
    make: String,
    model: String,
    year: String,
    numberPlate: String,
    vibration: Number,
    rotation: Number,
    acceleration: Number,
    truckLocation: {
        type: {
          type: String,
          enum: ['Point'], // required for GeoJSON
          default: 'Point'
        },
        coordinates: {
          type: [Number], // [longitude, latitude]
          required: true
        }
      },
});

puncherSchema.pre('save', async function (next) {
    console.log('okay lana ke');
    console.log('Truck info found: one',this.driverId);
    console.log('Truck info found: two', this.serialNumber);

    if (!this.driverId && this.serialNumber) {
        try {
      
            const Truck = mongoose.model('Truck');
            const truckInfo = await Truck.findOne({ serialNumber: this.serialNumber });
            console.log('Truck info found: thre', truckInfo);
            if (truckInfo) {
                this.vehicleOwnerId = truckInfo.vehicleOwner;
                this.make = truckInfo.make;
                this.model = truckInfo.model;
                this.year = truckInfo.year;
                this.numberPlate = truckInfo.numberPlate;
                this.driverId=truckInfo.driver;
            }
        } catch (error) {
            return next(error); // Pass error to save handler
        }
    }

    next();
});

puncherSchema.post('save', async function (doc) {
  try {
    const updates = [];

    if (doc.driverId) {
      updates.push(
        User.findByIdAndUpdate(
          doc.driverId,
          { $addToSet: { puncher: doc._id } }
        )
      );
    }

    if (doc.vehicleOwnerId) {
      updates.push(
        User.findByIdAndUpdate(
          doc.vehicleOwnerId,
          { $addToSet: { puncher: doc._id } }
        )
      );
    }

    await Promise.all(updates);
    console.log("User(s) successfully updated");

  } catch (error) {
    console.error("Failed to update user(s)", error.message);
  }
});

module.exports = mongoose.model("Puncher", puncherSchema);
