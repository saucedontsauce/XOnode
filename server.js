const  {createServer} = require('http') ;
const { Server } = require('socket.io');

const httpServer = createServer();
const io = new Server(httpServer, {
    cors: {
        origin: "*:*"
    }
});

const userList = {}


io.on('connection', (socket) => {
    console.log('someone connected');
    console.log('person who connected :', socket)


    io.emit("list_users", "test")
})


io.listen(3000)