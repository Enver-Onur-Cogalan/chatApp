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
        console.error('❌ Mesaj gönderme hatası:', err);
        res.status(500).json({ message: 'Mesaj gönderilemedi', error: err.message });
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
        }).sort({ timestamp: 1 }); // eskiden yeniye sırala

        res.status(200).json(messages);
    } catch (error) {
        console.error('Mesaj geçmişi hatası:', error);
        res.status(500).json({ message: 'Mesaj geçmişi alınamadı', error: error.message });
    }
});

module.exports = router;