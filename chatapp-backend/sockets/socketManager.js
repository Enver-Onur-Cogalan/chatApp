const users = new Map();
const Message = require('../models/Message');


const handleSocketConnection = (io, socket) => {
    console.log('🟢 Yeni bağlantı:', socket.id);

    // Kullanıcı kimliği
    socket.on('register', (username) => {
        users.set(username, socket.id);
        console.log(`✅ ${username} bağlandı -> ${socket.id}`);
    });

    // Mesajın alıcıya iletlimesi
    socket.on('sendMessage', async (data) => {
        console.log('🟢 [CLIENT] sendMessage alındı:', data);

        const sender = data.sender;
        const content = data.content ?? data.text;
        const receiver = data.receiver || 'all';

        console.log('🟢 [SERVER] sendMessage:', { sender, receiver, content });

        try {
            const msgDoc = await Message.create({ sender, receiver, content });
            console.log('💾 Mesaj DB’ye kaydedildi');

            const payload = {
                id: msgDoc._id.toString(),
                text: msgDoc.content,
                sender: msgDoc.sender,
                timestamp: msgDoc.timestamp.toISOString(),
            };

            if (receiver === 'all') {
                socket.broadcast.emit('receiveMessage', payload);
            } else {
                const id = users.get(receiver);
                if (id) io.to(id).emit('receiveMessage', payload);
            }
        } catch (e) {
            console.error("❌ DB'ye kaydetme hatası:", e)
        }

    });

    socket.on('disconnect', () => {
        console.log('🔴 Bağlantı kesildi:', socket.id);
        // users map'ten silme
        for (let [username, id] of users.entries()) {
            if (id === socket.id) {
                users.delete(username);
                console.log(`❌ ${username} çıkarıldı`);
                break;
            }
        }
    });
};

module.exports = { handleSocketConnection };