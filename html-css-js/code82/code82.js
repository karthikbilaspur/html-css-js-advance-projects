// JavaScript for Code 82
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true });
const brushTool = document.getElementById('brush-tool');
const fillTool = document.getElementById('fill-tool');
const eraserTool = document.getElementById('eraser-tool');
const colorPicker = document.getElementById('color-picker');
const brushSize = document.getElementById('brush-size');
const sizeDisplay = document.getElementById('size-display');
const toleranceSlider = document.getElementById('tolerance');
const toleranceDisplay = document.getElementById('tolerance-display');
const undoBtn = document.getElementById('undo-btn');
const clearBtn = document.getElementById('clear-btn');
const downloadBtn = document.getElementById('download-btn');
const cursor = document.getElementById('cursor');

let currentTool = 'brush';
let isDrawing = false;
let currentColor = '#e94560';
let currentSize = 10;
let tolerance = 10;
let undoStack = [];
const MAX_UNDO = 20;

// Initialize canvas
ctx.fillStyle = 'white';
ctx.fillRect(0, 0, canvas.width, canvas.height);
saveState();

// Tool selection
[brushTool, fillTool, eraserTool].forEach(btn => {
    btn.addEventListener('click', () => {
        [brushTool, fillTool, eraserTool].forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentTool = btn.id.replace('-tool', '');
        canvas.style.cursor = currentTool === 'fill'? 'crosshair' : 'none';
    });
});

// Controls
colorPicker.addEventListener('input', (e) => {
    currentColor = e.target.value;
});

brushSize.addEventListener('input', (e) => {
    currentSize = e.target.value;
    sizeDisplay.textContent = e.target.value + 'px';
});

toleranceSlider.addEventListener('input', (e) => {
    tolerance = parseInt(e.target.value);
    toleranceDisplay.textContent = tolerance;
});

// Brush drawing
function startDraw(e) {
    isDrawing = true;
    const pos = getMousePos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
}

function draw(e) {
    if (!isDrawing || currentTool === 'fill') return;

    const pos = getMousePos(e);

    ctx.lineWidth = currentSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (currentTool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
    } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = currentColor;
    }

    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
}

function endDraw() {
    if (isDrawing) {
        isDrawing = false;
        ctx.beginPath();
        saveState();
    }
}

// Flood fill algorithm - scanline
function floodFill(startX, startY, fillColor) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const width = canvas.width;
    const height = canvas.height;

    const startPos = (startY * width + startX) * 4;
    const startR = data[startPos];
    const startG = data[startPos + 1];
    const startB = data[startPos + 2];
    const startA = data[startPos + 3];

    const fillR = parseInt(fillColor.substr(1, 2), 16);
    const fillG = parseInt(fillColor.substr(3, 2), 16);
    const fillB = parseInt(fillColor.substr(5, 2), 16);

    // If target color same as fill color, return
    if (colorsMatch(startR, startG, startB, startA, fillR, fillG, fillB, 255, 0)) {
        return;
    }

    const stack = [[startX, startY]];
    const visited = new Set();

    while (stack.length > 0) {
        const [x, y] = stack.pop();
        const key = `${x},${y}`;

        if (x < 0 || x >= width || y < 0 || y >= height || visited.has(key)) {
            continue;
        }

        const pos = (y * width + x) * 4;
        const r = data[pos];
        const g = data[pos + 1];
        const b = data[pos + 2];
        const a = data[pos + 3];

        if (!colorsMatch(r, g, b, a, startR, startG, startB, startA, tolerance)) {
            continue;
        }

        visited.add(key);

        // Fill pixel
        data[pos] = fillR;
        data[pos + 1] = fillG;
        data[pos + 2] = fillB;
        data[pos + 3] = 255;

        // Add neighbors
        stack.push([x + 1, y]);
        stack.push([x - 1, y]);
        stack.push([x, y + 1]);
        stack.push([x, y - 1]);
    }

    ctx.putImageData(imageData, 0, 0);
}

function colorsMatch(r1, g1, b1, a1, r2, g2, b2, a2, tol) {
    return Math.abs(r1 - r2) <= tol &&
           Math.abs(g1 - g2) <= tol &&
           Math.abs(b1 - b2) <= tol &&
           Math.abs(a1 - a2) <= tol;
}

// Mouse events
canvas.addEventListener('mousedown', (e) => {
    const pos = getMousePos(e);

    if (currentTool === 'fill') {
        saveState();
        floodFill(Math.floor(pos.x), Math.floor(pos.y), currentColor);
        saveState();
    } else {
        startDraw(e);
    }
});

canvas.addEventListener('mousemove', (e) => {
    const pos = getMousePos(e);
    updateCursor(e, pos);

    if (currentTool === 'brush' || currentTool === 'eraser') {
        draw(e);
    }
});

canvas.addEventListener('mouseup', endDraw);
canvas.addEventListener('mouseleave', () => {
    endDraw();
    cursor.style.display = 'none';
});

canvas.addEventListener('mouseenter', () => {
    if (currentTool!== 'fill') {
        cursor.style.display = 'block';
    }
});

function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: (e.clientX - rect.left) * (canvas.width / rect.width),
        y: (e.clientY - rect.top) * (canvas.height / rect.height)
    };
}

function updateCursor(e, pos) {
    if (currentTool === 'fill') {
        cursor.style.display = 'none';
        return;
    }

    cursor.style.display = 'block';
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
    cursor.style.width = currentSize + 'px';
    cursor.style.height = currentSize + 'px';
}

// Undo/Redo
function saveState() {
    if (undoStack.length >= MAX_UNDO) {
        undoStack.shift();
    }
    undoStack.push(canvas.toDataURL());
    undoBtn.disabled = undoStack.length <= 1;
}

function undo() {
    if (undoStack.length > 1) {
        undoStack.pop();
        const img = new Image();
        img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
        };
        img.src = undoStack[undoStack.length - 1];
        undoBtn.disabled = undoStack.length <= 1;
    }
}

function clearCanvas() {
    if (confirm('Clear canvas?')) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        saveState();
    }
}

function downloadCanvas() {
    const link = document.createElement('a');
    link.download = 'painting.png';
    link.href = canvas.toDataURL();
    link.click();
}

// Event listeners
undoBtn.addEventListener('click', undo);
clearBtn.addEventListener('click', clearCanvas);
downloadBtn.addEventListener('click', downloadCanvas);

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') {
            e.preventDefault();
            undo();
        }
    }
    if (e.key === 'b') brushTool.click();
    if (e.key === 'g') fillTool.click();
    if (e.key === 'e') eraserTool.click();
});