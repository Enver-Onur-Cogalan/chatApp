const users = new Map(); // username: socketId eşleşmesi 

const handleSocketConnection = (io, socket) => {
    console.log('🟢 Yeni bağlantı:', socket.id);

    // Kullanıcı kimliği
    socket.on('register', (username) => {
        users.set(username, socket.id);
        console.log(`✅ ${username} bağlandı -> ${socket.id}`);
    });

    // Mesajın alıcıya iletlimesi
    socket.on('sendMessage', ({ sender, reciever, content }) => {
        const receiverSocketId = users.get(reciever);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('receiveMessage', {
                sender,
                content,
                timestamps: new Date(),
            });
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