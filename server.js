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

});

io.on('x1_Live_Users', (socket)=>{
    console.log('player count requested from',socket.id);
    io.emit('x0_Live_Users', liveUsers);
})


httpServer.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});