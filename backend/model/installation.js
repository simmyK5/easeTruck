const mongoose = require("mongoose")


const InstallationSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    surname: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true
    },
    phoneNumber: {
        type: String,
        max: 500
    },
    notes: {
        type: String,
        max: 500
    },
    status: {
        type: String,
        max: 500
    },
    paymentStatus: {
        type: String,
        max: 500
    },
    dateRanges: {
        type: Date
    },
    dateChosen: {
        type: Date
    },
    paymentId: {
        type: String,
        max: 500
    },
   
    items: {
        type: Array,
    },

    totalAmount: {
        type: Number,
    },
    technician:  {
        type: String,
        max: 500
    },
    address: {
        address_line_1: { type: String, required: true },
        address_line_2: { type: String},
        admin_area_2: { type: String, required: true },
        admin_area_1: { type: String },//province
        postal_code: { type: String, required: true },
        country_code: { type: String, required: true },
      },

    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    technician: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }

    

},
    { timestamps: true }
)

module.exports = mongoose.model("Installation", InstallationSchema)