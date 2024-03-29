// main server ( really needs cleaning and rearranging, go big or go bitching.. );

/*

multiplayer games that appeal to nostalgia and simplicity 


- all managed by a single node application
- best way for real time data transfer is socket.io, with it all being on one server it will be really useful as no weird port/routing shit needs to be done.




----- eventually have auth0 setup and have connection to a database to store player stats but wont be needed until at least 3 games are added


- make a default landing page that links to a page with nav, just use app.get('route', path.join(__dirname,'filename'));






- dont just skeleton the css and make it look nice
- make a few classes that can be reused many times


- work on 'modulization' split it up a bit.



*/

// port variable 
const port = 3000;

// game variables 
let liveUsers = {};
let liveGames = {};
let searchingUsers = {};


// imports
// built in node thing that allows to run console commands from within the script
const { exec } = require('child_process');
// express import
const express = require("express");
// createServer from http module , a bit obvious what its for
const { createServer } = require("http");
// sexy import to create a socket.io server
const { Server } = require("socket.io");
// imports path, allows easier path handling
const path = require('path');


// initialize express application
let app = express();

// config for express app
// set up as an api using text/json
app.use(express.json());
// work out what actually does, breaks without lmao
app.use(express.urlencoded({ extended: true }));
// monitoring start
app.use(require('express-status-monitor')());

// serving starts
// static serve files
app.use('/public', express.static(path.join(__dirname, '/public')));
// main website index page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/index.html'));
});
// wip for webhook, at least thats what i think its called
app.post('/refresh', (req) => {
  exec('git pull https://github.com/saucedontsauce/XOnode', (error, stdout, stderr) => {
    if(error){
      console.error(`git pull error: ${error}`);
    } else {
      exec('sudo reboot', (error, stdout, stderr) => {
        if(error){
          console.error(error);
        }
      })
    }   
  })
})
// root for some form of api in the future
app.get("/api", (req, res) => {
  res.status(200).send({
    success: true,
    message: "welcome to the beginning of greatness",
  });
});


//  create http server using the express app
const httpServer = createServer(app);

// create a websocket server using the http server
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});


