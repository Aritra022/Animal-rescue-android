const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
    pet_Type: String,
    description: String,
    upload_date_time: String,
    address: String,
    status: String,
    image: String,
});

module.exports = mongoose.model('Pet', petSchema);
