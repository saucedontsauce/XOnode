 // socket callers and listeners
 const socket = io()

 let userCount = 0;
let gameCount = 0;

 socket.on('x0_Live_Users', (msg) => {
     console.log(msg);
     userCount = msg ; 
     let displaylist = document.getElementsByClassName('userCount');
     for(let i=0; i<displaylist.length; i++){
         displaylist[i].textContent = userCount;
     };
 });

 socket.on('X0_Live_Games', (msg)=>{
    console.log(msg);
    gameCount = msg ; 
    let displaylist = document.getElementsByClassName('gameCount');
    for(let i=0; i<displaylist.length; i++){
        displaylist[i].textContent = gameCount
    }
 })

 const startSearch = () => {
    let thisUsrName = localStorage.getItem('username');
    socket.emit('req_searching', thisUsr);
    console.log("%s searching", thisUsrName);
 }