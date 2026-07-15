// JavaScript for Code 83 - Cleaned
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

// Save to localStorage
function saveToStorage() {
    const pixelData = pixels.map(p => rgbToHex(p.style.backgroundColor));
    localStorage.setItem('pixelArt', JSON.stringify({
        gridSize,
        pixels: pixelData
    }));
}

// Load from localStorage
function loadFromStorage() {
    const saved = localStorage.getItem('pixelArt');
    if (saved) {
        const data = JSON.parse(saved);
        gridSize = data.gridSize;
        gridSizeSelect.value = gridSize;
        createGrid(gridSize, false);
        data.pixels.forEach((color, i) => {
            if (pixels[i]) pixels[i].style.backgroundColor = color;
        });
        return true;
    }
    return false;
}

// Initialize grid
function createGrid(size, shouldSave = true) {
    gridSize = size;
    gridEl.innerHTML = '';
    gridEl.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    gridEl.style.gridTemplateRows = `repeat(${size}, 1fr)`;

    const pixelSize = Math.min(480 / size, 24);
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

        pixel.addEventListener('mousedown', handlePixelDown);
        pixel.addEventListener('mouseenter', handlePixelEnter);
        pixel.addEventListener('mousemove', updateCoords);
        pixel.addEventListener('touchstart', handleTouchStart, { passive: false });
        pixel.addEventListener('touchmove', handleTouchMove, { passive: false });
        pixel.addEventListener('contextmenu', e => e.preventDefault()); // Enable right-click erase

        gridEl.appendChild(pixel);
        pixels.push(pixel);
    }

    canvasInfo.textContent = `${size} × ${size} pixels`;
    if (showGrid) gridEl.classList.add('show-grid');
    if (shouldSave) saveToStorage();
}

// Convert RGB to Hex - handles both formats
function rgbToHex(color) {
    if (color.startsWith('#')) return color.toLowerCase();
    const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (!match) return '#ffffff';
    const r = parseInt(match[1]).toString(16).padStart(2, '0');
    const g = parseInt(match[2]).toString(16).padStart(2, '0');
    const b = parseInt(match[3]).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`.toLowerCase();
}

// Get pixel color as hex
function getPixelColor(x, y) {
    const index = y * gridSize + x;
    return rgbToHex(pixels[index]?.style.backgroundColor || '#ffffff');
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

// Paint pixel based on tool
function paintPixel(pixel, button = 0) {
    const x = parseInt(pixel.dataset.x);
    const y = parseInt(pixel.dataset.y);
    const useErase = button === 2 || currentTool === 'erase'; // Right click = erase

    if (currentTool === 'draw' &&!useErase) {
        pixel.style.backgroundColor = currentColor;
    } else if (useErase) {
        pixel.style.backgroundColor = '#ffffff';
    } else if (currentTool === 'fill') {
        const targetColor = rgbToHex(pixel.style.backgroundColor);
        floodFill(x, y, targetColor, currentColor);
    } else if (currentTool === 'eyedropper') {
        currentColor = rgbToHex(pixel.style.backgroundColor);
        colorPicker.value = currentColor;
        updateActiveSwatch();
    }
}

// Mouse events
function handlePixelDown(e) {
    e.preventDefault();
    isDrawing = true;
    paintPixel(e.target, e.button);
    if (currentTool!== 'eyedropper') saveToStorage();
}

function handlePixelEnter(e) {
    if (!isDrawing) return;
    paintPixel(e.target);
}

// Touch events for mobile
function handleTouchStart(e) {
    e.preventDefault();
    isDrawing = true;
    const touch = e.touches[0];
    const pixel = document.elementFromPoint(touch.clientX, touch.clientY);
    if (pixel && pixel.classList.contains('pixel')) {
        paintPixel(pixel);
    }
}

function handleTouchMove(e) {
    e.preventDefault();
    if (!isDrawing) return;
    const touch = e.touches[0];
    const pixel = document.elementFromPoint(touch.clientX, touch.clientY);
    if (pixel && pixel.classList.contains('pixel')) {
        paintPixel(pixel);
    }
}

function updateCoords(e) {
    const pixel = e.target;
    if (pixel.classList.contains('pixel')) {
        hoverCoords.textContent = `X: ${pixel.dataset.x}, Y: ${pixel.dataset.y}`;
    }
}

// Update active swatch
function updateActiveSwatch() {
    swatches.forEach(s => {
        s.classList.toggle('active', s.dataset.color.toLowerCase() === currentColor.toLowerCase());
    });
}

// Event listeners
document.addEventListener('mouseup', () => {
    if (isDrawing) saveToStorage();
    isDrawing = false;
});

document.addEventListener('touchend', () => {
    if (isDrawing) saveToStorage();
    isDrawing = false;
});

document.addEventListener('mouseleave', () => {
    isDrawing = false;
});

colorPicker.addEventListener('input', (e) => {
    currentColor = e.target.value.toLowerCase();
    updateActiveSwatch();
});

swatches.forEach(swatch => {
    swatch.addEventListener('click', () => {
        currentColor = swatch.dataset.color.toLowerCase();
        colorPicker.value = currentColor;
        updateActiveSwatch();
    });
});

gridSizeSelect.addEventListener('change', (e) => {
    const newSize = parseInt(e.target.value);
    if (newSize === gridSize) return;

    if (confirm('Change grid size? This will clear your art.')) {
        createGrid(newSize);
    } else {
        gridSizeSelect.value = gridSize; // Reset if cancelled
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
        saveToStorage();
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
        ctx.fillStyle = rgbToHex(pixel.style.backgroundColor);
        ctx.fillRect(x, y, 1, 1);
    });

    const link = document.createElement('a');
    link.download = `pixel-art-${gridSize}x${gridSize}.png`;
    link.href = canvas.toDataURL();
    link.click();
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT') return; // Don't trigger when typing in color picker
    if (e.key === 'b' || e.key === 'B') drawBtn.click();
    if (e.key === 'e' || e.key === 'E') eraseBtn.click();
    if (e.key === 'g' || e.key === 'G') fillBtn.click();
    if (e.key === 'i' || e.key === 'I') eyedropperBtn.click();
});

// Init
if (!loadFromStorage()) {
    createGrid(16);
}
updateActiveSwatch();