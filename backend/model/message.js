const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    chatId: String,
    senderId: String,
    content: [],
    callLog: [{
        senderId: String ,
        callType: String ,
        startTime: Date ,
        isCall: Boolean ,
        callEnd: Date ,
        callDuration: String ,
        notes: []
    }],
    usersInConversation: [],

    /* callType: { type: String, enum: ['audio', 'video'], default: 'video' }, // Call type
     callStart: { type: Date }, // Call start time
     callEnd: { type: Date },   // Call end time
     callDuration: { type: Number }, // Duration in seconds
     isCall: { type: Boolean, default: false }, // Indicates if it's a call log
     createdAt: { type: Date, default: Date.now },*/
    timestamp: { type: Date, default: Date.now }

});

module.exports = mongoose.model("Message", messageSchema)
