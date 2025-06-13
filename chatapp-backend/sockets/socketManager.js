const users = new Map();
const Message = require('../models/Message');


const handleSocketConnection = (io, socket) => {
    console.log('🟢 New link:', socket.id);

    // Kullanıcı kimliği
    socket.on('register', (username) => {
        users.set(username, socket.id);
        console.log(`✅ ${username} connected -> ${socket.id}`);
    });

    // Mesajın alıcıya iletlimesi
    socket.on('sendMessage', async (data) => {
        console.log('🟢 [CLIENT] sendMessage received:', data);

        const sender = data.sender;
        const content = data.content ?? data.text;
        const receiver = data.receiver || 'all';

        console.log('🟢 [SERVER] sendMessage:', { sender, receiver, content });

        try {
            const msgDoc = await Message.create({ sender, receiver, content });
            console.log('💾 Message saved to DB');

            const payload = {
                id: msgDoc._id.toString(),
                text: msgDoc.content,
                sender: msgDoc.sender,
                timestamp: msgDoc.timestamp.toISOString(),
                status: msgDoc.status,
            };

            socket.emit('receiveMessage', payload);

            if (receiver === 'all') {
                socket.broadcast.emit('receiveMessage', payload);
            } else {
                const id = users.get(receiver);
                if (id) io.to(id).emit('receiveMessage', payload);
            }
        } catch (e) {
            console.error('❌ Error saving to DB:', e)
        }

    });

    // Mesajın okunması
    socket.on('readMessage', async ({ messageId, reader }) => {
        console.log("🟢 [SERVER] readMessage received:", { messageId, reader });
        try {
            const msg = await Message.findByIdAndUpdate(
                messageId,
                { status: 'read' },
                { new: true }
            );

            const senderSocket = users.get(msg.sender);
            if (senderSocket) {
                io.to(senderSocket).emit('messageRead', {
                    id: msg._id.toString(),
                    reader,
                });
            }
        } catch (err) {
            console.error('❌ ReadReceipt error:', err);
        }
    });

    socket.on('disconnect', () => {
        console.log('🔴 Connection is lost:', socket.id);
        // users map'ten silme
        for (let [username, id] of users.entries()) {
            if (id === socket.id) {
                users.delete(username);
                console.log(`❌ ${username} was removed`);
                break;
            }
        }
    });
};

module.exports = { handleSocketConnection };