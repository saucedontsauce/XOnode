const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const path = require('path');

let app = express();
const port = 3000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let liveUsers = {};


app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, '/index.html'));
  });


app.get("/api", (req, res) => {
  res.status(200).send({
    success: true,
    message: "welcome to the beginning of greatness",
  });
});

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("We are live and connected");
  console.log(socket.id);
  liveUsers[socket.id] = {
    "userName": 'user',
    level: 0
  };
  let idArr = Object.keys(liveUsers);
let userCount = idArr.length;
console.log(userCount)
  io.emit('x0_Live_Users', userCount);


  socket.on('disconnect', ()=>{
    console.log('user disconnected', socket.id);
    delete liveUsers[socket.id]
  })

  socket.on('req_count', ()=>{
    let idArr = Object.keys(liveUsers);
let userCount = idArr.length;
    console.log('player count requested from',socket.id);
    io.emit('x0_Live_Users', userCount);
})

    socket.on("req_searching", ()=>{
        console.log('searching list requested')
    })

});




httpServer.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});