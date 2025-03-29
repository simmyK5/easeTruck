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
  
    
  module.exports = mongoose.model('Fuel', fuelSchema); 