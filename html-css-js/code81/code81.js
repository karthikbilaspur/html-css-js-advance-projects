const canvas = document.getElementById('canvas');
const previewCanvas = document.getElementById('preview-canvas');
const ctx = canvas.getContext('2d');
const previewCtx = previewCanvas.getContext('2d');

const colorPicker = document.getElementById('color-picker');
const brushSizeSlider = document.getElementById('brush-size');
const sizeDisplay = document.getElementById('size-display');
const brushBtn = document.getElementById('brush-tool');
const eraserBtn = document.getElementById('eraser-tool');
const lineBtn = document.getElementById('line-tool');
const rectBtn = document.getElementById('rect-tool');
const circleBtn = document.getElementById('circle-tool');
const undoBtn = document.getElementById('undo-btn');
const redoBtn = document.getElementById('redo-btn');
const clearBtn = document.getElementById('clear-btn');
const saveBtn = document.getElementById('save-btn');
const coordsEl = document.getElementById('coords');
const canvasSizeEl = document.getElementById('canvas-size');
const presets = document.querySelectorAll('.preset');

// State
let isDrawing = false;
let currentTool = 'brush';
let currentColor = '#e94560';
let currentSize = 5;
let startX, startY;
let lastX, lastY; // for touchend
let history = [];
let historyStep = -1;

// Canvas setup
function resizeCanvas() {
    // Save current drawing before resize
    let savedDrawing = null;
    if (canvas.width > 0 && canvas.height > 0) {
        savedDrawing = canvas.toDataURL();
    }

    const wrapper = canvas.parentElement;
    const maxWidth = Math.min(800, wrapper.clientWidth - 40);
    const maxHeight = 600;

    canvas.width = maxWidth;
    canvas.height = maxHeight;
    previewCanvas.width = maxWidth;
    previewCanvas.height = maxHeight;

    canvasSizeEl.textContent = `${maxWidth} × ${maxHeight}`;

    // Restore white background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Restore drawing if there was one
    if (savedDrawing) {
        const img = new Image();
        img.onload = () => {
            ctx.drawImage(img, 0, 0);
        };
        img.src = savedDrawing;
    }
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Save state for undo/redo
function saveState() {
    historyStep++;
    if (historyStep < history.length) {
        history.length = historyStep;
    }
    history.push(canvas.toDataURL());
    updateUndoRedoButtons();
}

function undo() {
    if (historyStep > 0) {
        historyStep--;
        restoreState();
    }
}

function redo() {
    if (historyStep < history.length - 1) {
        historyStep++;
        restoreState();
    }
}

function restoreState() {
    const img = new Image();
    img.src = history[historyStep];
    img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        updateUndoRedoButtons();
    };
}

function updateUndoRedoButtons() {
    undoBtn.disabled = historyStep <= 0;
    redoBtn.disabled = historyStep >= history.length - 1;
}

// Drawing functions
function startDrawing(e) {
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    startX = e.clientX - rect.left;
    startY = e.clientY - rect.top;
    lastX = startX;
    lastY = startY;

    if (currentTool === 'brush' || currentTool === 'eraser') {
        ctx.beginPath();
        ctx.moveTo(startX, startY);
    }
}

function draw(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    lastX = x;
    lastY = y;
    updateCoords(x, y);

    if (!isDrawing) return;

    ctx.lineWidth = currentSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (currentTool === 'brush') {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = currentColor;
        ctx.lineTo(x, y);
        ctx.stroke();
    } else if (currentTool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = 'rgba(0,0,0,1)';
        ctx.lineTo(x, y);
        ctx.stroke();
    } else if (currentTool === 'line') {
        previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
        previewCtx.beginPath();
        previewCtx.moveTo(startX, startY);
        previewCtx.lineTo(x, y);
        previewCtx.strokeStyle = currentColor;
        previewCtx.lineWidth = currentSize;
        previewCtx.lineCap = 'round';
        previewCtx.stroke();
    } else if (currentTool === 'rect') {
        previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
        previewCtx.strokeStyle = currentColor;
        previewCtx.lineWidth = currentSize;
        previewCtx.strokeRect(startX, startY, x - startX, y - startY);
    } else if (currentTool === 'circle') {
        previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
        const radius = Math.sqrt(Math.pow(x - startX, 2) + Math.pow(y - startY, 2));
        previewCtx.beginPath();
        previewCtx.arc(startX, startY, radius, 0, Math.PI * 2);
        previewCtx.strokeStyle = currentColor;
        previewCtx.lineWidth = currentSize;
        previewCtx.stroke();
    }
}

