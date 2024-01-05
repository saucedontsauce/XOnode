const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const path = require('path');


class Game {
  constructor(p1, p2) {
    this.p1id = p1.id;
    this.p2id = p2.id;
    this.p1name = p1.username;
    this.p2name = p2.username;
    this.gameField = [
      ["", "", ""],
      ["", "", ""],
      ["", "", ""]
    ]
  };

  makeMove() {

  }
}


let app = express();
const port = 3000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let liveUsers = {};
let liveGames = {};
let searchingUsers = {};

app.use('/public', express.static(path.join(__dirname, '/public')))

app.get('/', function (req, res) {
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
  liveUsers[socket.id] = { ...socket };
  let idArr = Object.keys(liveUsers);
  let userCount = idArr.length;
  console.log(userCount);
  io.emit('x0_Live_Users', userCount);


  socket.on('disconnect', () => {
    console.log('user disconnected', socket.id);
    delete liveUsers[socket.id];
    let idArr = Object.keys(liveUsers);
    let userCount = idArr.length;
    io.emit('x0_Live_Users', userCount);
    handleCleanup(socket)
  })

  socket.on('req_count', () => {
    let usrArr = Object.keys(liveUsers);
    let userCount = usrArr.length;
    console.log('player count requested from', socket.id);
    io.emit('x0_Live_Users', userCount);
  })

  socket.on('req_games', () => {
    let gamesArr = Object.keys(liveGames);
    let gameCount = gamesArr.length;
    console.log('game count requested from', socket.id)
    io.emit('x0_Live_Games', gameCount)
  })

  socket.on("req_searching", (msg) => {
    console.log(msg.username, "wants to search ...");
    console.log(msg);
    liveUsers[socket.id].username = msg.username;
    searchingUsers[socket.id] = liveUsers[socket.id];
    findMatch(socket.id)
  });
});


// weird functions / classes




const handleCleanup = (user) => {
  console.log(user.id, 'needs cleanup')
}

const findMatch = (id) => {
  console.log('find a match')
  for (let i in searchingUsers) {
    console.log(searchingUsers[i].id)
    if (searchingUsers[i].id != id) {
      console.log("match found")
      // match found
      delete searchingUsers[i];
      delete searchingUsers[id];
      io.to(i).emit('x0_Game_Redirect', "gamePlay");
  io.to(id).emit('x0_Game_Redirect', "gamePlay");
      manageGame(id, i)
    }
  }

}

const manageGame = (p1, p2) => {
  console.log('game started');
  let gameName = p1 + p2;
  let thisgame = new Game(p1, p2);
  liveGames[gameName] = {...thisgame};
  let gameArr = Object.keys(liveGames);
  let gameCount = gameArr.length;
  io.emit("x0_Live_Games", gameCount);
  io.to(p1.id).emit('x0_Game_Live', thisgame);
  io.to(p2.id).emit('x0_Game_Live', thisgame);

  io.on("game_move", (move) => {

  })







}









// run server


httpServer.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});