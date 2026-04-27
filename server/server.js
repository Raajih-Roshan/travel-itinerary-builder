const express    = require('express');
const mongoose   = require('mongoose');
const cors       = require('cors');
const http       = require('http');
const { Server } = require('socket.io');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app    = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin:      'http://localhost:3000',
    methods:     ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

app.set('io', io);

app.use(cors({
  origin:      'http://localhost:3000',
  methods:     ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
  res.json({ message: 'Travel Itinerary API is running!' });
});

app.use('/api/auth',     require('./routes/authRoutes'));
app.use('/api/trips',    require('./routes/tripRoutes'));
app.use('/api/items',    require('./routes/itemRoutes'));
app.use('/api/memories', require('./routes/memoryRoutes'));

io.on('connection', (socket) => {
  console.log('🔌 User connected:', socket.id);

  socket.on('join_trip', (tripId) => {
    socket.join(tripId);
    console.log(`✅ Socket ${socket.id} joined trip: ${tripId}`);
  });

  socket.on('leave_trip', (tripId) => {
    socket.leave(tripId);
    console.log(`❌ Socket ${socket.id} left trip: ${tripId}`);
  });

  socket.on('disconnect', () => {
    console.log('🔌 User disconnected:', socket.id);
  });
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));