const express = require('express');
const socket = require("socket.io");

const app = express();
const port = 8080

// app.get('/',(req,res)=>res.send('hello world'))
app.use(express.static(__dirname + '/build'))
app.get('/', (req, res, next) => {
    res.sendFile(__dirname + '/build/index.html')
})

const server = app.listen(port, () => console.log(`Example app`))
const io = socket(server);

io.on("connection", (socket) => {
    console.log("A user Connected", socket.id);

    // listen for user diconnection
    socket.on("disconnect", () =>
        console.log("A user disconnected", socket.id)
    );
});