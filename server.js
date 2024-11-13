const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Dummy names list
const dummyNames = ["User_Alpha", "User_Beta", "User_Gamma", "User_Delta", "User_Epsilon"];

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  console.log('A user connected');
  
  // Assign a dummy name randomly to each user
  const userName = dummyNames[Math.floor(Math.random() * dummyNames.length)];
  socket.userName = userName;

  // Join room
  socket.on('join room', (room) => {
    socket.join(room);
    socket.room = room;
    console.log(`${userName} joined room: ${room}`);

    // Notify all users in the room that someone joined
    io.to(room).emit('user joined', userName);
  });

  // Handle sending messages to a specific room
  socket.on('chat message', (msg) => {
    const room = socket.room;
    if (room) {
      io.to(room).emit('chat message', `${userName}: ${msg}`);
    } else {
      socket.emit('error', 'Please join a room first.');
    }
  });

  // Handle leaving the room
  socket.on('leave room', () => {
    const room = socket.room;
    if (room) {
      socket.leave(room);
      io.to(room).emit('user left', userName);
      socket.room = null;
    }
  });

  socket.on('disconnect', () => {
    const room = socket.room;
    if (room) {
      io.to(room).emit('user left', userName);
    }
    console.log(`${userName} disconnected`);
  });
});

server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
