
// variables
const socket = io()

let userCount = 0;
let gameCount = 0;
let thisGame;
let thisSymbol;

// screenManagement
const showScreen = (targId, reqfunc) => {
    let allScreens = document.getElementsByClassName('gameView');
    let targeted = document.getElementById(targId);
    for (let i = 0; i < allScreens.length; i++) {
        let thisOne = allScreens[i];
        let test = thisOne.classList.contains('hidden');
        if (!test) {
            thisOne.classList.add('hidden');
        } else {

        };
    };
    targeted.classList.remove('hidden');
    if (reqfunc) {
        reqfunc()
    };
};


// player maker



class gameUser {
    constructor() {
        this.id = socket.id;
        this.username = "imAuser";
        this.inGame = false;
        this.game = null;
        this.runChecks()
    }
    runChecks() {
        let storedUsername = localStorage.getItem('username');
        if (storedUsername) {
            console.log('username previously used:', storedUsername);
            this.username = storedUsername;
        }
    }

}


let thisUsr = new gameUser


// socket callers and listeners
socket.on('x0_Live_Users', (msg) => {
    userCount = msg;
    let displaylist = document.getElementsByClassName('userCount');
    for (let i = 0; i < displaylist.length; i++) {
        displaylist[i].textContent = userCount;
    };
});

socket.on('x0_Live_Games', (msg) => {
    console.log("live games", msg)
    let displaylist = document.getElementsByClassName('gameCount');
    for (let i = 0; i < displaylist.length; i++) {
        displaylist[i].textContent = msg;
    };
});

// redirect to the game screen, resize the grid and then join the group
socket.on("x0_Game_Redirect", (msg) => {
    let redirConits = msg
    showScreen(`${redirConits.to}`)
    resizegrid()
    console.log(msg)

    thisGame = msg.game;
    if (redirConits.game) {
        if (redirConits.game.xPlayerID == socket.id) {
            thisSymbol = 'X'
            document.getElementById('whoAmI').textContent = thisSymbol;
            console.log('game symbol has been set')
        } else {
            thisSymbol = 'O';
            document.getElementById('whoAmI').textContent = thisSymbol;
            console.log('game symbol has been set')
        }
    };
    if (redirConits.room) {
        socket.emit('moveRooms', redirConits.room);
    }
});
// listener for when opponent disconnected
socket.on('x0_Game_Left', (msg) => {
    console.log('opponent left the game');
    socket.emit('leaveRooms', 'plz');
})
// function to request starting searching 
const startSearch = () => {
    let thisUsrName = localStorage.getItem('username');
    socket.emit('req_searching', thisUsr);
    console.log("%s searching", thisUsrName);
}

// function to resize the gameplay grid
const resizegrid = () => {
    let grid = document.getElementById('gameGrid');
    let childarr = grid.children;
    grid.height = grid.offsetWidth
    let celldim = grid.offsetWidth / 3
    for (let i = 0; i < childarr.length; i++) {
        let rowid = i + "";
        let thisRow = document.getElementById(rowid)
        thisRow.style.height = celldim + "px";
        for (let j = 0; j < thisRow.children.length; j++) {
            let thiscellid = i + "" + j;
            let thiscell = document.getElementById(thiscellid);
            thisRow.children[j].style.width = celldim + "px";
            thisRow.children[j].style.height = celldim + "px";
        }
    }
};

const moveMade = (coord, symb) => {
    let targ = document.getElementById(coord);
    targ.textContent = symb;
};

// game move made listener
socket.on('x0_Game_Move', (msg) => {
    console.log('someone made a move', msg);
    thisGame = msg.game;
    if (thisGame.lastTurn.sym == thisGame.oPlayerID) {
        moveMade(thisGame.lastTurn.pos, 'O');
    } else if (thisGame.lastTurn.sym == thisGame.xPlayerID) {
        moveMade(thisGame.lastTurn.pos, 'X');
    };
});

// game winner

socket.on('x0_Game_Won', (msg) => {
    console.log('winner');
    showScreen('winnerPage', () => {
        document.getElementById('winnerSymbol').textContent = msg.sym;
        document.getElementById('winnerName').textContent = msg.username;
    });
    socket.emit('silentLeave', thisGame.gameRoom);
    thisGame = null;
});


// event handlers
const gameClickHandle = (pos) => {
    if (thisGame.whosTurn == socket.id) {
        let coord = pos.split('')
        if (thisGame.gameField[coord[1]][coord[0]] == '') {
            thisGame.gameField[coord[1]][coord[0]] = thisSymbol;
            thisGame.lastTurn.pos = pos
            if (thisSymbol == 'X') {
                thisGame.whosTurn = thisGame.oPlayerID;
                thisGame.lastTurn.sym = thisGame.xPlayerID;
            } else {
                thisGame.whosTurn = thisGame.xPlayerID;
                thisGame.lastTurn.sym = thisGame.oPlayerID;
            }
            socket.emit('clientMoveMade', { 'status': 'Live', 'game': thisGame });
        } else {
            window.alert('Symbol already here')
        }

    } else {
        window.alert('Not Your Turn');
    }

};


window.onload = resizegrid;
window.onresize = resizegrid;
