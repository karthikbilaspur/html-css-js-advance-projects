// JavaScript for Code 83
const gridEl = document.getElementById('pixel-grid');
const colorPicker = document.getElementById('color-picker');
const gridSizeSelect = document.getElementById('grid-size');
const drawBtn = document.getElementById('draw-btn');
const eraseBtn = document.getElementById('erase-btn');
const fillBtn = document.getElementById('fill-btn');
const eyedropperBtn = document.getElementById('eyedropper-btn');
const gridToggleBtn = document.getElementById('grid-toggle');
const clearBtn = document.getElementById('clear-btn');
const exportBtn = document.getElementById('export-btn');
const canvasInfo = document.getElementById('canvas-info');
const hoverCoords = document.getElementById('hover-coords');
const swatches = document.querySelectorAll('.color-swatch');

let gridSize = 16;
let currentColor = '#e94560';
let currentTool = 'draw';
let isDrawing = false;
let showGrid = true;
let pixels = [];

// Initialize grid
function createGrid(size) {
    gridSize = size;
    gridEl.innerHTML = '';
    gridEl.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    gridEl.style.gridTemplateRows = `repeat(${size}, 1fr)`;

    const pixelSize = Math.min(400 / size, 24);
    gridEl.style.width = `${pixelSize * size}px`;
    gridEl.style.height = `${pixelSize * size}px`;

    pixels = [];

    for (let i = 0; i < size * size; i++) {
        const pixel = document.createElement('div');
        pixel.className = 'pixel';
        pixel.dataset.index = i;
        pixel.dataset.x = i % size;
        pixel.dataset.y = Math.floor(i / size);
        pixel.style.backgroundColor = '#ffffff';

        pixel.addEventListener('mousedown', handlePixelClick);
        pixel.addEventListener('mouseenter', handlePixelEnter);
        pixel.addEventListener('mousemove', updateCoords);

        gridEl.appendChild(pixel);
        pixels.push(pixel);
    }

    canvasInfo.textContent = `${size} × ${size} pixels`;
    if (showGrid) gridEl.classList.add('show-grid');
}

// Get pixel color
function getPixelColor(x, y) {
    const index = y * gridSize + x;
    return pixels[index]?.style.backgroundColor || 'rgb(255, 255, 255)';
}

// Set pixel color
function setPixelColor(x, y, color) {
    const index = y * gridSize + x;
    if (pixels[index]) {
        pixels[index].style.backgroundColor = color;
    }
}

// Flood fill algorithm
function floodFill(startX, startY, targetColor, fillColor) {
    if (targetColor === fillColor) return;

    const stack = [[startX, startY]];
    const visited = new Set();

    while (stack.length > 0) {
        const [x, y] = stack.pop();
        const key = `${x},${y}`;

        if (x < 0 || x >= gridSize || y < 0 || y >= gridSize || visited.has(key)) {
            continue;
        }

        const currentColor = getPixelColor(x, y);
        if (currentColor!== targetColor) {
            continue;
        }

        visited.add(key);
        setPixelColor(x, y, fillColor);

        stack.push([x + 1, y]);
        stack.push([x - 1, y]);
        stack.push([x, y + 1]);
        stack.push([x, y - 1]);
    }
}

// Handle pixel click
function handlePixelClick(e) {
    const pixel = e.target;
    const x = parseInt(pixel.dataset.x);
    const y = parseInt(pixel.dataset.y);

    if (currentTool === 'draw') {
        isDrawing = true;
        pixel.style.backgroundColor = currentColor;
    } else if (currentTool === 'erase') {
        isDrawing = true;
        pixel.style.backgroundColor = '#ffffff';
    } else if (currentTool === 'fill') {
        const targetColor = pixel.style.backgroundColor;
        floodFill(x, y, targetColor, currentColor);
    } else if (currentTool === 'eyedropper') {
        currentColor = rgbToHex(pixel.style.backgroundColor);
        colorPicker.value = currentColor;
        updateActiveSwatch();
    }
}

function handlePixelEnter(e) {
    if (!isDrawing) return;

    const pixel = e.target;
    if (currentTool === 'draw') {
        pixel.style.backgroundColor = currentColor;
    } else if (currentTool === 'erase') {
        pixel.style.backgroundColor = '#ffffff';
    }
}

function updateCoords(e) {
    const pixel = e.target;
    if (pixel.classList.contains('pixel')) {
        hoverCoords.textContent = `X: ${pixel.dataset.x}, Y: ${pixel.dataset.y}`;
    }
}

// Convert RGB to Hex
function rgbToHex(rgb) {
    if (rgb.startsWith('#')) return rgb;
    const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (!match) return '#000000';
    const r = parseInt(match[1]).toString(16).padStart(2, '0');
    const g = parseInt(match[2]).toString(16).padStart(2, '0');
    const b = parseInt(match[3]).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
}

// Update active swatch
function updateActiveSwatch() {
    swatches.forEach(s => {
        s.classList.toggle('active', s.dataset.color === currentColor);
    });
}

// Event listeners
document.addEventListener('mouseup', () => {
    isDrawing = false;
});

document.addEventListener('mouseleave', () => {
    isDrawing = false;
});

colorPicker.addEventListener('input', (e) => {
    currentColor = e.target.value;
    updateActiveSwatch();
});

swatches.forEach(swatch => {
    swatch.addEventListener('click', () => {
        currentColor = swatch.dataset.color;
        colorPicker.value = currentColor;
        updateActiveSwatch();
    });
});

gridSizeSelect.addEventListener('change', (e) => {
    if (confirm('Change grid size? This will clear your art.')) {
        createGrid(parseInt(e.target.value));
    }
});

[drawBtn, eraseBtn, fillBtn, eyedropperBtn].forEach(btn => {
    btn.addEventListener('click', () => {
        [drawBtn, eraseBtn, fillBtn, eyedropperBtn].forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentTool = btn.id.replace('-btn', '');
    });
});

gridToggleBtn.addEventListener('click', () => {
    showGrid =!showGrid;
    gridEl.classList.toggle('show-grid', showGrid);
});

clearBtn.addEventListener('click', () => {
    if (confirm('Clear all pixels?')) {
        pixels.forEach(p => p.style.backgroundColor = '#ffffff');
    }
});

exportBtn.addEventListener('click', () => {
    const canvas = document.createElement('canvas');
    canvas.width = gridSize;
    canvas.height = gridSize;
    const ctx = canvas.getContext('2d');

    pixels.forEach((pixel, i) => {
        const x = i % gridSize;
        const y = Math.floor(i / gridSize);
        ctx.fillStyle = pixel.style.backgroundColor;
        ctx.fillRect(x, y, 1, 1);
    });

    const link = document.createElement('a');
    link.download = `pixel-art-${gridSize}x${gridSize}.png`;
    link.href = canvas.toDataURL();
    link.click();
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'b') drawBtn.click();
    if (e.key === 'e') eraseBtn.click();
    if (e.key === 'g') fillBtn.click();
    if (e.key === 'i') eyedropperBtn.click();
});

// Init
createGrid(16);
updateActiveSwatch();