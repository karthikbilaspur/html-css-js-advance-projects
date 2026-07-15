const board = document.getElementById('board');
const colorPicker = document.getElementById('colorPicker');
const sizeSlider = document.getElementById('sizeSlider');
const sizeValue = document.getElementById('sizeValue');
const clearBtn = document.getElementById('clearBtn');

let SQUARES = 400;
let GRID_SIZE = 20;
let currentColor = '#5cdb95';
let isDrawing = false;

// Create board
function createBoard() {
    board.innerHTML = '';
    board.style.gridTemplateColumns = `repeat(${GRID_SIZE}, 1fr)`;

    for (let i = 0; i < SQUARES; i++) {
        const square = document.createElement('div');
        square.classList.add('square');
        square.setAttribute('role', 'gridcell');
        square.setAttribute('tabindex', '0');
        square.setAttribute('aria-label', `Square ${i + 1}`);

        // Mouse events
        square.addEventListener('mouseover', () => setColor(square));
        square.addEventListener('mousedown', () => setColor(square));

        // Keyboard support
        square.addEventListener('keydown', (e) => {
            if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                setColor(square);
            }
        });

        // Touch support
        square.addEventListener('touchstart', (e) => {
            e.preventDefault();
            setColor(square);
        });

        board.appendChild(square);
    }
}

function setColor(element) {
    element.classList.add('active');
    element.style.backgroundColor = currentColor;
    element.style.boxShadow = `0 0 10px ${currentColor}, 0 0 20px ${currentColor}`;

    // Remove active class after a bit to trigger fade-out
    setTimeout(() => {
        element.classList.remove('active');
    }, 100);
}

function clearBoard() {
    const squares = document.querySelectorAll('.square');
    squares.forEach(square => {
        square.style.backgroundColor = '#2d2d2d';
        square.style.boxShadow = 'none';
        square.classList.remove('active');
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

// Mouse drag support
board.addEventListener('mousedown', (e) => {
    e.preventDefault();
    isDrawing = true;
});

board.addEventListener('mouseup', () => {
    isDrawing = false;
});

board.addEventListener('mouseleave', () => {
    isDrawing = false;
});

board.addEventListener('mouseover', (e) => {
    if (isDrawing && e.target.classList.contains('square')) {
        setColor(e.target);
    }
});

// Touch drag support
board.addEventListener('touchmove', (e) => {
    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    if (element && element.classList.contains('square')) {
        setColor(element);
    }
});

// Init
createBoard();