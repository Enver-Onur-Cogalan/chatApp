const express = require('express');
const router = express.Router();
const User = require('../models/User');

const auth = require('../middlewares/authMiddleware');

router.get('/', auth, async (req, res) => {
    try {
        const users = await User.find({}, 'username');
        res.json(users.map(u => u.username));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;