const {Server} = require('socket.io');
const io = new Server();

const userList = {}

io.on('connection', (socket)=>{
    console.log('soneone connected');
    console.log('person who connected :', socket)


    io.emit("list_users", socket)
})


io.listen(3000)