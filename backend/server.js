require('dotenv').config();
const express = require('express');
const http = require('http'); 
const { Server } = require('socket.io'); 
const cors = require('cors');
const connectDB = require('./config/db');
const Message = require('./models/Message');
const projectRoutes = require('./routes/projectRoutes');
const chatRoutes = require('./routes/chatRoutes');
const eventRoutes = require('./routes/eventRoutes');


connectDB(); 

const app = express();
const server = http.createServer(app); 


const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling']
});


app.use(cors());
app.use(express.json()); 


io.on('connection', (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on('join_project', (projectId) => {
    socket.join(projectId);
    console.log(`User joined project room: ${projectId}`);
  });

  socket.on('send_message', async (data) => {
    try {
      const savedMessage = await Message.create({
        project: data.projectId,
        sender: data.senderId,
        text: data.text
      });
      const populatedMsg = await savedMessage.populate('sender', 'name role');
      io.to(data.projectId).emit('receive_message', populatedMsg);
    } catch (err) {
      console.error('Message save error:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('User Disconnected', socket.id);
  });
});


app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/chat', chatRoutes);
app.use('/api/events', eventRoutes);


const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));