const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
    const { username, password } = req.body;

    try {
        // Kullanıcı kontrolü
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username is already taken.' });
        }

        // Şifreyi hashlemek
        const hashedPassword = await bcrypt.hash(password, 10);

        // Yeni kullanıcı oluşturmak
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();

        return res.status(201).json({ message: 'Registration Successful. ' });
    } catch (error) {
        console.error('Register error:', error);
        return res.status(500).json({ message: 'Server error', error });
    }
};

const login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ message: 'User not found.' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: 'The password is incorrect.' });

        const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, {
            expiresIn: '7d',
        });

        return res.status(200).json({ token, username: user.username });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error })
    }
};

module.exports = { register, login };