const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware'); 

const JWT_SECRET = 'your_jwt_secret_key';  // In production, use an environment variable

// Register route
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const user = new User({ name, email, password });
        await user.save();

        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        res.status(400).json({ error: 'Email already exists' });
    }
});

// Login route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email, password });
        if (!user) return res.status(400).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: 'Something went wrong' });
    }
});

// Check if logged in
router.get('/isloggedin', (req, res) => {
    const token = req.headers.authorization.split(' ')[1];

    if (!token) {
        return res.status(401).json({ loggedIn: false });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        res.json({ loggedIn: true });
    } catch (error) {
        res.status(401).json({ loggedIn: false });
    }
});

router.get('/me', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Something went wrong' });
    }
});

module.exports = router;
