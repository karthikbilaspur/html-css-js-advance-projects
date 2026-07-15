const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
const colorPicker = document.getElementById('colorPicker');
const brushSize = document.getElementById('brushSize');
const sizeDisplay = document.getElementById('sizeDisplay');
const clearBtn = document.getElementById('clearBtn');
const eraserBtn = document.getElementById('eraserBtn');

let isDrawing = false;
let isErasing = false;

// Set canvas size + white background
function initCanvas() {
  if (window.innerWidth < 850) {
    canvas.width = window.innerWidth * 0.9;
    canvas.height = window.innerHeight * 0.6;
  } else {
    canvas.width = 800;
    canvas.height = 500;
  }

  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

initCanvas();
window.addEventListener('resize', () => {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  initCanvas();
  ctx.putImageData(imageData, 0, 0);
});

// Update brush size display
brushSize.addEventListener('input', () => {
  sizeDisplay.textContent = brushSize.value;
});

// Get correct mouse/touch position
function getPosition(e) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  let clientX, clientY;
  if (e.touches && e.touches.length > 0) {
    clientX = e.touches[0].clientX;
    clientY = e.touches[0].clientY;
  } else {
    clientX = e.clientX;
    clientY = e.clientY;
  }

  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY
  };
}

// Mouse events
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

// Touch events
canvas.addEventListener('touchstart', handleTouch, { passive: false });
canvas.addEventListener('touchmove', handleTouch, { passive: false });
canvas.addEventListener('touchend', stopDrawing);

function startDrawing(e) {
  isDrawing = true;
  const pos = getPosition(e);
  ctx.beginPath();
  ctx.moveTo(pos.x, pos.y);
}

function draw(e) {
  if (!isDrawing) return;
  e.preventDefault();

  const pos = getPosition(e);

  ctx.lineWidth = brushSize.value;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = isErasing? 'white' : colorPicker.value;

  ctx.lineTo(pos.x, pos.y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(pos.x, pos.y);
}

function stopDrawing() {
  isDrawing = false;
  ctx.beginPath();
}

function handleTouch(e) {
  e.preventDefault();
  if (e.type === 'touchstart') {
    startDrawing(e);
  } else if (e.type === 'touchmove') {
    draw(e);
  }
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
    eraserBtn.classList.add('active');
    eraserBtn.textContent = 'Brush';
    canvas.style.cursor = 'cell';
  } else {
    eraserBtn.classList.remove('active');
    eraserBtn.textContent = 'Eraser';
    canvas.style.cursor = 'crosshair';
  }
});

// Switch to brush when color changes
colorPicker.addEventListener('input', () => {
  if (isErasing) {
    isErasing = false;
    eraserBtn.classList.remove('active');
    eraserBtn.textContent = 'Eraser';
    canvas.style.cursor = 'crosshair';
  }
});

console.log('Drawing App loaded - KarthikCodingSolutions ⚡ Canvas API + Touch');