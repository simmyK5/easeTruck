const mongoose = require("mongoose")
const AdSchema = new mongoose.Schema({
    title:{
        type:String,
        require:true
    },
    content:{
        type:String,
        require:true
    },
    imagePath: { type: String, required: true },
    linkUrl :{
        type:String,
        max:500
    },
    startDate:{
        type:Date,
    },
    endDate:{
        type:Date,
    },
    active:{
        type:Boolean ,
    },
    adType:{
        type:String,
        require:true
    },
    totalAmount: {
        type: Number,
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    
    paymentId: {
        type: String,
        max: 500
    },
   
    paymentStatus: {
        type: String,
        max: 500
    },
    email: {
        type: String,
        require: true
    },
      
},
    { timestamps: true }
)
module.exports = mongoose.model("Ad", AdSchema)