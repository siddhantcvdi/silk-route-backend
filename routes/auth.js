const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Product = require('../models/Product');

const JWT_SECRET = 'your_jwt_secret_key';  // In production, use an environment variable

// Register route
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const user = new User({ name, email, password });
        await user.save();

        const token = jwt.sign({ userId: user._id }, JWT_SECRET);
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

        const token = jwt.sign({ userId: user._id }, JWT_SECRET);
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

router.post('/add-to-cart', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const productObj = await Product.findOne({ _id: req.body.productID });

        let itemFound = false;
        for (let item of user.cart) {
            if (item.productID.equals(productObj._id)) {
                console.log('Item found');
                item.quantity += 1;
                itemFound = true;
                break;
            }
        }

        if (!itemFound) {
            const product = {
                productID: productObj._id,
                state: productObj.state,
                img: productObj.img,
                name: productObj.name,
                price: productObj.price,
                discount: productObj.disc,
                quantity: 1
            };
            user.cart.push(product);
        } else {
            user.markModified('cart');
        }

        await user.save();
        res.json({ message: 'Item added to cart', cart: user.cart });
    } catch (error) {
        res.status(500).json({ error: 'Something went wrong' });
    }
});


router.post('/update-cart', authMiddleware, async (req, res) => {
    const { cart } = req.body;
    // console.log(req.body);
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.cart =
        // user.markModified('cart');
        await user.save();
});

router.post('/increase-quantity', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ error: 'User not found' });
        const { productID } = req.body;
        for (let item of user.cart) {
            if (item.productID.equals(productID)) {
                console.log('Item found');
                item.quantity += 1;
                user.markModified('cart');
                user.save();
                break;
            }
        }
        res.json({ cart: user.cart });
    } catch (error) {
        res.status(500).json({ error: 'Quantity not increased' });
    }
})

router.post('/decrease-quantity', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ error: 'User not found' });
        const { productID } = req.body;
        for (let item of user.cart) {
            if (item.productID.equals(productID)) {
                console.log('Item found', item.quantity);
                item.quantity -= 1;
                if (item.quantity === 0) {
                    user.cart.splice(user.cart.indexOf(item), 1);
                }
                user.markModified('cart');
                user.save();
                break;
            }
        }
        res.json({ cart: user.cart });
    } catch (error) {
        res.status(500).json({ error: 'Quantity not decreased' });
    }
})
module.exports = router;
