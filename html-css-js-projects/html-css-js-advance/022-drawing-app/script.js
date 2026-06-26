const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
const colorPicker = document.getElementById('colorPicker');
const brushSize = document.getElementById('brushSize');
const sizeDisplay = document.getElementById('sizeDisplay');
const clearBtn = document.getElementById('clearBtn');
const eraserBtn = document.getElementById('eraserBtn');

let isDrawing = false;
let isErasing = false;
let lastColor = '#000000';

// Set initial canvas background to white
ctx.fillStyle = 'white';
ctx.fillRect(0, 0, canvas.width, canvas.height);

// Update brush size display
brushSize.addEventListener('input', () => {
    sizeDisplay.textContent = brushSize.value;
});

// Start drawing
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

// Touch support for mobile
canvas.addEventListener('touchstart', handleTouch);
canvas.addEventListener('touchmove', handleTouch);
canvas.addEventListener('touchend', stopDrawing);

function startDrawing(e) {
    isDrawing = true;
    draw(e);
}

function draw(e) {
    if (!isDrawing) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;

    ctx.lineWidth = brushSize.value;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (isErasing) {
        ctx.strokeStyle = 'white';
    } else {
        ctx.strokeStyle = colorPicker.value;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
}

function stopDrawing() {
    isDrawing = false;
    ctx.beginPath();
}

function handleTouch(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent(e.type === 'touchstart'? 'mousedown' : 'mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
}

// Clear canvas
clearBtn.addEventListener('click', () => {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
});

// Toggle eraser
eraserBtn.addEventListener('click', () => {
    isErasing =!isErasing;
    if (isErasing) {
        lastColor = colorPicker.value;
        eraserBtn.classList.add('active');
        eraserBtn.textContent = 'Brush';
        canvas.style.cursor = 'cell';
    } else {
        eraserBtn.classList.remove('active');
        eraserBtn.textContent = 'Eraser';
        canvas.style.cursor = 'crosshair';
    }
});

// Switch back to brush when color changes
colorPicker.addEventListener('input', () => {
    if (isErasing) {
        isErasing = false;
        eraserBtn.classList.remove('active');
        eraserBtn.textContent = 'Eraser';
        canvas.style.cursor = 'crosshair';
    }
});