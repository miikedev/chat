const express = require('express');  
const app = express();  
const http = require('http');  
const server = http.createServer(app);  
const { Server } = require("socket.io");  
const io = new Server(server,{
    cors: {
        origin: "https://chat-app-teehtwin.vercel.app"
    }
});  
const path = require('path');  
const authRouter = require('../src/routes/authRouter');   
const userRouter = require('../src/routes/userRouter');  
const connect = require('../src/db/connect');  
require('dotenv').config();  
const jwtVerifyMiddleware = require('../src/middleware/authMiddleware');  
const logger = require('../src/utils/logger');  

// Serve static files from the 'public' directory (adjust as necessary)  
app.use(express.static(path.join(__dirname, 'public'))); // Make sure to have a 'public' folder for static files  
app.use(express.json());  
app.use(express.urlencoded({ extended: true }));  

app.get('/api', (req, res) => {  
    res.json({  
        success: true,  
        message: 'Welcome to the Chat App!'  
    });  
});  

app.get('/', (req, res) => {  
    logger.info('Welcome to the Chat App');  
    res.sendFile(path.join(__dirname, '../src/index.html'));  
});  

// Use routers for handling user and auth routes  
app.use('/api/v1', userRouter);  
app.use('/api/v1/auth', authRouter);  
const usernames = {};

io.on('connection', (socket) => {
  logger.info(`A user connected: ${socket.id}`);

  socket.on('adduser', (username) => {
    logger.info(`Add user: ${username}`);
    socket.username = username;
    usernames[username] = socket.id;
    socket.emit('updatechat', 'Chat Bot', `${username}, you have joined the chat`);
    socket.broadcast.emit('updatechat', 'Chat Bot', `${username} has joined the chat`);
    io.emit('updateusers', Object.keys(usernames));
  });

  socket.on('private message', ({ recipient, message }) => {
    const recipientSocket = usernames[recipient];
    if (recipientSocket) {
      logger.info(`Private message from ${socket.username} to ${recipient}: ${message}`);
      io.to(recipientSocket).emit('private message', {
        message,
        from: socket.username,
      });
      socket.emit('private message', {
        message,
        from: socket.username,
        to: recipient
      });
    } else {
      socket.emit('updatechat', 'Chat Bot', `User ${recipient} is not online.`);
    }
  });

  socket.on('disconnect', () => {
    logger.info(`User disconnected: ${socket.username}`);
    if (socket.username) {
      delete usernames[socket.username];
      socket.broadcast.emit('updatechat', 'Chat Bot', `${socket.username} has left the chat`);
      io.emit('updateusers', Object.keys(usernames));
    }
  });
});
// Server and database connection  
const port = process.env.PORT || 3000;  
const url = process.env.MONGO_URI;  

const start = async () => {  
    try {  
        await connect(url);  
        logger.info('Connected to DB');  
        server.listen(port, () => {  
            logger.info(`Server running on port ${port}`);  
        });  
    } catch (error) {  
        logger.error('Error connecting to the database:', error);  
        process.exit(1); // Exit the process if DB connection fails  
    }  
};  

start();