// const websocket = new WebSocket("ws://localhost:8080");

const trimSlashes = str => str.split('/').filter(v => v !== '').join('/');
const baseURL = trimSlashes(window.location.href.split("//")[1]);
const protocol = 'wss';
const websocket = new WebSocket(`${protocol}://${baseURL}`);

const clientSize = document.getElementById("clientSize");
const canvas = document.getElementById("drawingBoard");
const toolbar = document.getElementById("toolbar");
const canvasContainer = document.getElementById("canvasContainer");
const fillColour = document.getElementById("fillColour");
const ctx = canvas.getContext("2d");
const saveImgBtn = document.getElementById("saveImg");
const messageBox = document.getElementById("messageBox");
const chatMessages = document.getElementById("chatMessages");
const chatButton = document.getElementById("chatButton");

const canvasOffsetX = canvas.offsetLeft;
const canvasOffsetY = canvas.offsetTop;

canvas.width = window.innerWidth - canvasOffsetX;
canvas.height = window.innerHeight - canvasOffsetY;

ctx.fillStyle = 'white';
ctx.fillRect(0, 0, canvas.width, canvas.height);

let isPainting = false;
let lineWidth = 5;
let startX;
let startY;

toolbar.addEventListener("click", (e) => {
    switch (e.target.id) {
        case "clear":
            ctx.reset();
            break;
    }
});

toolbar.addEventListener("change", (e) => {
    // console.log(e.target.value)
    if (e.target.id === "stroke") {
        console.log("color: ", e.target.value);
        ctx.strokeStyle = e.target.value;
    }

    if (e.target.id === "lineWidth") {
        lineWidth = e.target.value;
    }
});

const paint = (e) => {
    if(!isPainting) {
        return;
    }

    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.lineTo(e.clientX - canvasOffsetX, e.clientY);
    ctx.stroke();

    console.log("Client X:" , e.clientX - canvasOffsetX, "Client Y:", e.clientY);
    let paintObj = {type: "paint", lineWidth: lineWidth, colour: ctx.strokeStyle, x: e.clientX - canvasOffsetX, y: e.clientY };
 
    websocket.send(JSON.stringify(paintObj));
}

canvas.addEventListener("mousedown", (e) => {
    isPainting = true;
    startX = e.clientX;
    startY = e.clientY;
});

canvas.addEventListener("mouseup", () => {
    isPainting = false;
    ctx.stroke();
    ctx.beginPath();
});

canvas.addEventListener("mousemove", paint);

function paintToCanvas(message) {
    
    ctx.lineWidth = message.lineWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.strokeStyle = message.colour;
    ctx.lineTo(message.x, message.y);
    ctx.stroke();
    ctx.beginPath();
};

const handleSocketOpen = (e) => {
    console.log("Socket has been opened");
};

const handleSocketMessage = (e) => {
    const message = JSON.parse(e.data);
    // console.log("message", message);

    switch (message.type) {
        case "paint":
            paintToCanvas(message);
            break;

         case "clientsSize":
            clientSize.innerText = message.size;
            break;

        case "textMessage":
            renderMessage(message);
            break;
    }
};
  
websocket.onopen = handleSocketOpen;
websocket.onmessage = handleSocketMessage;

messageBox.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && messageBox.value.length > 0) {
        let textMessage = { type: "textMessage", msg: messageBox.value, backgroundColour: "#bf81f5" };
        renderMessage(textMessage);
        websocket.send(JSON.stringify(textMessage));
        messageBox.value = "";
    }
});

chatButton.addEventListener("click", (e) => {
    if (messageBox.value.length > 0) {
        let textMessage = { type: "textMessage", msg: messageBox.value, backgroundColour: "#ac75dc" };
        renderMessage(textMessage);
        websocket.send(JSON.stringify(textMessage));
        messageBox.value = "";
    }
});

function renderMessage(textMessage) {
    console.log("textMessage: ", textMessage);
    let newMessage = document.createElement("p");
    newMessage.classList.add("chatMessage");
    newMessage.innerText = textMessage.msg;
    newMessage.style.background = textMessage.backgroundColour;
    chatMessages.prepend(newMessage);
}

saveImgBtn.addEventListener('click', function() {
    console.log(canvas.toDataURL());
    const link = document.createElement('a');
    link.download = 'download.png';
    link.href = canvas.toDataURL();
    link.click();
    link.delete;
  });