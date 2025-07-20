const mongoose = require('mongoose');

const volunteerSchema = new mongoose.Schema({
    userid: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    password: { type: String, required: true },
    address: String,
    contact: String,
    pet_type: String,
    image: String
});

// ✅ Unique model name to prevent OverwriteModelError
module.exports = mongoose.model('Volunteer', volunteerSchema);
