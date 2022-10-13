import express from "express";
import http from "http";
import { WebSocketServer } from "ws";

const port = 8080;
const app = express();

app.use(express.static("public"));

const server = http.createServer(app);
const wss = new WebSocketServer({ noServer: true });

server.on("upgrade", (req, socket, head) => {
    console.log("Upgrade event client: ", req.headers);
    wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit("connection", ws, req);
    });
});

wss.on("connection", (ws) => {
    console.log("Number of connected clients: ", wss.clients.size);
    
    let connectedClients = {type: "clientsSize", size: wss.clients.size};
    wss.clients.forEach(client => {
        client.send(JSON.stringify(connectedClients));
    });

    ws.on("close", () => {
        console.log("Client disconnected");
        console.log("Number of remaining connected clients: ", wss.clients.size);
        
        connectedClients = {type: "clientsSize", size: wss.clients.size};
        wss.clients.forEach(client => {
            client.send(JSON.stringify(connectedClients));
        });
    });

    ws.on("message", (data) => {
       let message = JSON.parse(data);
       console.log(message);

        switch (message.type) {
            case "paint":
                wss.clients.forEach(client => {
                    if(client !== ws) {
                        client.send(JSON.stringify(message));
                    } 
                });
                break;

            case "textMessage":
                console.log(message)
                wss.clients.forEach(client => {
                    if(client !== ws) {
                        client.send(JSON.stringify(message));
                    } 
                });
                break;
        }
    });
});

server.listen(port, (req, res) => {
    console.log(`Express server (and http) running on port ${port}`);
});