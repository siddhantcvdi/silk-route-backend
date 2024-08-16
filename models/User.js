const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    cart: { type: Array, default: [] },
    orders: { type: Array, default: [] }
});

module.exports = mongoose.model('User', userSchema);