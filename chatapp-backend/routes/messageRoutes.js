const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const auth = require('../middlewares/authMiddleware');

router.get('/', auth, async (req, res) => {
    console.log('🛰️ [messageRoutes] GET /api/messages, user:', req.user);
    console.log('🛰️ [messageRoutes] Authorization header:', req.headers.authorization);
    try {
        const msgs = await Message.find({ receiver: 'all' }).sort({ timestamp: 1 });
        const out = msgs.map(m => ({
            id: m._id.toString(),
            text: m.content,
            sender: m.sender,
            timestamp: m.timestamp.toISOString(),
            status: m.status ?? 'sent'
        }));
        console.log('✅ [messageRoutes] returning messages:', out.length);
        return res.json(out);
    } catch (err) {
        console.error('❌ [messageRoutes] DB error:', err);
        return res.status(500).json({ message: 'Sunucu hatası' });
    }
});

router.delete('/', auth, async (req, res) => {
    try {
        await Message.deleteMany({ receiver: 'all' });
        console.log(`🗑️ [messageRoutes] All messages deleted by ${req.user.username}`);
        return res.status(200).json({ message: 'All messages deleted' });
    } catch (err) {
        console.error('❌ [messageRoutes] Delete all error:', err);
        return res.status(500).json({ message: 'Silme işlemi başarısız ' });
    }
});

module.exports = router;