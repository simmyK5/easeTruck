const mongoose = require('mongoose');

const mapSchema = new mongoose.Schema({
    mapId: String

});

module.exports = mongoose.model("Map", mapSchema)
