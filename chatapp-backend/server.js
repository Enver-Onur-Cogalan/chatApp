const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const messageRouters = require('./routes/messageRoutes');
const { handleSocketConnection } = require('./sockets/socketManager');

dotenv.config();

const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
    cors: {
        origin: '*'
    }
});

// Middleware
app.use(cors());
app.use(express.json());

// Basit test route
app.get('/', (req, res) => {
    res.send('ChatApp Backend is running!');
});

// API routes
app.use('/api/messages', messageRouters);
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);

// Socket.IO bağlantısı
io.on('connection', (socket) => {
    handleSocketConnection(io, socket);
});

// MongoDB bağlantısı
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('✅ MongoDB bağlantısı başarılı.'))
    .catch((err) => console.log('❌ MongoDB bağlantı hatası:', err));

// Port
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
    console.log(`🚀 Server ${PORT} portunda çalışıyor`)
});