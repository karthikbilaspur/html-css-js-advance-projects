const canvas = document.getElementById('maze-canvas');
const ctx = canvas.getContext('2d');
const gridSizeSelect = document.getElementById('grid-size');
const speedSlider = document.getElementById('speed');
const speedDisplay = document.getElementById('speed-display');
const generateBtn = document.getElementById('generate-btn');
const solveBtn = document.getElementById('solve-btn');
const clearBtn = document.getElementById('clear-btn');
const animateCheckbox = document.getElementById('animate');
const cellCountEl = document.getElementById('cell-count');
const stepCountEl = document.getElementById('step-count');
const pathLengthEl = document.getElementById('path-length');

let cols = 20;
let rows = 20;
let cellSize = 20;
let grid = [];
let stack = [];
let current;
let steps = 0;
let animating = false;
let solutionPath = [];
let speed = 50;

// Cell class
class Cell {
    constructor(i, j) {
        this.i = i;
        this.j = j;
        this.walls = [true, true, true, true]; // top, right, bottom, left
        this.visited = false;
        this.inSolution = false;
    }

    // Get unvisited neighbors
    getNeighbors() {
        const neighbors = [];
        const top = grid[index(this.i, this.j - 1)];
        const right = grid[index(this.i + 1, this.j)];
        const bottom = grid[index(this.i, this.j + 1)];
        const left = grid[index(this.i - 1, this.j)];

        if (top &&!top.visited) neighbors.push(top);
        if (right &&!right.visited) neighbors.push(right);
        if (bottom &&!bottom.visited) neighbors.push(bottom);
        if (left &&!left.visited) neighbors.push(left);

        return neighbors;
    }

    // Highlight current cell
    highlight() {
        const x = this.i * cellSize;
        const y = this.j * cellSize;
        ctx.fillStyle = '#667eea';
        ctx.fillRect(x, y, cellSize, cellSize);
    }

    // Show cell
    show() {
        const x = this.i * cellSize;
        const y = this.j * cellSize;

        // Draw visited cell
        if (this.visited) {
            ctx.fillStyle = '#43e97b';
            ctx.fillRect(x, y, cellSize, cellSize);
        }

        // Draw solution path
        if (this.inSolution) {
            ctx.fillStyle = '#e94560';
            ctx.fillRect(x, y, cellSize, cellSize);
        }

        // Draw walls
        ctx.strokeStyle = '#1a1a2e';
        ctx.lineWidth = 2;

        if (this.walls[0]) {
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + cellSize, y);
            ctx.stroke();
        }
        if (this.walls[1]) {
            ctx.beginPath();
            ctx.moveTo(x + cellSize, y);
            ctx.lineTo(x + cellSize, y + cellSize);
            ctx.stroke();
        }
        if (this.walls[2]) {
            ctx.beginPath();
            ctx.moveTo(x + cellSize, y + cellSize);
            ctx.lineTo(x, y + cellSize);
            ctx.stroke();
        }
        if (this.walls[3]) {
            ctx.beginPath();
            ctx.moveTo(x, y + cellSize);
            ctx.lineTo(x, y);
            ctx.stroke();
        }
    }
}

// Get index in 1D array
function index(i, j) {
    if (i < 0 || j < 0 || i > cols - 1 || j > rows - 1) return -1;
    return i + j * cols;
}

// Remove walls between cells
function removeWalls(a, b) {
    const x = a.i - b.i;
    if (x === 1) {
        a.walls[3] = false;
        b.walls[1] = false;
    } else if (x === -1) {
        a.walls[1] = false;
        b.walls[3] = false;
    }

    const y = a.j - b.j;
    if (y === 1) {
        a.walls[0] = false;
        b.walls[2] = false;
    } else if (y === -1) {
        a.walls[2] = false;
        b.walls[0] = false;
    }
}

