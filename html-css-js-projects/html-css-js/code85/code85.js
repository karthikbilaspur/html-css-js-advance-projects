const gridEl = document.getElementById('grid');
const startBtn = document.getElementById('start-btn');
const clearPathBtn = document.getElementById('clear-path-btn');
const clearWallsBtn = document.getElementById('clear-walls-btn');
const randomMazeBtn = document.getElementById('random-maze-btn');
const speedSelect = document.getElementById('speed');
const algoSelect = document.getElementById('algorithm');
const diagonalCheck = document.getElementById('diagonal');
const weightsCheck = document.getElementById('weights');
const nodesVisitedEl = document.getElementById('nodes-visited');
const pathLengthEl = document.getElementById('path-length');
const timeElapsedEl = document.getElementById('time-elapsed');
const algoNameEl = document.getElementById('algo-name');

const ROWS = 25;
const COLS = 50;

let grid = [];
let startNode = { row: 10, col: 10 };
let endNode = { row: 10, col: 40 };
let mouseDown = false;
let currentDragNode = null;
let isRunning = false;

// Node structure
class Node {
    constructor(row, col) {
        this.row = row;
        this.col = col;
        this.isWall = false;
        this.isWeight = false;
        this.g = Infinity;
        this.h = 0;
        this.f = Infinity;
        this.previous = null;
        this.element = null;
    }

    reset() {
        this.g = Infinity;
        this.h = 0;
        this.f = Infinity;
        this.previous = null;
    }
}

// Initialize grid
function initGrid() {
    gridEl.innerHTML = '';
    gridEl.style.gridTemplateColumns = `repeat(${COLS}, 1fr)`;
    gridEl.style.gridTemplateRows = `repeat(${ROWS}, 1fr)`;

    const nodeSize = Math.min(800 / COLS, 600 / ROWS);
    gridEl.style.width = `${nodeSize * COLS}px`;
    gridEl.style.height = `${nodeSize * ROWS}px`;

    grid = [];

    for (let row = 0; row < ROWS; row++) {
        const currentRow = [];
        for (let col = 0; col < COLS; col++) {
            const node = new Node(row, col);
            const nodeEl = document.createElement('div');
            nodeEl.className = 'node';
            nodeEl.dataset.row = row;
            nodeEl.dataset.col = col;

            nodeEl.addEventListener('mousedown', handleMouseDown);
            nodeEl.addEventListener('mouseenter', handleMouseEnter);
            nodeEl.addEventListener('mouseup', handleMouseUp);

            node.element = nodeEl;
            gridEl.appendChild(nodeEl);
            currentRow.push(node);
        }
        grid.push(currentRow);
    }

    updateStartEndNodes();
}

// Update start/end visuals
function updateStartEndNodes() {
    grid.flat().forEach(node => {
        node.element.classList.remove('start', 'end');
    });
    grid[startNode.row][startNode.col].element.classList.add('start');
    grid[endNode.row][endNode.col].element.classList.add('end');
}

// Mouse handlers
function handleMouseDown(e) {
    if (isRunning) return;
    mouseDown = true;
    const row = parseInt(e.target.dataset.row);
    const col = parseInt(e.target.dataset.col);

    if (row === startNode.row && col === startNode.col) {
        currentDragNode = 'start';
    } else if (row === endNode.row && col === endNode.col) {
        currentDragNode = 'end';
    } else {
        toggleWall(row, col);
    }
}

function handleMouseEnter(e) {
    if (!mouseDown || isRunning) return;
    const row = parseInt(e.target.dataset.row);
    const col = parseInt(e.target.dataset.col);

    if (currentDragNode === 'start') {
        if (row === endNode.row && col === endNode.col) return;
        startNode = { row, col };
        updateStartEndNodes();
    } else if (currentDragNode === 'end') {
        if (row === startNode.row && col === startNode.col) return;
        endNode = { row, col };
        updateStartEndNodes();
    } else if (currentTool!== 'start' && currentTool!== 'end') {
        if ((row === startNode.row && col === startNode.col) ||
            (row === endNode.row && col === endNode.col)) return;

        if (weightsCheck.checked) {
            grid[row][col].isWeight =!grid[row][col].isWall;
            grid[row][col].element.classList.toggle('weight');
        } else {
            grid[row][col].isWall =!grid[row][col].isWall;
            grid[row][col].element.classList.toggle('wall');
        }
    }
}

function handleMouseUp() {
    mouseDown = false;
    currentDragNode = null;
}

function toggleWall(row, col) {
    if ((row === startNode.row && col === startNode.col) ||
        (row === endNode.row && col === endNode.col)) return;

    const node = grid[row][col];
    if (weightsCheck.checked) {
        node.isWeight =!node.isWeight;
        node.element.classList.toggle('weight');
    } else {
        node.isWall =!node.isWall;
        node.element.classList.toggle('wall');
    }
}

