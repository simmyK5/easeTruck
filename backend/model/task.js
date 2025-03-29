const mongoose = require("mongoose")
const FileSchema =require("./file");
const TaskSchema = new mongoose.Schema({
    vehicleOwnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    notificationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Notification' },
    fileUrls: [
        {
            name: String, // Original file name
            url: String,  // Stored file URL
        },
    ],
    timestamp: { type: Date, default: Date.now },
    numberPlate:{
        type:String,
        require:true
    },
    startPoint :{
        type:String,
        max:500
    },
    endPoint:{
        type:String,
        max:500
    },
    status:{
        type:String,
        max:500
    },
    loadCapacity:{
        type:String,
        max:500
    }, onload:{ 
        type: Number
    }, offload:{ 
        type: Number
    },
},
    { timestamps: true }
)
module.exports = mongoose.model("Task", TaskSchema)