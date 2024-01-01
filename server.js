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
    console.log('person who connected :', socket.id)


    io.emit("list_users", "test")
})

io.on('connect_error', (err)=>{
    console.log(err);
});
io.on('connect_failed', (err)=>{
    console.log(err);
});
io.on('disconnect', (err)=>{
    console.log(err);
});


io.listen(8080)