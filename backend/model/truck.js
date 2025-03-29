const mongoose = require("mongoose")
const TruckSchema = new mongoose.Schema({
    make: {
        type: String,
        require: true
    },
    model: {
        type: String,
        require: true
    },
    year: {
        type: String,
        require: true
    },
    numberPlate: {
        type: String,
        max: 500,
        require: true
    },
    status: {
        type: String,
        require: true
    },
    insuranceDoc: {
        type: String,
        max: 500
    },
    profilePicture: {
        data: Buffer,
        contentType: String

    },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    serialNumber: {
        type: String
    },
    serviceDue: [{ type: mongoose.Schema.Types.ObjectId, ref: 'serviceDue' }],

    tireService: [{ type: mongoose.Schema.Types.ObjectId, ref: 'tireService' }],
    vehicleOwner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now },
},
    { timestamps: true }
)
module.exports = mongoose.model("Truck", TruckSchema)