const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
    chatId: String,
    noteId: String,
    senderId: String,
    note: String,
    numberPlate: String,
    breakdown: Boolean

},
{ timestamps: true });

module.exports = mongoose.model("Note", noteSchema)
