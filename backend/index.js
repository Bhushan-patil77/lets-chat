// 1. Load required modules
const express = require('express');
const mongoose = require('mongoose');
const userModel = require('./models/userModel')
const messageModel = require('./models/messageModel')
const http = require('http');
const socketIo = require('socket.io');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();





// 2. Initialize environment variables
const PORT = process.env.PORT || 5000;
const DB_URL = process.env.DB_URL;

// 3. Create app object
const app = express();
const server = http.createServer(app);

// 4. Middleware setup
// Add this middleware before defining routes
app.use(express.json()); // to parse JSON-formatted request bodies
app.use(express.urlencoded({ extended: true })); // to parse URL-encoded request bodies

app.use(cors({
  origin: '*', // your frontend origin
  
}));
const io = new Server(server, {
  cors: {
      origin: '*', // Allow all origins
  },
});

// 5. Define routes
const userRoutes = require('./routes/userRoutes');
app.use('/', userRoutes);

// Track online users
const onlineUsers = {};

io.on('connection', (socket) => {

  // Handle socket ID update
  socket.on('updateSocketId', async ({ userId, socketId }) => {
    onlineUsers[userId] = socketId; // Store userId and socketId
    io.emit('getOnlineUsers', onlineUsers); // Emit updated list to all clients

    const { acknowledged, modifiedCount } = await userModel.updateOne({ _id: userId }, { $set: { socketId: socketId, status:'online' } });
    if (acknowledged && modifiedCount) {
      socket.emit('isUpdated', true);
    }
  });

  // Handle sending messages
  socket.on('sendMessage', async (msgObject) => {

    console.log('msg rcved', msgObject)

    const newMsg = new messageModel(msgObject)

    const result = await newMsg.save()

    socket.to(msgObject.toSocket).emit('receiveMessage', newMsg);
  });
 
  socket.on('getPreviousMessages', async ({ senderId, receiverId }) => {
    try {
        // Query messages where either user is the sender or receiver
        const previousMessages = await messageModel.find({
          $or: [
            { 'sender.userId': senderId, 'receiver.userId': receiverId },
            { 'sender.userId': receiverId, 'receiver.userId': senderId }
          ]
        }).sort({ _id: 1 }); // Sort by ID to get messages in order of creation (or use timestamp if available)
        // Emit the messages back to the client
        socket.emit('previousMessages', previousMessages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        socket.emit('error', { message: 'Unable to retrieve messages' });
    }
});



  // Handle disconnection
  socket.on('disconnect', async () => {
    const disconnectedUser = Object.keys(onlineUsers).find(userId => onlineUsers[userId] === socket.id);
    
    if (disconnectedUser) {
      delete onlineUsers[disconnectedUser];
      io.emit('getOnlineUsers', onlineUsers); // Emit updated list to all clients
      await userModel.updateOne({ socketId: socket.id }, { $set: { socketId:'', status:'offline' } });
    }
  });
});

// 6. Connect to the database
mongoose.connect(DB_URL).then(() => {
  console.log('Database connected...');
  server.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
  });
}).catch((err) => {
  console.log('Something went wrong', err);
});
  