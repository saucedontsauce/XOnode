const ws = require('ws');
const http = require('http');
const app = express();

const server = http.createServer(app);
const wss = new ws.Server({server})
let users = {};

ws.on('connection', (sock)=>{
    console.log(sock)
    sock.send(sock)
})