// game mess starts 
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
  liveUsers[socket.id] = { ...socket };
  let idArr = Object.keys(liveUsers);
  let userCount = idArr.length;
  io.emit('x0_Live_Users', userCount);


  // when user diconnects or closes client
  socket.on('disconnect', () => {
    console.log('User has disconnected!')
  });
  socket.on('disconnecting', () => {
    console.log('user disconnecing', socket.id);
    delete searchingUsers[socket.id];
    delete liveUsers[socket.id];
    let idArr = Object.keys(liveUsers);
    let userCount = idArr.length;
    io.emit('x0_Live_Users', userCount);
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
    let usrArr = Object.keys(liveUsers);
    let userCount = usrArr.length;
    io.emit('x0_Live_Users', userCount);
  });
  // player is requesting the number of live games
  socket.on('req_games', () => {
    let gamesArr = Object.keys(liveGames);
    let gameCount = gamesArr.length;
    io.emit('x0_Live_Games', gameCount)
  });
  // user is wanting to search 
  socket.on("req_searching", (msg) => {
    liveUsers[socket.id].username = msg.username;
    searchingUsers[socket.id] = liveUsers[socket.id];
    for (let i in searchingUsers) {
      if (searchingUsers[i].id != socket.id) {
        delete searchingUsers[i];
        delete searchingUsers[socket.id];
        let roomName = i + "" + socket.id;
        let p1 = i, p2 = socket.id;
        let gameName = p1 + p2;
        let thisgame = new Game(liveUsers[p1], liveUsers[p2], gameName);
        liveGames[gameName] = { ...thisgame };
        let redirObj = {
          'to': 'gamePlay',
          'room': roomName,
          'game': thisgame
        };
        let gameArr = Object.keys(liveGames);
        gameCount = gameArr.length;
        io.emit('x0_Live_Games', gameCount);
        io.to(i).emit('x0_Game_Redirect', redirObj);
        io.to(socket.id).emit('x0_Game_Redirect', redirObj);
        io.to(gameName).emit('x0_Game_Init', liveGames[gameName]);
      }
    }
  });

  // user wants to move rooms
  socket.on('moveRooms', (msg) => {
    socket.join(msg)
  });

  socket.on('leaveRooms', () => {
    var rooms = [...socket.rooms];
    for (let i = 0; i < rooms.length; i++) {
      if (rooms[i] != socket.id) {
        socket.leave(rooms[i]);
      }
    }
    io.to(socket.id).emit('x0_Game_Redirect', { 'to': 'userLeftPage' })
  })

  socket.on('clientMoveMade', (msg) => {
    console.log('game move made');
    let gameField = msg.game.gameField;

    // big list of checks

    // verticals 3

    // horizontals 3

    // diag left

    // diag right

    // left vertical
    if (gameField[0][0] == gameField[0][1] && gameField[0][1] == gameField[0][2] && gameField[0][0] != "") {
      console.log('winner!!!');
      console.log('winner is', gameField[0][0]);
      let winnerSymbol = gameField[0][0];
      let winnerPackage = {
        sym: winnerSymbol,
        room: msg.game.gameRoom

      };
      if (gameField[0][0] == 'X') {
        winnerPackage.username = msg.game.xPlayerName;
      } else {
        winnerPackage.username = msg.game.oPlayerName;
      };
      io.to(msg.game.gameRoom).emit('x0_Game_Won', winnerPackage);
      delete liveGames[msg.game.gameRoom];
      let gameArr = Object.keys(liveGames);
      gameCount = gameArr.length;
      io.emit('x0_Live_Games', gameCount);
    };
    // middle vertical
    if (gameField[1][0] == gameField[1][1] && gameField[1][1] == gameField[1][2] && gameField[1][0] != "") {
      console.log('winner!!!');
      console.log('winner is', gameField[1][0]);
      let winnerSymbol = gameField[1][0];
      let winnerPackage = {
        sym: winnerSymbol,
        room: msg.game.gameRoom

      };
      if (gameField[1][0] == 'X') {
        winnerPackage.username = msg.game.xPlayerName;
      } else {
        winnerPackage.username = msg.game.oPlayerName;
      };
      io.to(msg.game.gameRoom).emit('x0_Game_Won', winnerPackage);
      delete liveGames[msg.game.gameRoom];
      let gameArr = Object.keys(liveGames);
      gameCount = gameArr.length;
      io.emit('x0_Live_Games', gameCount);
    };
    // right vertical
    if (gameField[2][0] == gameField[2][1] && gameField[2][1] == gameField[2][2] && gameField[2][0] != "") {
      console.log('winner!!!');
      console.log('winner is', gameField[2][0]);
      let winnerSymbol = gameField[2][0];
      let winnerPackage = {
        sym: winnerSymbol,
        room: msg.game.gameRoom

      };
      if (gameField[2][0] == 'X') {
        winnerPackage.username = msg.game.xPlayerName;
      } else {
        winnerPackage.username = msg.game.oPlayerName;
      };
      io.to(msg.game.gameRoom).emit('x0_Game_Won', winnerPackage);
      delete liveGames[msg.game.gameRoom];
      let gameArr = Object.keys(liveGames);
      gameCount = gameArr.length;
      io.emit('x0_Live_Games', gameCount);
    };

    // top horizon
    if (gameField[0][0] == gameField[1][0] && gameField[1][0] == gameField[2][0] && gameField[0][0] != "") {
      console.log('winner!!!');
      console.log('winner is', gameField[0][0]);
      let winnerSymbol = gameField[0][0];
      let winnerPackage = {
        sym: winnerSymbol,
        room: msg.game.gameRoom

      };
      if (gameField[0][0] == 'X') {
        winnerPackage.username = msg.game.xPlayerName;
      } else {
        winnerPackage.username = msg.game.oPlayerName;
      };
      io.to(msg.game.gameRoom).emit('x0_Game_Won', winnerPackage);
      delete liveGames[msg.game.gameRoom];
      let gameArr = Object.keys(liveGames);
      gameCount = gameArr.length;
      io.emit('x0_Live_Games', gameCount);
    };

    // middle horizon 
    if (gameField[0][1] == gameField[1][1] && gameField[1][1] == gameField[2][1] && gameField[0][1] != "") {
      console.log('winner!!!');
      console.log('winner is', gameField[0][1]);
      let winnerSymbol = gameField[0][1];
      let winnerPackage = {
        sym: winnerSymbol,
        room: msg.game.gameRoom

      };
      if (gameField[0][1] == 'X') {
        winnerPackage.username = msg.game.xPlayerName;
      } else {
        winnerPackage.username = msg.game.oPlayerName;
      };
      io.to(msg.game.gameRoom).emit('x0_Game_Won', winnerPackage);
      delete liveGames[msg.game.gameRoom];
      let gameArr = Object.keys(liveGames);
      gameCount = gameArr.length;
      io.emit('x0_Live_Games', gameCount);
    };
    // bottom horizon
    if (gameField[0][2] == gameField[1][2] && gameField[1][2] == gameField[2][2] && gameField[0][2] != "") {
      console.log('winner!!!');
      console.log('winner is', gameField[0][2]);
      let winnerSymbol = gameField[0][2];
      let winnerPackage = {
        sym: winnerSymbol,
        room: msg.game.gameRoom
      };
      if (gameField[0][2] == 'X') {
        winnerPackage.username = msg.game.xPlayerName;
      } else {
        winnerPackage.username = msg.game.oPlayerName;
      };
      io.to(msg.game.gameRoom).emit('x0_Game_Won', winnerPackage);
      delete liveGames[msg.game.gameRoom];
      let gameArr = Object.keys(liveGames);
      gameCount = gameArr.length;
      io.emit('x0_Live_Games', gameCount);
    };
    // left diag
    if (gameField[0][0] == gameField[1][1] && gameField[1][1] == gameField[2][2] && gameField[0][0] != "") {
      console.log('winner!!!');
      console.log('winner is', gameField[1][1]);
      let winnerSymbol = gameField[1][1];
      let winnerPackage = {
        sym: winnerSymbol,
        room: msg.game.gameRoom
      };
      if (gameField[1][1] == 'X') {
        winnerPackage.username = msg.game.xPlayerName;
      } else {
        winnerPackage.username = msg.game.oPlayerName;
      };
      io.to(msg.game.gameRoom).emit('x0_Game_Won', winnerPackage);
      delete liveGames[msg.game.gameRoom];
      let gameArr = Object.keys(liveGames);
      gameCount = gameArr.length;
      io.emit('x0_Live_Games', gameCount);
    };
    // right diag
    if (gameField[0][2] == gameField[1][1] && gameField[1][1] == gameField[2][0] && gameField[2][0] != "") {
      console.log('winner!!!');
      console.log('winner is', gameField[1][1]);
      let winnerSymbol = gameField[1][1];
      let winnerPackage = {
        sym: winnerSymbol,
        room: msg.game.gameRoom
      };
      if (gameField[1][1] == 'X') {
        winnerPackage.username = msg.game.xPlayerName;
      } else {
        winnerPackage.username = msg.game.oPlayerName;
      };
      io.to(msg.game.gameRoom).emit('x0_Game_Won', winnerPackage);
      delete liveGames[msg.game.gameRoom];
      let gameArr = Object.keys(liveGames);
      gameCount = gameArr.length;
      io.emit('x0_Live_Games', gameCount);
    };
    if (msg.game.winner == undefined) {
      console.log(gameField);
      io.to(msg.game.gameRoom).emit('x0_Game_Move', msg);
    }

  });

  socket.on('silentLeave', (msg)=>{
    console.log('room leave requested', msg);
    socket.leave(msg);
  })



});











// run server


httpServer.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});