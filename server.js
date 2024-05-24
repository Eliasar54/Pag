// backend/index.js
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

mongoose.connect('mongodb://yourMongoDBConnectionString', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const User = mongoose.model('User', new mongoose.Schema({
  code: String,
  used: { type: Boolean, default: false },
  commands: { type: Array, default: [] }
}));

// Middleware
app.use(express.json());

// Initialize codes (run this only once)
const codes = ["CODE1", "CODE2", "CODE3", "CODE4", "CODE5", "CODE6", "CODE7", "CODE8", "CODE9", "CODE10", "CODE11", "CODE12"];
codes.forEach(async (code) => {
  const existingCode = await User.findOne({ code });
  if (!existingCode) {
    await new User({ code }).save();
  }
});

// Authentication route
app.post('/api/login', async (req, res) => {
  const { code } = req.body;
  const user = await User.findOne({ code });
  if (user && !user.used) {
    user.used = true;
    await user.save();
    res.status(200).send({ message: 'Login successful', code });
  } else {
    res.status(400).send({ message: 'Invalid or already used code' });
  }
});

// Middleware for socket authentication
io.use(async (socket, next) => {
  const { code } = socket.handshake.query;
  const user = await User.findOne({ code });
  if (user && user.used) {
    socket.user = user;
    next();
  } else {
    next(new Error('Authentication error'));
  }
});

// Socket connection
io.on('connection', (socket) => {
  console.log('New client connected');
  socket.on('command', async (command) => {
    const exec = require('child_process').exec;
    exec(command, (error, stdout, stderr) => {
      let output;
      if (error) {
        output = `Error: ${error.message}`;
      } else if (stderr) {
        output = `Stderr: ${stderr}`;
      } else {
        output = `Output: ${stdout}`;
      }
      socket.emit('output', output);
      socket.user.commands.push({ command, output });
      socket.user.save();
    });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

server.listen(5000, () => {
  console.log('Server running on port 5000');
});
