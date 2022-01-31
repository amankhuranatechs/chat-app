const path = require('path'); // inbuilt module
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const Filter = require('bad-words')

//import files
const { generateMessage, generateLocationMessage } = require('./utils/messages');
const {getUser, removeUser, addUser, getUsersInRoom} = require('./utils/users.js');

//initiate server
const app = express();
const server = http.createServer(app);
const io = socketio(server);


const port = process.env.PORT || 7000;
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath));

let count = 0;


io.on('connection', (socket) => {
    console.log('New Websocket connection!!');

    // socket.emit('message', 'Welcome'); //send message only to particular joined connection 
    // socket.emit('message', generateMessage('Welcome!'))
    // socket.broadcast.emit('message', generateMessage('A new user has joined!'))  // emitting to everybody except the current socket
    
    socket.on('join', (options, callback) => {
        const { error, user } = addUser({id: socket.id, ...options});

        if(error) {
            return callback(error);
        }

        socket.join(user.room);
        socket.emit('message', generateMessage('Admin', 'Welcome!'))
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin',`${user.username} has joined!`));
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback();
    })
    
    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if(user) {
            io.to(user.room).emit('message', generateMessage('Admin',`${user.username} has left!`)) //  sends message to everybody!!
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })

    socket.emit('countUpdated', count);
    socket.on('increment', () => {
        count ++;
        // socket.emit('countUpdated', count)  // emit only to single or connented connection, emits event to a specific connection
        io.emit('countUpdated', count)
    })
 
    socket.on('message', (message, callback) => {
        const user = getUser(socket.id);
        const filter = new Filter();

        if(filter.isProfane(message)) {
            return  callback('Profanity is not allowed!')
        }
        // io.to('panchkula').emit('message', generateMessage(message));
        io.to(user.room).emit('message', generateMessage(user.username,  message));
        callback('Delivered!!')
    })

    socket.on('sendLocation', (location, callback) => {
        const user = getUser(socket.id);
        console.log(location);
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${location.latitude},${location.longitude}`));
        callback('location delivered!!')
    })
})




app.get('/', function (req, res) {
    res.send('Hello World!');
});

server.listen(port, () => {
    console.log(`app is running on ${port}`)
})

