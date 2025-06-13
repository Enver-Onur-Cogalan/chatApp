const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const auth = require('../middlewares/authMiddleware');

router.get('/', auth, async (req, res) => {
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
        return res.status(500).json({ message: 'Server error' });
    }
});

router.delete('/:id', auth, async (req, res) => {
    const { id } = req.params;
    console.log(`🗑️ [messageRoutes] DELETE /api/messages/${id} called by`, req.user.username);
    try {
        const result = await Message.deleteOne({ _id: id });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'No message found' });
        }
        console.log(`🗑️ [messageRoutes] Message ${id} deleted by ${req.user.username}`);
        return res.status(200).json({ message: 'Message deleted' });
    } catch (err) {
        console.error('❌ [messageRoutes] Delete message error:', err);
        return res.status(500).json({ message: 'Deletion failed' });
    }
});

router.delete('/', auth, async (req, res) => {
    try {
        await Message.deleteMany({ receiver: 'all' });
        console.log(`🗑️ [messageRoutes] All messages deleted by ${req.user.username}`);
        return res.status(200).json({ message: 'All messages deleted' });
    } catch (err) {
        console.error('❌ [messageRoutes] Delete all error:', err);
        return res.status(500).json({ message: 'Deletion failed' });
    }
});

module.exports = router;