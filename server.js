import express from "express";
import http from "http";
import { WebSocketServer } from "ws";

const port = 8080;
const app = express();

app.use(express.static("public"));

const server = http.createServer(app);
const wss = new WebSocketServer({ port: 8081 });

server.on("upgrade", (req, socket, head) => {
    console.log("Upgrade event client: ", req.headers);
    wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit("connection", ws, req);
    });
});

wss.on("connection", (ws) => {
    console.log("Number of connected clients: ", wss.clients.size);
    let connectedClients = wss.clients.size;
    // ws.send(connectedClients);
    console.log(connectedClients);

    ws.on("close", () => {
        console.log("Client disconnected");
        console.log("Number of remaining connected clients: ", wss.clients.size);
    });

    ws.on("message", (data) => {
        // console.log("Message received: ", data); 
       let obj = JSON.parse(data);
       console.log(obj);
            wss.clients.forEach(client => {
                if(client !== ws) {
                    client.send(JSON.stringify(obj));
                } 
            });
    });
});

server.listen(port, (req, res) => {
    console.log(`Express server (and http) running on port ${port}`);
});