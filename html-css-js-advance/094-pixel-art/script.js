const pixelCanvas = document.getElementById('pixelCanvas');
const ctx = pixelCanvas.getContext('2d');
const previewCanvas = document.getElementById('previewCanvas');
const previewCtx = previewCanvas.getContext('2d');

const colorPicker = document.getElementById('colorPicker');
const palette = document.getElementById('palette');
const sizeSelect = document.getElementById('sizeSelect');
const clearBtn = document.getElementById('clearBtn');
const gridBtn = document.getElementById('gridBtn');
const savePngBtn = document.getElementById('savePngBtn');
const saveDataBtn = document.getElementById('saveDataBtn');
const toolBtns = document.querySelectorAll('.tool-btn');

const canvasSizeEl = document.getElementById('canvasSize');
const zoomLevelEl = document.getElementById('zoomLevel');
const currentToolEl = document.getElementById('currentTool');

let gridSize = 16;
let pixelSize = 20;
let currentColor = '#000000';
let currentTool = 'brush';
let isDrawing = false;
let showGrid = true;

// 2D array from 2048 - stores pixel colors
let pixels = [];

const DEFAULT_PALETTE = [
  '#000000', '#FFFFFF', '#FF0000', '#00FF00',
  '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
  '#808080', '#800000', '#008000', '#000080',
  '#808000', '#800080', '#008080', '#C0C0C0'
];

function initCanvas() {
  gridSize = parseInt(sizeSelect.value);
  pixelSize = Math.floor(Math.min(640, 640) / gridSize);

  pixelCanvas.width = gridSize * pixelSize;
  pixelCanvas.height = gridSize * pixelSize;

  pixels = Array(gridSize).fill().map(() => Array(gridSize).fill('#FFFFFF'));

  canvasSizeEl.textContent = `${gridSize}x${gridSize}`;
  zoomLevelEl.textContent = `${pixelSize}x`;

  draw();
  updatePreview();
}

function initPalette() {
  palette.innerHTML = '';
  DEFAULT_PALETTE.forEach(color => {
    const swatch = document.createElement('div');
    swatch.className = 'palette-color';
    swatch.style.background = color;
    swatch.addEventListener('click', () => {
      currentColor = color;
      colorPicker.value = color;
    });
    palette.appendChild(swatch);
  });
}

function draw() {
  ctx.clearRect(0, 0, pixelCanvas.width, pixelCanvas.height);

  // Draw pixels
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      ctx.fillStyle = pixels[y][x];
      ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
    }
  }

  // Draw grid
  if (showGrid) {
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;
    for (let i = 0; i <= gridSize; i++) {
      ctx.beginPath();
      ctx.moveTo(i * pixelSize, 0);
      ctx.lineTo(i * pixelSize, gridSize * pixelSize);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i * pixelSize);
      ctx.lineTo(gridSize * pixelSize, i * pixelSize);
      ctx.stroke();
    }
  }
}

function updatePreview() {
  previewCtx.clearRect(0, 0, 128, 128);
  const scale = 128 / gridSize;

  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      previewCtx.fillStyle = pixels[y][x];
      previewCtx.fillRect(x * scale, y * scale, scale, scale);
    }
  }
}

function getPixelCoords(e) {
  const rect = pixelCanvas.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left) / pixelSize);
  const y = Math.floor((e.clientY - rect.top) / pixelSize);
  return { x, y };
}

function paintPixel(x, y) {
  if (x < 0 || x >= gridSize || y < 0 || y >= gridSize) return;

  if (currentTool === 'brush') {
    pixels[y][x] = currentColor;
  } else if (currentTool === 'eraser') {
    pixels[y][x] = '#FFFFFF';
  } else if (currentTool === 'fill') {
    floodFill(x, y, pixels[y][x], currentColor);
  } else if (currentTool === 'eyedropper') {
    currentColor = pixels[y][x];
    colorPicker.value = currentColor;
  }

  draw();
  updatePreview();
}

// CONCEPT: Flood fill from Minesweeper recursion
function floodFill(x, y, targetColor, replacementColor) {
  if (targetColor === replacementColor) return;
  if (x < 0 || x >= gridSize || y < 0 || y >= gridSize) return;
  if (pixels[y][x]!== targetColor) return;

  pixels[y][x] = replacementColor;

  floodFill(x + 1, y, targetColor, replacementColor);
  floodFill(x - 1, y, targetColor, replacementColor);
  floodFill(x, y + 1, targetColor, replacementColor);
  floodFill(x, y - 1, targetColor, replacementColor);
}

// Mouse events
pixelCanvas.addEventListener('mousedown', (e) => {
  isDrawing = true;
  const { x, y } = getPixelCoords(e);
  paintPixel(x, y);
});

pixelCanvas.addEventListener('mousemove', (e) => {
  if (!isDrawing || currentTool === 'fill') return;
  const { x, y } = getPixelCoords(e);
  paintPixel(x, y);
});

pixelCanvas.addEventListener('mouseup', () => {
  isDrawing = false;
});

pixelCanvas.addEventListener('mouseleave', () => {
  isDrawing = false;
});

// Tool selection
toolBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    toolBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentTool = btn.dataset.tool;
    currentToolEl.textContent = btn.textContent.trim();
  });
});

colorPicker.addEventListener('input', (e) => {
  currentColor = e.target.value;
});

sizeSelect.addEventListener('change', () => {
  if (confirm('Changing size will clear canvas. Continue?')) {
    initCanvas();
  } else {
    sizeSelect.value = gridSize;
  }
});

clearBtn.addEventListener('click', () => {
  if (confirm('Clear canvas?')) {
    pixels = Array(gridSize).fill().map(() => Array(gridSize).fill('#FFFFFF'));
    draw();
    updatePreview();
  }
});

gridBtn.addEventListener('click', () => {
  showGrid =!showGrid;
  draw();
});

savePngBtn.addEventListener('click', () => {
  // Create temp canvas at actual size without grid
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = gridSize;
  tempCanvas.height = gridSize;
  const tempCtx = tempCanvas.getContext('2d');

  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      tempCtx.fillStyle = pixels[y][x];
      tempCtx.fillRect(x, y, 1, 1);
    }
  }

  const link = document.createElement('a');
  link.download = `pixel-art-${gridSize}x${gridSize}.png`;
  link.href = tempCanvas.toDataURL();
  link.click();
});

saveDataBtn.addEventListener('click', () => {
  const data = JSON.stringify(pixels);
  navigator.clipboard.writeText(data);
  alert('Pixel data copied to clipboard!');
});

// Init
initPalette();
initCanvas();