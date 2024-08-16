const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/product');
const app = express();
const PORT = 3000;

// Database connection
mongoose.connect('mongodb://localhost:27017/SilkRoute').then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('Error connecting to MongoDB', err);
});

// Middleware
app.use(cors());  // Allows cross-origin requests
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
