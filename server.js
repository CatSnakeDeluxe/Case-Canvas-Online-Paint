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
    // start websocket
    wss.handleUpgrade(req, socket, head, (ws) => {
        console.log("let user use websocket...");

        wss.emit("connection", ws, req);
    });
});

wss.on("connection", (ws) => {
    console.log("New client connection from IP: ", ws._socket.remoteAddress);
    console.log("Number of connected clients: ", wss.clients.size);

    ws.on("close", () => {
        console.log("Client disconnected");
        console.log("Number of remaining connected clients: ", wss.clients.size);
    });

    ws.on("message", (data) => {

    });
});

server.listen(port, (req, res) => {
    console.log(`Express server (and http) running on port ${port}`);
});