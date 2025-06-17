const users = new Map();
const Message = require('../models/Message');
const lastSeen = new Map(); // username -> Date


const handleSocketConnection = (io, socket) => {
    console.log('🟢 New link:', socket.id);

    let currentUser = null;

    const broadcastPresence = () => {
        const allUsers = new Set([...users.keys(), ...lastSeen.keys()]);
        const presenceInfo = Array.from(allUsers).map(username => ({
            username,
            online: users.has(username),
            lastSeen: users.has(username)
                ? null
                : (lastSeen.get(username).toISOString() ?? null)
        }));
        io.to('global').emit('presence', presenceInfo);
        console.log('✔️ [broadcastPresence] emitted presence:', presenceInfo);
    };

    // User ID
    socket.on('register', (username) => {
        currentUser = username;
        users.set(username, socket.id);
        lastSeen.delete(username);

        socket.join('global');

        const joinedRooms = Array.from(socket.rooms)
            .filter(r => r !== socket.id)
            .join(', ');

        console.log(`✅ ${username} registered. Joined rooms: ${joinedRooms}`);

        broadcastPresence();
    });

    // Logout
    socket.on('logout', (username) => {
        if (users.has(username)) {
            users.delete(username);
            lastSeen.set(username, new Date());
            console.log(`🔴 [logout] ${username} removed by logout event`);
            broadcastPresence();
        }
    });

    // When the user starts typing
    socket.on('typing', ({ receiver, sender }) => {
        const room = receiver === 'all'
            ? 'global'
            : [sender, receiver].sort().join('#');
        io.to(room).emit('typing', { sender });
    });

    // When the user stops typing
    socket.on('stopTyping', ({ sender, receiver }) => {
        const room = receiver === 'all'
            ? 'global'
            : [sender, receiver].sort().join('#');
        io.to(room).emit('stopTyping', { sender });
    });

    // Delivering the message to the recipient
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

            const room = receiver === 'all'
                ? 'global'
                : [sender, receiver].sort().join('#');

            socket.join(room);
            if (receiver !== 'all') {
                const recvSocketId = users.get(receiver);
                if (recvSocketId) {
                    const recvSocket = io.sockets.sockets.get(recvSocketId);
                    recvSocket?.join(room);
                }
            }

            io.to(room).emit('receiveMessage', payload);
            console.log(`📨 Message sent to room: ${room}`)

        } catch (e) {
            console.error('❌ Error saving to DB:', e)
        }

    });

    // Reading the message
    socket.on('readMessage', async ({ messageId, reader }) => {
        console.log("🟢 [SERVER] readMessage received:", { messageId, reader });
        try {
            const msg = await Message.findByIdAndUpdate(
                messageId,
                { status: 'read' },
                { new: true }
            );

            const senderSocketId = users.get(msg.sender);
            if (senderSocketId) {
                io.to(senderSocketId).emit('messageRead', {
                    id: msg._id.toString(),
                    reader,
                });
                console.log(`📨 Read notification sent: ${msg.sender}`);
            }
        } catch (err) {
            console.error('❌ ReadReceipt error:', err);
        }
    });

    socket.on('joinRoom', ({ other }) => {
        if (!currentUser) return;
        const room = [currentUser, other].sort().join('#');
        socket.join(room);
        console.log(`🔑 ${currentUser} joined private room: ${room}`);
    });

    socket.on('disconnect', () => {
        console.log('🔴 Connection is lost:', socket.id);
        // Delete from users map
        for (let [username, id] of users.entries()) {
            if (id === socket.id) {
                users.delete(username);
                lastSeen.set(username, new Date());
                console.log(`🔴 [disconnect] removed ${username}, set lastSeen:`, lastSeen.get(username));
                break;
            }
        }

        broadcastPresence();
    });
};

module.exports = { handleSocketConnection };