const sortCanvas = document.getElementById('sortCanvas');
const sortCtx = sortCanvas.getContext('2d');
const pathCanvas = document.getElementById('pathCanvas');
const pathCtx = pathCanvas.getContext('2d');

const modeBtns = document.querySelectorAll('.mode-btn');
const sortMode = document.getElementById('sortMode');
const pathMode = document.getElementById('pathMode');

// SORTING
const sortAlgo = document.getElementById('sortAlgo');
const arraySize = document.getElementById('arraySize');
const sortSpeed = document.getElementById('sortSpeed');
const newArrayBtn = document.getElementById('newArrayBtn');
const sortBtn = document.getElementById('sortBtn');
const stopSortBtn = document.getElementById('stopSortBtn');
const comparisonsEl = document.getElementById('comparisons');
const swapsEl = document.getElementById('swaps');
const sortTimeEl = document.getElementById('sortTime');

// PATHFINDING
const pathAlgo = document.getElementById('pathAlgo');
const startNodeBtn = document.getElementById('startNodeBtn');
const endNodeBtn = document.getElementById('endNodeBtn');
const wallBtn = document.getElementById('wallBtn');
const clearPathBtn = document.getElementById('clearPathBtn');
const mazeBtn = document.getElementById('mazeBtn');
const findPathBtn = document.getElementById('findPathBtn');
const visitedEl = document.getElementById('visited');
const pathLengthEl = document.getElementById('pathLength');
const pathTimeEl = document.getElementById('pathTime');

let sortArray = [];
let sorting = false;
let stopSorting = false;
let comparisons = 0;
let swaps = 0;

// PATHFINDING GRID
const GRID_SIZE = 25;
const CELL_SIZE = 20;
let grid = [];
let startNode = { x: 2, y: 12 };
let endNode = { x: 22, y: 12 };
let currentTool = 'wall';
let isDrawing = false;
let pathFinding = false;

function resizeCanvases() {
  sortCanvas.width = sortCanvas.offsetWidth;
  sortCanvas.height = 400;

  pathCanvas.width = GRID_SIZE * CELL_SIZE;
  pathCanvas.height = GRID_SIZE * CELL_SIZE;
}

// MODE SWITCH
modeBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    modeBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const mode = btn.dataset.mode;
    sortMode.style.display = mode === 'sort'? 'block' : 'none';
    pathMode.style.display = mode === 'path'? 'block' : 'none';
    resizeCanvases();
    if (mode === 'sort') drawSortArray();
    else drawPathGrid();
  });
});

// ========== SORTING VISUALIZER ==========
function generateArray() {
  const size = parseInt(arraySize.value);
  sortArray = Array.from({ length: size }, () => Math.floor(Math.random() * 350) + 10);
  comparisons = 0;
  swaps = 0;
  updateSortStats();
  drawSortArray();
}

function drawSortArray(highlightIndices = []) {
  const width = sortCanvas.width;
  const height = sortCanvas.height;
  const barWidth = width / sortArray.length;

  sortCtx.clearRect(0, 0, width, height);

  sortArray.forEach((val, i) => {
    const x = i * barWidth;
    const barHeight = (val / 360) * height;

    if (highlightIndices.includes(i)) {
      sortCtx.fillStyle = '#ff0000';
    } else {
      sortCtx.fillStyle = '#00ff88';
    }

    sortCtx.fillRect(x, height - barHeight, barWidth - 1, barHeight);
  });
}

function updateSortStats() {
  comparisonsEl.textContent = comparisons;
  swapsEl.textContent = swaps;
}

async function bubbleSort() {
  const startTime = performance.now();
  const n = sortArray.length;

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (stopSorting) return;
      comparisons++;
      updateSortStats();

      if (sortArray[j] > sortArray[j + 1]) {
        [sortArray[j], sortArray[j + 1]] = [sortArray[j + 1], sortArray[j]];
        swaps++;
        updateSortStats();
      }

      drawSortArray([j, j + 1]);
      await sleep(101 - sortSpeed.value);
    }
  }

  sortTimeEl.textContent = Math.round(performance.now() - startTime);
  drawSortArray();
}

async function quickSort(arr = sortArray, low = 0, high = arr.length - 1) {
  if (low < high &&!stopSorting) {
    const pi = await partition(arr, low, high);
    await quickSort(arr, low, pi - 1);
    await quickSort(arr, pi + 1, high);
  }
}

