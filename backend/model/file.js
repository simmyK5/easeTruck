const mongoose = require("mongoose")
const FileSchema = new mongoose.Schema({
    filename: String,
    contentType: String,
    data: Buffer,
    file: { type: mongoose.Schema.Types.ObjectId, ref: 'File' },
},

    { timestamps: true }
)
module.exports = mongoose.model("File", FileSchema)