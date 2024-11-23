const express = require('express');
const app = express();
const logger = require('./utils/logger')
// const pinoHttp = require('pino-http');
const authRouter = require('./routes/AuthRouter')
const userRouter = require('./routes/UserRouter')
const connect = require('./db/connect')
require('dotenv').config();
const jwtVerifyMiddleware = require('./middleware/authMiddleware')
// Initialize Firebase Admin SDK
// admin.initializeApp({
//   credential: admin.credential.cert('path/to/your/firebase-admin.json'),
//   databaseURL: 'https://<your-firebase-project-id>.firebaseio.com'
// });

// const db = admin.database();
// const roomRef = db.ref('rooms/my-chat-room');

// app.post('/messages', (req, res) => {
//   const message = req.body;
//   const messageRef = roomRef.child('messages').push();
//   messageRef.set(message);
//   res.send('Message sent!');
// });
// app.use(pinoHttp({logger}))
app.use(express.json());
app.use(express.urlencoded({extended: true}))

app.get('/', (req,res) => {
    res.json({
        success: true,
        message: 'Welcome to the Chat App!'
    })
})
app.use('/api/v1', userRouter)
app.use('/api/v1/auth', authRouter)

const port = process.env.PORT || 3000;
const url = process.env.MONGO_URI

const start = async(url) => {
    await connect(url)
    .then(() => logger.info('Connected to DB'))
    .finally(() => app.listen(port, () => {
        logger.info(`Server running on port ${port}`)  // Logs the server's port number to the console when it starts up.  `logger.info` is a pino logger that logs in the console with a timestamp and colorized output.  `info` is the log level for this type of message.  `Server running on port ${port}` is the message that gets logged.  The `finally` block ensures that the connection to the DB is closed even if an error occurs during the server start-up process.  This is a good practice to ensure that resources are properly cleaned up in case of errors.  `app.listen` is a method provided by Express that starts the server and listens for incoming connections on the specified port.  `port` is the port number that the server will be listening on.  `logger.info` is used to log this message.  The `url` variable is the MongoDB connection string that is used
    }))
}

start(url)