// Setup grid
function setupGrid() {
    cols = parseInt(gridSizeSelect.value);
    rows = parseInt(gridSizeSelect.value);

    const maxSize = 600;
    cellSize = Math.floor(maxSize / cols);

    canvas.width = cols * cellSize;
    canvas.height = rows * cellSize;

    grid = [];
    stack = [];
    steps = 0;
    solutionPath = [];

    for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
            grid.push(new Cell(i, j));
        }
    }

    current = grid[0];
    current.visited = true;

    cellCountEl.textContent = cols * rows;
    stepCountEl.textContent = '0';
    pathLengthEl.textContent = '—';

    drawMaze();
}

// Draw entire maze
function drawMaze() {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let cell of grid) {
        cell.show();
    }

    // Draw start and end
    ctx.fillStyle = '#4facfe';
    ctx.fillRect(2, 2, cellSize - 4, cellSize - 4);
    ctx.fillStyle = '#f093fb';
    ctx.fillRect((cols - 1) * cellSize + 2, (rows - 1) * cellSize + 2, cellSize - 4, cellSize - 4);
}

// DFS Maze Generation Algorithm
function generateMaze() {
    if (animating) return;

    animating = true;
    generateBtn.disabled = true;
    solveBtn.disabled = true;
    steps = 0;

    const doAnimate = animateCheckbox.checked;

    function step() {
        steps++;
        stepCountEl.textContent = steps;

        current.visited = true;
        current.highlight();

        const neighbors = current.getNeighbors();

        if (neighbors.length > 0) {
            const next = neighbors[Math.floor(Math.random() * neighbors.length)];
            stack.push(current);
            removeWalls(current, next);
            current = next;
        } else if (stack.length > 0) {
            current = stack.pop();
        }

        drawMaze();

        if (stack.length > 0 || current.getNeighbors().length > 0) {
            if (doAnimate) {
                setTimeout(step, 101 - speed);
            } else {
                step();
            }
        } else {
            // Maze complete
            animating = false;
            generateBtn.disabled = false;
            solveBtn.disabled = false;
            drawMaze();
        }
    }

    step();
}

// Solve maze using DFS
async function solveMaze() {
    if (animating) return;

    solveBtn.disabled = true;
    solutionPath = [];

    // Reset solution flags
    grid.forEach(cell => cell.inSolution = false);

    const start = grid[0];
    const end = grid[grid.length - 1];
    const path = [];
    const visited = new Set();

    function dfs(cell) {
        if (cell === end) {
            path.push(cell);
            return true;
        }

        visited.add(cell);
        path.push(cell);

        // Check neighbors (no walls)
        const neighbors = [];
        if (!cell.walls[0]) neighbors.push(grid[index(cell.i, cell.j - 1)]);
        if (!cell.walls[1]) neighbors.push(grid[index(cell.i + 1, cell.j)]);
        if (!cell.walls[2]) neighbors.push(grid[index(cell.i, cell.j + 1)]);
        if (!cell.walls[3]) neighbors.push(grid[index(cell.i - 1, cell.j)]);

        for (let neighbor of neighbors) {
            if (neighbor &&!visited.has(neighbor)) {
                if (dfs(neighbor)) {
                    return true;
                }
            }
        }

        path.pop();
        return false;
    }

    dfs(start);

    // Animate solution
    solutionPath = path;
    pathLengthEl.textContent = path.length;

    if (animateCheckbox.checked) {
        for (let i = 0; i < path.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 20));
            path[i].inSolution = true;
            drawMaze();
        }
    } else {
        path.forEach(cell => cell.inSolution = true);
        drawMaze();
    }

    solveBtn.disabled = false;
}

// Clear maze
function clearMaze() {
    animating = false;
    setupGrid();
    solveBtn.disabled = true;
}

// Event listeners
generateBtn.addEventListener('click', () => {
    setupGrid();
    generateMaze();
});

solveBtn.addEventListener('click', solveMaze);
clearBtn.addEventListener('click', clearMaze);

gridSizeSelect.addEventListener('change', setupGrid);

speedSlider.addEventListener('input', (e) => {
    speed = parseInt(e.target.value);
    speedDisplay.textContent = speed + 'ms';
});

// Initialize
setupGrid();