// Heuristic - Manhattan distance
function heuristic(a, b) {
    const dRow = Math.abs(a.row - b.row);
    const dCol = Math.abs(a.col - b.col);
    if (diagonalCheck.checked) {
        return Math.max(dRow, dCol) + (Math.sqrt(2) - 1) * Math.min(dRow, dCol);
    }
    return dRow + dCol;
}

// Get neighbors
function getNeighbors(node) {
    const neighbors = [];
    const { row, col } = node;

    const directions = diagonalCheck.checked
      ? [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]]
        : [[-1, 0], [1, 0], [0, -1], [0, 1]];

    for (let [dRow, dCol] of directions) {
        const newRow = row + dRow;
        const newCol = col + dCol;

        if (newRow >= 0 && newRow < ROWS && newCol >= 0 && newCol < COLS) {
            const neighbor = grid[newRow][newCol];
            if (!neighbor.isWall) {
                // Prevent diagonal cutting through walls
                if (Math.abs(dRow) + Math.abs(dCol) === 2) {
                    const node1 = grid[row + dRow][col];
                    const node2 = grid[row][col + dCol];
                    if (node1.isWall || node2.isWall) continue;
                }
                neighbors.push(neighbor);
            }
        }
    }

    return neighbors;
}

// A* Algorithm
async function aStar() {
    const startTime = performance.now();
    const start = grid[startNode.row][startNode.col];
    const end = grid[endNode.row][endNode.col];

    grid.flat().forEach(node => node.reset());

    start.g = 0;
    start.h = heuristic(start, end);
    start.f = start.h;

    const openSet = [start];
    const closedSet = new Set();
    let visitedCount = 0;

    while (openSet.length > 0) {
        // Get node with lowest f score
        openSet.sort((a, b) => a.f - b.f);
        const current = openSet.shift();

        if (current === end) {
            // Reconstruct path
            const path = [];
            let temp = current;
            while (temp) {
                path.unshift(temp);
                temp = temp.previous;
            }

            timeElapsedEl.textContent = Math.round(performance.now() - startTime) + 'ms';
            pathLengthEl.textContent = path.length;
            await animatePath(path);
            return true;
        }

        closedSet.add(current);

        if (current!== start && current!== end) {
            current.element.classList.add('visited');
            visitedCount++;
            nodesVisitedEl.textContent = visitedCount;
        }

        const neighbors = getNeighbors(current);
        for (let neighbor of neighbors) {
            if (closedSet.has(neighbor)) continue;

            const weight = neighbor.isWeight? 5 : 1;
            const tentativeG = current.g + weight;

            if (tentativeG < neighbor.g) {
                neighbor.previous = current;
                neighbor.g = tentativeG;
                neighbor.h = heuristic(neighbor, end);
                neighbor.f = neighbor.g + neighbor.h;

                if (!openSet.includes(neighbor)) {
                    openSet.push(neighbor);
                }
            }
        }

        if (speed.value > 0) {
            await new Promise(resolve => setTimeout(resolve, parseInt(speed.value)));
        }
    }

    timeElapsedEl.textContent = Math.round(performance.now() - startTime) + 'ms';
    return false;
}

// Dijkstra's Algorithm
async function dijkstra() {
    const startTime = performance.now();
    const start = grid[startNode.row][startNode.col];
    const end = grid[endNode.row][endNode.col];

    grid.flat().forEach(node => node.reset());

    start.g = 0;
    const unvisited = grid.flat().filter(n =>!n.isWall);
    let visitedCount = 0;

    while (unvisited.length > 0) {
        unvisited.sort((a, b) => a.g - b.g);
        const current = unvisited.shift();

        if (current.g === Infinity) break;

        if (current === end) {
            const path = [];
            let temp = current;
            while (temp) {
                path.unshift(temp);
                temp = temp.previous;
            }
            timeElapsedEl.textContent = Math.round(performance.now() - startTime) + 'ms';
            pathLengthEl.textContent = path.length;
            await animatePath(path);
            return true;
        }

        if (current!== start && current!== end) {
            current.element.classList.add('visited');
            visitedCount++;
            nodesVisitedEl.textContent = visitedCount;
        }

        const neighbors = getNeighbors(current);
        for (let neighbor of neighbors) {
            const weight = neighbor.isWeight? 5 : 1;
            const alt = current.g + weight;
            if (alt < neighbor.g) {
                neighbor.g = alt;
                neighbor.previous = current;
            }
        }

        if (speed.value > 0) {
            await new Promise(resolve => setTimeout(resolve, parseInt(speed.value)));
        }
    }

    timeElapsedEl.textContent = Math.round(performance.now() - startTime) + 'ms';
    return false;
}

