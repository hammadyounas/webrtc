const express = require('express');
const socket = require("socket.io");
const { connect } = require('socket.io-client');

const app = express();
const port = 8080

// app.get('/',(req,res)=>res.send('hello world'))
app.use(express.static(__dirname + '/build'))
app.get('/', (req, res, next) => {
    res.sendFile(__dirname + '/build/index.html')
})

const server = app.listen(port, () => console.log(`Example app`))
const io = socket(server);

// keep a reference of all socket connections
let connectedPeers = new Map()


io.on("connection", (socket) => {
    console.log("A user Connected", socket.id);
    connectedPeers.set(socket.id, socket)

    // listen for user diconnection
    socket.on("disconnect", () =>{
        console.log("A user disconnected", socket.id);
        connectedPeers.delete(socket.id);
    });

    socket.on('offerOrAnswer', (data) => {
        // send to the other peer(s) if any
        for (const [socketID, socket] of connectedPeers.entries()) {
            // don't send to self
            if (socketID !== data.socketID) {
                console.log(socketID, data.payload.type)
                socket.emit('offerOrAnswer', data.payload)
            }
        }
    })

    socket.on('candidate', (data) => {
        // send candidate to the other peer(s) if any
        for (const [socketID, socket] of connectedPeers.entries()) {
            // don't send to self
            if (socketID !== data.socketID) {
                console.log(socketID, data.payload)
                socket.emit('candidate', data.payload)
            }
        }
    })
});