 // socket callers and listeners
 const socket = io()

 let userCount = 0;

 socket.on('x0_Live_Users', (msg) => {
     console.log(msg);
     userCount = msg
     let displaylist = document.getElementsByClassName('userCount');
     for(let i=0; i<displaylist.length; i++){
         displaylist[i].textContent = userCount;
     };
 })
