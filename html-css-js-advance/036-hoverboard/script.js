const board = document.getElementById('board');
const colorPicker = document.getElementById('colorPicker');
const sizeSlider = document.getElementById('sizeSlider');
const sizeValue = document.getElementById('sizeValue');
const clearBtn = document.getElementById('clearBtn');

let SQUARES = 400;
let GRID_SIZE = 20;
let currentColor = '#5cdb95';

// Create board
function createBoard() {
    board.innerHTML = '';
    board.style.gridTemplateColumns = `repeat(${GRID_SIZE}, 1fr)`;

    const squareSize = Math.floor(500 / GRID_SIZE);

    for (let i = 0; i < SQUARES; i++) {
        const square = document.createElement('div');
        square.classList.add('square');
        square.style.width = `${squareSize}px`;
        square.style.height = `${squareSize}px`;

        square.addEventListener('mouseover', () => setColor(square));
        square.addEventListener('mouseout', () => removeColor(square));

        // Touch support
        square.addEventListener('touchstart', (e) => {
            e.preventDefault();
            setColor(square);
        });

        board.appendChild(square);
    }
}

function setColor(element) {
    element.style.backgroundColor = currentColor;
    element.style.boxShadow = `0 0 10px ${currentColor}`;
}

function removeColor(element) {
    element.style.backgroundColor = '#2d2d2d';
    element.style.boxShadow = 'none';
}

function clearBoard() {
    const squares = document.querySelectorAll('.square');
    squares.forEach(square => {
        removeColor(square);
    });
}

// Color picker
colorPicker.addEventListener('input', (e) => {
    currentColor = e.target.value;
});

// Size slider
sizeSlider.addEventListener('input', (e) => {
    GRID_SIZE = +e.target.value;
    SQUARES = GRID_SIZE * GRID_SIZE;
    sizeValue.textContent = GRID_SIZE;
    createBoard();
});

// Clear button
clearBtn.addEventListener('click', clearBoard);

// Touch drag support
let isDrawing = false;

board.addEventListener('touchmove', (e) => {
    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    if (element && element.classList.contains('square')) {
        setColor(element);
    }
});

// Mouse drag support
board.addEventListener('mousedown', () => {
    isDrawing = true;
});

board.addEventListener('mouseup', () => {
    isDrawing = false;
});

board.addEventListener('mouseover', (e) => {
    if (isDrawing && e.target.classList.contains('square')) {
        setColor(e.target);
    }
});

// Init
createBoard();