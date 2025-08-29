const mongoose = require('mongoose');
const User = require('./user');

const glassBreakSchema = new mongoose.Schema({
    eventType: String,
    vehicleOwnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    amplitude: String,
    confidence: String,
    fruequency_peak: String,
    recordUrl: String,
    timestamp: Date,
    make: String,  
    model: String,
    year: String,  
    numberPlate: String,
    serialNumber: String,
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

glassBreakSchema.pre('save', async function (next) {
    console.log("wedali",this.driverId)
    console.log("senfisa",this.serialNumber)
    if (!this.driverId && this.serialNumber) {
        try {
            const Truck = mongoose.model('Truck');
            const truckInfo = await Truck.findOne({ serialNumber: this.serialNumber });

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

glassBreakSchema.post('save', async function (doc) {
  try {
    const updates = [];

    if (doc.driverId) {
      updates.push(
        User.findByIdAndUpdate(
          doc.driverId,
          { $addToSet: { glassBreak: doc._id } }
        )
      );
    }

    if (doc.vehicleOwnerId) {
      updates.push(
        User.findByIdAndUpdate(
          doc.vehicleOwnerId,
          { $addToSet: { glassBreak: doc._id } }
        )
      );
    }

    await Promise.all(updates);
    console.log("User(s) successfully updated");

  } catch (error) {
    console.error("Failed to update user(s)", error.message);
  }
});

module.exports = mongoose.model("GlassBreak", glassBreakSchema)