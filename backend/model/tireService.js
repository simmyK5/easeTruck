const mongoose = require('mongoose'); 

const tireServiceSchema = new mongoose.Schema({ 
  timestamp: { type: Date, default: Date.now },
  
    tireMileage: Number, 
    lastTireServiceDate: Date, 
    nextTireServiceDate: Date, 
    deviceSerialNumber: String ,

    truck: { type: mongoose.Schema.Types.ObjectId, ref: 'Truck' },
  
  
  
  }); 
  
    
  
module.exports = mongoose.model('tireService', tireServiceSchema); 