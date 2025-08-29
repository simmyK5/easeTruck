const mongoose = require('mongoose');
const User = require('./user');

const peopleSchema = new mongoose.Schema({
    peopleEstimation: String,
    location: String,
    recordUrl: String,
    timestamp: Date,
    vehicleOwnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
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

peopleSchema.pre('save', async function (next) {
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

peopleSchema.post('save', async function (doc) {
  try {
    const updates = [];
console.log("see me",)
    if (doc.driverId) {
      updates.push(
        User.findByIdAndUpdate(
          doc.driverId,
          { $addToSet: { people: doc._id } }
        )
      );
    }

    if (doc.vehicleOwnerId) {
      updates.push(
        User.findByIdAndUpdate(
          doc.vehicleOwnerId,
          { $addToSet: { people: doc._id } }
        )
      );
    }

    await Promise.all(updates);
    console.log("User(s) successfully updated");

  } catch (error) {
    console.error("Failed to update user(s)", error.message);
  }
});

module.exports = mongoose.model("People", peopleSchema)