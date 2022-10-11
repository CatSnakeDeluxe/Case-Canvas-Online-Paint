const websocket = new WebSocket("ws://localhost:8080");

const clientSize = document.getElementById("clientSize");
const canvas = document.getElementById("drawing-board");
const toolbar = document.getElementById("toolbar");
const shapesToolbar = document.getElementById("shapesToolbar");
const fillColour = document.getElementById("fillColour");
const ctx = canvas.getContext("2d");

const canvasOffsetX = canvas.offsetLeft;
const canvasOffsetY = canvas.offsetTop;

canvas.width = window.innerWidth - canvasOffsetX;
canvas.height = window.innerHeight - canvasOffsetY;

let isPainting = false;
let lineWidth = 5;
let startX;
let startY;

toolbar.addEventListener("click", (e) => {
    switch (e.target.id) {
        case "clear":
            ctx.reset();
            break;
        case "square":
            console.log("square square");
            paintRect();
            break;

        case "circle":
            console.log("circle circle");
            paintCircle();
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

const paintRect = (e) => {
    if (!fillColour.checked) {
        // creating circle according to the mouse pointer
        ctx.strokeRect(20, 20, 150, 100);
    } else {
        ctx.fillRect(20, 20, 150, 100);
    }
}

const paintCircle = (e) => {
    if (!fillColour.checked) {
        ctx.beginPath();
        ctx.arc(100, 75, 50, 0, 2 * Math.PI);
        ctx.stroke();
    } else {
        ctx.beginPath();
        ctx.arc(100, 75, 50, 0, 2 * Math.PI);
        ctx.fill();
    }

    // ctx.beginPath();
    // let radius = Math.sqrt(Math.pow((4 - 2), 2) + Math.pow((prevMouseY - e.offsetY), 2));
    // ctx.arc(prevMouseX, prevMouseY, radius, 0, 2 * Math.PI); // creating circle according to the mouse pointer
    // fillColour.checked ? ctx.fill() : ctx.stroke(); // if fillColor is checked fill circle else draw border circle
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

    if (message.type === "paint") {
        paintToCanvas(message);
    }

    else {
        clientSize.innerText = message;
    }
};
  
websocket.onopen = handleSocketOpen;
websocket.onmessage = handleSocketMessage;