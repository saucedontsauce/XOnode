const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");

let app = express();
const port = 3000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let liveUsers = {};

app.get("/", (req, res) => {
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

  socket.on('disconnect', ()=>{
    console.log('user disconnected', socket.id);
    delete liveUsers[socket.id]
  })

  socket.on('x1_Live_Users', ()=>{
    console.log('player count requested from',socket.id);
    let idArr = Object.keys(liveUsers);
    let userCount = idArr.length;
    io.emit('x0_Live_Users, ', userCount);
})

});




httpServer.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});