// variables
const socket = io()

let userCount = 0;
let gameCount = 0;
let thisGame;

// screenManagement
const showScreen = (targId, reqfunc) => {
    let allScreens = document.getElementsByClassName('gameView');
    let targeted = document.getElementById(targId);
    for (let i = 0; i < allScreens.length; i++) {
        let thisOne = allScreens[i];
        let test = thisOne.classList.contains('hidden');
        if (!test) {
            thisOne.classList.toggle('hidden');
        } else {

        };
    };
    targeted.classList.toggle('hidden');
    if (reqfunc) {
        reqfunc()
    }






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
    if(redirConits.room){
        socket.emit('moveRooms', redirConits.room)
    }
});


// game is live, receive and use game data
socket.on('x0_Game_Init', (msg) => {
    console.log('game init received');
    if (msg.xPlayerID == socket.id) {
        document.getElementById('whoAmI').textContent = 'X'
    };
    if (msg.oPlayerID == socket.id) {
        document.getElementById('whoAmI').textContent = 'O';
    };
    console.log('game symbol has been set')

});




// opponent disconnected
socket.on('x0_Game_Left', (msg)=>{
    console.log('opponent left the game');
    socket.emit('leaveRooms', 'plz')
})


const startSearch = () => {
    let thisUsrName = localStorage.getItem('username');
    socket.emit('req_searching', thisUsr);
    console.log("%s searching", thisUsrName);
}




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
}

const playerWins = (winner) => {
    document.getElementById('winnerDisp').textContent = winner;
    document.getElementById('winnerBanner').style.display = 'flex';
}

const moveMade = ({ coord, symb }) => {
    let targ = document.getElementById(coord);
    targ.innerHTML = symb;
}


window.onload = resizegrid;
window.onresize = resizegrid;


const handlePlayClick = (e) => {
    moveMade(e.target.id, "X")

}




