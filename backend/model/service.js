const mongoose = require("mongoose");
const truck = require("./truck");
const serviceDueSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },

  mileage: Number,

  serviceDue: Boolean,

  lastServiceDate: Date,

  nextServiceDate: Date,
  deviceSerialNumber: String,
  truck: { type: mongoose.Schema.Types.ObjectId, ref: 'Truck' },

});



module.exports = mongoose.model('serviceDue', serviceDueSchema); 