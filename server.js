const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const path = require('path');




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



class Game {
  constructor(p1, p2, room) {
    console.log(p1);
    console.log(p2);
    this.gameRoom = room;
    this.xPlayerID = p1.id;
    this.oPlayerID = p2.id;
    this.xPlayerName = p1.username;
    this.oPlayerName = p2.username;
    this.whosTurn = this.xPlayerID;
    this.lastTurn = {
      'pos': undefined,
      'sym': undefined
    }
    this.winner = undefined;
    this.gameField = [
      ["", "", ""],
      ["", "", ""],
      ["", "", ""]
    ];
  }
};



io.on("connection", (socket) => {
  // create a new property for this connection in the liveUsers object
  liveUsers[socket.id] = { ...socket };
  // calculate length of the live user object and then emit
  let idArr = Object.keys(liveUsers);
  let userCount = idArr.length;
  io.emit('x0_Live_Users', userCount);


  // when user diconnects or closes client
  socket.on('disconnect', () => {

  });

  socket.on('disconnecting', () => {
    console.log('user disconnecing', socket.id);
    // delete this person from searchingUsers 
    delete searchingUsers[socket.id]
    // delete this connection from liveUsers 
    delete liveUsers[socket.id];
    // calculate length of the live user object and then emit
    let idArr = Object.keys(liveUsers);
    let userCount = idArr.length;
    io.emit('x0_Live_Users', userCount);
    // remove from all rooms and then make a call to those rooms to tell them someone left
    console.log('user disconnecting')
    let rooms = [...socket.rooms];
    console.log(socket.id, 'rooms = ', rooms)
    for (let i = 0; i < rooms.length; i++) {
      if (rooms[i] != socket.id) {
        socket.to(rooms[i]).emit('x0_Game_Left', "User Left The game");
        delete liveGames[rooms[i]];
        console.log('game ended due to disconnection');
        let gamearr = Object.keys(liveGames);
        gameCount = gamearr.length;
        io.emit('x0_Live_Games', gameCount);
      }
    };
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
        let roomName = i + "" + socket.id;
        // make new game object
        let p1 = i;
        let p2 = socket.id;
        let gameName = p1 + p2;
        let thisgame = new Game(liveUsers[p1], liveUsers[p2], gameName);
        liveGames[gameName] = { ...thisgame };
        // create redirection object to let client know where to redirect and what room to go to
        let redirObj = {
          'to': 'gamePlay',
          'room': roomName,
          'game': thisgame
        };
        
        // calc length and then emit
        let gameArr = Object.keys(liveGames);
        gameCount = gameArr.length;
        io.emit('x0_Live_Games', gameCount)

        // send to both ids
        io.to(i).emit('x0_Game_Redirect', redirObj);
        io.to(socket.id).emit('x0_Game_Redirect', redirObj);


        // emit game initial state
        console.log('emit,',liveGames[gameName])
        io.to(gameName).emit('x0_Game_Init', liveGames[gameName]);


      }
    }
  });

  socket.on('gameState', (msg) => {
    console.log(msg)
  });




  // user wants to move rooms
  socket.on('moveRooms', (msg) => {
    socket.join(msg)
  });

  socket.on('leaveRooms', ()=>{
    var rooms = [...socket.rooms];
    for(let i=0; i<rooms.length;i++){
      if(rooms[i] != socket.id){
        socket.leave(rooms[i]);
      }
    }
    io.to(socket.id).emit('x0_Game_Redirect', {'to':'userLeftPage'})
  })

  socket.on('clientMoveMade', (msg)=>{
    console.log('game move made');
    io.to(msg.game.gameRoom).emit('x0_Game_Move', msg);
  })

});














// run server


httpServer.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});