function stopDrawing(e) {
    if (!isDrawing) return;
    isDrawing = false;

    // Use lastX/lastY for touchend which has no coords
    const x = lastX;
    const y = lastY;

    ctx.globalCompositeOperation = 'source-over';
    ctx.lineWidth = currentSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (currentTool === 'line') {
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(x, y);
        ctx.strokeStyle = currentColor;
        ctx.stroke();
    } else if (currentTool === 'rect') {
        ctx.strokeStyle = currentColor;
        ctx.strokeRect(startX, startY, x - startX, y - startY);
    } else if (currentTool === 'circle') {
        const radius = Math.sqrt(Math.pow(x - startX, 2) + Math.pow(y - startY, 2));
        ctx.beginPath();
        ctx.arc(startX, startY, radius, 0, Math.PI * 2);
        ctx.strokeStyle = currentColor;
        ctx.stroke();
    }

    previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
    saveState();
}

function updateCoords(x, y) {
    // Clamp coords to canvas bounds for display
    const clampedX = Math.max(0, Math.min(Math.round(x), canvas.width));
    const clampedY = Math.max(0, Math.min(Math.round(y), canvas.height));
    coordsEl.textContent = `X: ${clampedX}, Y: ${clampedY}`;
}

// Touch support
function getTouchPos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
        clientX: e.touches[0].clientX,
        clientY: e.touches[0].clientY
    };
}

// Event listeners
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseleave', stopDrawing);

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = getTouchPos(e);
    startDrawing(touch);
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = getTouchPos(e);
    draw(touch);
});

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    stopDrawing(e);
});

// Color picker
colorPicker.addEventListener('input', (e) => {
    currentColor = e.target.value;
    document.querySelectorAll('.preset').forEach(p => p.classList.remove('active'));
});

// Color presets
presets.forEach(preset => {
    preset.addEventListener('click', () => {
        currentColor = preset.dataset.color;
        colorPicker.value = currentColor;
        document.querySelectorAll('.preset').forEach(p => p.classList.remove('active'));
        preset.classList.add('active');
    });
});

// Brush size
brushSizeSlider.addEventListener('input', (e) => {
    currentSize = e.target.value;
    sizeDisplay.textContent = currentSize;
});

// Tools
function setTool(tool) {
    currentTool = tool;
    document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`${tool}-tool`).classList.add('active');

    canvas.style.cursor = tool === 'eraser'? 'grab' : 'crosshair';
}

brushBtn.addEventListener('click', () => setTool('brush'));
eraserBtn.addEventListener('click', () => setTool('eraser'));
lineBtn.addEventListener('click', () => setTool('line'));
rectBtn.addEventListener('click', () => setTool('rect'));
circleBtn.addEventListener('click', () => setTool('circle'));

// Undo/Redo
undoBtn.addEventListener('click', undo);
redoBtn.addEventListener('click', redo);

document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') {
            e.preventDefault();
            undo();
        }
        if (e.key === 'y') {
            e.preventDefault();
            redo();
        }
    }
});

// Clear
clearBtn.addEventListener('click', () => {
    if (confirm('Clear canvas?')) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        saveState();
    }
});

// Save
saveBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = `drawing-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
});

// Init
ctx.fillStyle = 'white';
ctx.fillRect(0, 0, canvas.width, canvas.height);
saveState();
setTool('brush');