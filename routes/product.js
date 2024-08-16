const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
// Route to get products by state
router.get('/state/:state', async (req, res) => {
    let products;
    try {
        if(req.params.state == 'all') {
            products = await Product.find();
            res.json(products);
        }
        else{
            products = await Product.find({ state: req.params.state });
            res.json(products);
        }
    } catch (error) {
        res.status(500).json({ error: 'Something went wrong' });
    }
});

// Route to get a product by ID
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: 'Something went wrong' });
    }
});

module.exports = router;
