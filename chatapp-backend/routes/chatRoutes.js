const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/authMiddleware');
const Message = require('../models/Message');

// Mesaj Gönderme
router.post('/send', verifyToken, async (req, res) => {
    const { receiver, content } = req.body;
    const sender = req.user.username;

    try {
        const msg = await Message.create({ sender, receiver, content });

        io.emit('receiveMessage', { text: content, sender });
        res.status(201).json(msg);
    } catch (err) {
        console.error('❌[chatRoutes] Error sending message:', err);
        res.status(500).json({ message: 'Message could not be sent', error: err.message });
    }
});

// Mesaj Geçmişi
router.get('/history/:username', verifyToken, async (req, res) => {
    const otherUser = req.params.username;
    const currentUser = req.user.username;

    try {
        const messages = await Message.find({
            $or: [
                { sender: currentUser, receiver: otherUser },
                { sender: otherUser, receiver: currentUser },
            ],
        }).sort({ timestamp: 1 }); // Sort from oldest to newest

        res.status(200).json(messages);
    } catch (error) {
        console.error('Message history error:', error);
        res.status(500).json({ message: 'Could not retrieve message history', error: error.message });
    }
});

module.exports = router;