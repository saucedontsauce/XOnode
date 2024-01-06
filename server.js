const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const path = require('path');


class Game {
  constructor(p1, p2) {
    this.xPlayerID = p1.id;
    this.oPlayerID = p2.id;
    this.xPlayerName = p1.username;
    this.oPlayerName = p2.username;
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
  // create a new property for this connection in the liveUsers object
  liveUsers[socket.id] = { ...socket };
  // calculate length of the live user object and then emit
  let idArr = Object.keys(liveUsers);
  let userCount = idArr.length;
  io.emit('x0_Live_Users', userCount);


  // when user diconnects or closes client
  socket.on('disconnect', () => {
    console.log('user disconnected', socket.id);
    console.log(socket.rooms)
    // delete this person from searchingUsers 
    delete searchingUsers[socket.id]
    // delete this connection from liveUsers 
    delete liveUsers[socket.id];
    // calculate length of the live user object and then emit
    let idArr = Object.keys(liveUsers);
    let userCount = idArr.length;
    io.emit('x0_Live_Users', userCount);
    // remove from all rooms and then make a call to those rooms to tell them someone left
  });

  socket.on('disconnecting', ()=>{
    console.log('user disconnecting')
    var rooms = [... socket.rooms];
    console.log(socket.id,'rooms = ',rooms)
   for(let i=0; i<rooms.length;i++){
    console.log(rooms[i])
    if(rooms[i]!=socket.id){
      console.log(rooms[i])
      socket.to(rooms[i]).emit('x0_Game_Left', "User Left The game")
    }
   }
  });

  // user is requesting the number of live users
  socket.on('req_count', () => {
    // calculate length of the live user object and then emit
    let usrArr = Object.keys(liveUsers);
    let userCount = usrArr.length;
    io.emit('x0_Live_Users', userCount);
  })

  // player is requesting the number of live games
  socket.on('req_games', () => {
    // calculate length of the live user object and then emit
    let gamesArr = Object.keys(liveGames);
    let gameCount = gamesArr.length;
    io.emit('x0_Live_Games', gameCount)
  })

  // user is wanting to search 
  socket.on("req_searching", (msg) => {
    // change the username that is stored in the liveUsers object for this connection
    liveUsers[socket.id].username = msg.username;
    // copy the user from live users and add them to searching users
    searchingUsers[socket.id] = liveUsers[socket.id];
    // for every user in searching users
    for (let i in searchingUsers) {
      // check that the id's dont match
      if (searchingUsers[i].id != socket.id) {
        // remove both from searchingUsers object
        delete searchingUsers[i];
        delete searchingUsers[socket.id];
        //generate game name from both ids
        let roomName = i+""+socket.id;
        // create redirection object to let client know where to redirect and what room to go to
        let redirObj = {
          'to': 'gamePlay',
          'room': roomName
        }
        // send to both ids
        io.to(i).emit('x0_Game_Redirect', redirObj);
        io.to(socket.id).emit('x0_Game_Redirect', redirObj);
      }
    }
  });

  // user wants to move rooms
  socket.on('moveRooms', (msg)=>{
    console.log('room, move requested',msg)
    // add a new room to socket for acces to game stream
    socket.join(msg)
  })

  socket.on('gamePlay', (msg)=>{
    
  })

});


// weird functions / classes






const manageGame = (p1, p2) => {
  console.log('game started');

  let gameName = p1 + p2;
  let thisgame = new Game(p1, p2);
  liveGames[gameName] = { ...thisgame };
  // update games live
  let gameArr = Object.keys(liveGames);
  let gameCount = gameArr.length;
  io.emit("x0_Live_Games", gameCount);
  //emit initial game state
  io.to(p1.id).emit('x0_Game_Live', thisgame);
  io.to(p2.id).emit('x0_Game_Live', thisgame);

  io.on("game_move", (move) => {

  })







}









// run server


httpServer.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});