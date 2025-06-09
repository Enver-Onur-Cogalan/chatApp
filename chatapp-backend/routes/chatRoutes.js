const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/authMiddleware');
const Message = require('../models/Message');

// Mesaj Gönderme
router.post('/send', verifyToken, async (req, res) => {
    const { receiver, content } = req.body;

    try {
        const newMessage = new Message({
            sender: req.user.username,
            receiver,
            content,
        });

        await newMessage.save();

        res.status(201).json({ message: 'Mesaj gönderildi.' });
    } catch (error) {
        console.error('Mesaj gönderme hatası:', error);
        res.status(500).json({ message: 'Mesaj gönderilemedi', error: error.message });
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