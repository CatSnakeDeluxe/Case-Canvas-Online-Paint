const websocket = new WebSocket("ws://localhost:8080");

const handleSocketOpen = (e) => {
    console.log('Socket has been opened');
    
};

const handleSocketMessage = (e) => {
    const message = JSON.parse(e.data);
    console.log("message", message);
    if (message.type === "paint") {
        paintToCanvas(message);
    }
};
  
websocket.onopen = handleSocketOpen;
websocket.onmessage = handleSocketMessage;

const canvas = document.getElementById('drawing-board');
const toolbar = document.getElementById('toolbar');
const ctx = canvas.getContext('2d');

const canvasOffsetX = canvas.offsetLeft;
const canvasOffsetY = canvas.offsetTop;

canvas.width = window.innerWidth - canvasOffsetX;
canvas.height = window.innerHeight - canvasOffsetY;

let isPainting = false;
let lineWidth = 5;
let startX;
let startY;

toolbar.addEventListener('click', (e) => {
    if (e.target.id === 'clear') {
        ctx.reset();
        // ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
});

toolbar.addEventListener('change', (e) => {
    if(e.target.id === 'stroke') {
        let strokeStyleVariable = e.target.value;
        ctx.strokeStyle = strokeStyleVariable;
    }

    if(e.target.id === 'lineWidth') {
        let lineWidthVariable = e.target.value;
        lineWidth = lineWidthVariable;
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

    // TODO send linewidth and color to paintObj
    // console.log("Client X: ", e.clientX - canvasOffsetX, "Client Y: ", e.clientY);
    let paintObj = {type: "paint", x: e.clientX - canvasOffsetX, y: e.clientY };
    websocket.send(JSON.stringify(paintObj));
    // websocket.send(e.clientX - canvasOffsetX, e.clientY);
}

canvas.addEventListener('mousedown', (e) => {
    isPainting = true;
    startX = e.clientX;
    startY = e.clientY;
});

canvas.addEventListener('mouseup', (e) => {
    isPainting = false;
    ctx.stroke();
    ctx.beginPath();
});

canvas.addEventListener('mousemove', paint);

function paintToCanvas(message) {
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.lineTo(message.x, message.y);
    ctx.stroke();
}