// BFS
async function bfs() {
    const startTime = performance.now();
    const start = grid[startNode.row][startNode.col];
    const end = grid[endNode.row][endNode.col];

    grid.flat().forEach(node => node.reset());

    const queue = [start];
    const visited = new Set([start]);
    let visitedCount = 0;

    while (queue.length > 0) {
        const current = queue.shift();

        if (current === end) {
            const path = [];
            let temp = current;
            while (temp) {
                path.unshift(temp);
                temp = temp.previous;
            }
            timeElapsedEl.textContent = Math.round(performance.now() - startTime) + 'ms';
            pathLengthEl.textContent = path.length;
            await animatePath(path);
            return true;
        }

        if (current!== start) {
            current.element.classList.add('visited');
            visitedCount++;
            nodesVisitedEl.textContent = visitedCount;
        }

        const neighbors = getNeighbors(current);
        for (let neighbor of neighbors) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                neighbor.previous = current;
                queue.push(neighbor);
            }
        }

        if (speed.value > 0) {
            await new Promise(resolve => setTimeout(resolve, parseInt(speed.value)));
        }
    }

    timeElapsedEl.textContent = Math.round(performance.now() - startTime) + 'ms';
    return false;
}

// DFS
async function dfs() {
    const startTime = performance.now();
    const start = grid[startNode.row][startNode.col];
    const end = grid[endNode.row][endNode.col];

    grid.flat().forEach(node => node.reset());

    const stack = [start];
    const visited = new Set();
    let visitedCount = 0;

    while (stack.length > 0) {
        const current = stack.pop();

        if (visited.has(current)) continue;
        visited.add(current);

        if (current === end) {
            const path = [];
            let temp = current;
            while (temp) {
                path.unshift(temp);
                temp = temp.previous;
            }
            timeElapsedEl.textContent = Math.round(performance.now() - startTime) + 'ms';
            pathLengthEl.textContent = path.length;
            await animatePath(path);
            return true;
        }

        if (current!== start) {
            current.element.classList.add('visited');
            visitedCount++;
            nodesVisitedEl.textContent = visitedCount;
        }

        const neighbors = getNeighbors(current);
        for (let neighbor of neighbors) {
            if (!visited.has(neighbor)) {
                neighbor.previous = current;
                stack.push(neighbor);
            }
        }

        if (speed.value > 0) {
            await new Promise(resolve => setTimeout(resolve, parseInt(speed.value)));
        }
    }

    timeElapsedEl.textContent = Math.round(performance.now() - startTime) + 'ms';
    return false;
}

// Animate path
async function animatePath(path) {
    for (let i = 1; i < path.length - 1; i++) {
        path[i].element.classList.add('path');
        await new Promise(resolve => setTimeout(resolve, 30));
    }
}

// Clear visualization
function clearPath() {
    grid.flat().forEach(node => {
        node.element.classList.remove('visited', 'path');
        node.reset();
    });
    nodesVisitedEl.textContent = '0';
    pathLengthEl.textContent = '—';
    timeElapsedEl.textContent = '0ms';
}

// Clear walls
function clearWalls() {
    grid.flat().forEach(node => {
        node.isWall = false;
        node.isWeight = false;
        node.element.classList.remove('wall', 'weight', 'visited', 'path');
    });
    nodesVisitedEl.textContent = '0';
    pathLengthEl.textContent = '—';
}

// Random maze
function randomMaze() {
    clearWalls();
    grid.flat().forEach(node => {
        if ((node.row === startNode.row && node.col === startNode.col) ||
            (node.row === endNode.row && node.col === endNode.col)) {
            return;
        }
        if (Math.random() < 0.3) {
            node.isWall = true;
            node.element.classList.add('wall');
        }
    });
}

// Visualize
async function visualize() {
    if (isRunning) return;
    isRunning = true;
    startBtn.disabled = true;
    clearPathBtn.disabled = true;
    clearWallsBtn.disabled = true;
    randomMazeBtn.disabled = true;

    clearPath();

    const algo = algoSelect.value;
    algoNameEl.textContent = algoSelect.options[algoSelect.selectedIndex].text;

    let found = false;
    if (algo === 'astar') found = await aStar();
    else if (algo === 'dijkstra') found = await dijkstra();
    else if (algo === 'bfs') found = await bfs();
    else if (algo === 'dfs') found = await dfs();

    if (!found) {
        pathLengthEl.textContent = 'No path';
    }

    isRunning = false;
    startBtn.disabled = false;
    clearPathBtn.disabled = false;
    clearWallsBtn.disabled = false;
    randomMazeBtn.disabled = false;
}

// Event listeners
startBtn.addEventListener('click', visualize);
clearPathBtn.addEventListener('click', clearPath);
clearWallsBtn.addEventListener('click', clearWalls);
randomMazeBtn.addEventListener('click', randomMaze);

document.addEventListener('mouseup', () => {
    mouseDown = false;
    currentDragNode = null;
});

// Init
initGrid();