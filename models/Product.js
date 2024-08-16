// backend/models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String
    },
    img:{
        type: String
    },
    state: {
        type: String,
    },
    price: {
        type: Number
    },
    disc:{
        type: Number
    },
    description: {
        type: String
    },
    reviews: {
        type: Array
    }
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
