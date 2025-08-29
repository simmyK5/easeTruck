const mongoose = require('mongoose');

const fuelSchema = new mongoose.Schema({ 
    timestamp: { type: Date, default: Date.now },
    latitude: Number, 
    longitude: Number, 
    fuelLevel: Number, 
    fuelLiters: Number, 
    deviceSerialNumber: String ,
    voucherProcessed: { type: Boolean, default: false },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }); 
  
  fuelSchema.pre('save', async function (next) {
      if (!this.userId && this.serialNumber) {
          try {
              const Truck = mongoose.model('Truck');
              const truckInfo = await Truck.findOne({ serialNumber: this.serialNumber });
  
              if (truckInfo) {
                  this.userId = truckInfo.driverId;
              }
          } catch (error) {
              return next(error); // Pass error to save handler
          }
      }
  
      next();
  });
  module.exports = mongoose.model('Fuel', fuelSchema); 