async function partition(arr, low, high) {
  const pivot = arr[high];
  let i = low - 1;

  for (let j = low; j < high; j++) {
    if (stopSorting) return i + 1;
    comparisons++;
    updateSortStats();

    if (arr[j] < pivot) {
      i++;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      swaps++;
      updateSortStats();
      drawSortArray([i, j]);
      await sleep(101 - sortSpeed.value);
    }
  }

  [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
  swaps++;
  updateSortStats();
  drawSortArray([i + 1, high]);
  await sleep(101 - sortSpeed.value);

  return i + 1;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

sortBtn.addEventListener('click', async () => {
  if (sorting) return;
  sorting = true;
  stopSorting = false;
  comparisons = 0;
  swaps = 0;
  const startTime = performance.now();

  const algo = sortAlgo.value;
  if (algo === 'bubble') await bubbleSort();
  else if (algo === 'quick') await quickSort();

  sortTimeEl.textContent = Math.round(performance.now() - startTime);
  sorting = false;
});

stopSortBtn.addEventListener('click', () => {
  stopSorting = true;
});

newArrayBtn.addEventListener('click', generateArray);
arraySize.addEventListener('input', generateArray);

// ========== PATHFINDING VISUALIZER ==========
function initGrid() {
  grid = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill().map(() => ({
    wall: false,
    visited: false,
    path: false,
    g: Infinity,
    f: Infinity,
    parent: null
  })));
}

function drawPathGrid() {
  pathCtx.clearRect(0, 0, pathCanvas.width, pathCanvas.height);

  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const cell = grid[y][x];

      if (x === startNode.x && y === startNode.y) {
        pathCtx.fillStyle = '#00ff00';
      } else if (x === endNode.x && y === endNode.y) {
        pathCtx.fillStyle = '#ff0000';
      } else if (cell.wall) {
        pathCtx.fillStyle = '#333';
      } else if (cell.path) {
        pathCtx.fillStyle = '#ffff00';
      } else if (cell.visited) {
        pathCtx.fillStyle = '#0088ff';
      } else {
        pathCtx.fillStyle = '#1a1a1a';
      }

      pathCtx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      pathCtx.strokeStyle = '#2a2a2a';
      pathCtx.strokeRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    }
  }
}

function getNeighbors(x, y) {
  const neighbors = [];
  const dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]];

  dirs.forEach(([dx, dy]) => {
    const nx = x + dx;
    const ny = y + dy;
    if (nx >= 0 && nx < GRID_SIZE && ny >= 0 && ny < GRID_SIZE &&!grid[ny][nx].wall) {
      neighbors.push({ x: nx, y: ny });
    }
  });

  return neighbors;
}

async function aStar() {
  const startTime = performance.now();
  let visited = 0;

  const openSet = [startNode];
  grid[startNode.y][startNode.x].g = 0;
  grid[startNode.y][startNode.x].f = heuristic(startNode, endNode);

  while (openSet.length > 0) {
    openSet.sort((a, b) => grid[a.y][a.x].f - grid[b.y][b.x].f);
    const current = openSet.shift();

    if (current.x === endNode.x && current.y === endNode.y) {
      reconstructPath(current);
      pathTimeEl.textContent = Math.round(performance.now() - startTime);
      return;
    }

    grid[current.y][current.x].visited = true;
    visited++;
    visitedEl.textContent = visited;

    const neighbors = getNeighbors(current.x, current.y);
    for (const neighbor of neighbors) {
      const tentativeG = grid[current.y][current.x].g + 1;

      if (tentativeG < grid[neighbor.y][neighbor.x].g) {
        grid[neighbor.y][neighbor.x].parent = current;
        grid[neighbor.y][neighbor.x].g = tentativeG;
        grid[neighbor.y][neighbor.x].f = tentativeG + heuristic(neighbor, endNode);

        if (!openSet.some(n => n.x === neighbor.x && n.y === neighbor.y)) {
          openSet.push(neighbor);
        }
      }
    }

    drawPathGrid();
    await sleep(10);
  }

  pathTimeEl.textContent = Math.round(performance.now() - startTime);
}

function heuristic(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function reconstructPath(node) {
  let pathLen = 0;
  while (node) {
    grid[node.y][node.x].path = true;
    node = grid[node.y][node.x].parent;
    pathLen++;
  }
  pathLengthEl.textContent = pathLen - 1;
  drawPathGrid();
}

function generateMaze() {
  initGrid();
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      if (Math.random() < 0.3 &&!(x === startNode.x && y === startNode.y)&&!(x === endNode.x && y === endNode.y)) {
        grid[y][x].wall = true;
      }
    }
  }
  drawPathGrid();
}

// Path tools
[startNodeBtn, endNodeBtn, wallBtn].forEach(btn => {
  btn.addEventListener('click', () => {
    [startNodeBtn, endNodeBtn, wallBtn].forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentTool = btn.id.replace('Btn', '').replace('Node', '');
  });
});

pathCanvas.addEventListener('mousedown', (e) => {
  isDrawing = true;
  handlePathClick(e);
});

pathCanvas.addEventListener('mousemove', (e) => {
  if (isDrawing && currentTool === 'wall') handlePathClick(e);
});

pathCanvas.addEventListener('mouseup', () => {
  isDrawing = false;
});

function handlePathClick(e) {
  const rect = pathCanvas.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left) / CELL_SIZE);
  const y = Math.floor((e.clientY - rect.top) / CELL_SIZE);

  if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) return;

  if (currentTool === 'start') {
    startNode = { x, y };
  } else if (currentTool === 'end') {
    endNode = { x, y };
  } else if (currentTool === 'wall') {
    if (!(x === startNode.x && y === startNode.y)&&!(x === endNode.x && y === endNode.y)) {
      grid[y][x].wall =!grid[y][x].wall;
    }
  }

  drawPathGrid();
}

findPathBtn.addEventListener('click', async () => {
  if (pathFinding) return;
  pathFinding = true;

  initGrid();
  grid[startNode.y][startNode.x].wall = false;
  grid[endNode.y][endNode.x].wall = false;

  visitedEl.textContent = '0';
  pathLengthEl.textContent = '0';

  if (pathAlgo.value === 'astar') await aStar();

  pathFinding = false;
});

clearPathBtn.addEventListener('click', () => {
  initGrid();
  drawPathGrid();
});

mazeBtn.addEventListener('click', generateMaze);

// Init
resizeCanvases();
generateArray();
initGrid();
drawPathGrid();