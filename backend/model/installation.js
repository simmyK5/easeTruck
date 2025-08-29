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
    technician: {
        type: String,
        max: 500
    },
    address: {
        type: String,
        max: 500
    },
    outstandingInstallation: {
        type: Boolean
    },

    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    technician: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }



},
    { timestamps: true }
)

module.exports = mongoose.model("Installation", InstallationSchema)