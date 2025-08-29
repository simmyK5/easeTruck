const mongoose = require("mongoose")
const UserSchema = new mongoose.Schema({
    firstName: {
        type: String,
        max: 500
    },
    lastName: {
        type: String,
        max: 500
    },
    email: {
        type: String,
        required: true,
        max: 50,
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        max: 50
    },
    userRole: {
        type: String,
        max: 50
    },
    isLive: {
        type: Boolean
    },
    driverPool: {
        type: Boolean
    },
    cvUrl: {
        type: String
    },
    termsAndConditions: {
        type: Boolean
    },
    contract: {
        type: Boolean
    },
    isClaimed: {
        type: Boolean
    },
    vehicleOwnerId: {
        type: String,
        max: 500,
        default: ""
    },
    addedBy: {
        type: String,
        max: 500
    },
    vouchers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Voucher' }],
    acceleration: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Acceleration' }],
    glassBreak: [{ type: mongoose.Schema.Types.ObjectId, ref: 'GlassBreak' }],
    people: [{ type: mongoose.Schema.Types.ObjectId, ref: 'People' }],
    puncher: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Puncher' }],
    weapon: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Weapon' }],
    fuel: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Fuel' }],
    idletimes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Idletimes' }],
    highSpeed: [{ type: mongoose.Schema.Types.ObjectId, ref: 'HighSpeed' }],
    steerings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Steering' }],
    brake: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Brake' }],
    truck: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Truck' }],
    task: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
    subscription: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subscription' }],
    installation: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Installation' }],
    ad: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ad' }],
    notification: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Notification' }],
    feedback: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Feedback' }],
    emailTrails: [{ type: mongoose.Schema.Types.ObjectId, ref: 'EmailTrail' }]

},
    { timestamps: true }
)
module.exports = mongoose.model("User", UserSchema)