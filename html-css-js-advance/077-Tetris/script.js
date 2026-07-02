// Game States
const GameState = {
  MENU: 'MENU',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  GAME_OVER: 'GAME_OVER'
};

// Tetromino definitions - Rotation matrices for each piece
const PIECES = {
  I: {
    shape: [[0,0,0,0], [1,1,1,1], [0,0,0,0], [0,0,0,0]],
    color: '#00f0f0'
  },
  J: {
    shape: [[1,0,0], [1,1,1], [0,0,0]],
    color: '#0000f0'
  },
  L: {
    shape: [[0,0,1], [1,1,1], [0,0,0]],
    color: '#f0a000'
  },
  O: {
    shape: [[1,1], [1,1]],
    color: '#f0f000'
  },
  S: {
    shape: [[0,1,1], [1,1,0], [0,0,0]],
    color: '#00f000'
  },
  T: {
    shape: [[0,1,0], [1,1,1], [0,0,0]],
    color: '#a000f0'
  },
  Z: {
    shape: [[1,1,0], [0,1,1], [0,0,0]],
    color: '#f00000'
  }
};

const PIECE_TYPES = Object.keys(PIECES);

// SRS Wall Kick Data - simplified
const WALL_KICKS = {
  '0->1': [[0,0], [-1,0], [-1,1], [0,-2], [-1,-2]],
  '1->0': [[0,0], [1,0], [1,-1], [0,2], [1,2]],
  '1->2': [[0,0], [1,0], [1,-1], [0,2], [1,2]],
  '2->1': [[0,0], [-1,0], [-1,1], [0,-2], [-1,-2]],
  '2->3': [[0,0], [1,0], [1,1], [0,-2], [1,-2]],
  '3->2': [[0,0], [-1,0], [-1,-1], [0,2], [-1,2]],
  '3->0': [[0,0], [-1,0], [-1,-1], [0,2], [-1,2]],
  '0->3': [[0,0], [1,0], [1,1], [0,-2], [1,-2]]
};

// Canvas Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const holdCanvas = document.getElementById('holdCanvas');
const holdCtx = holdCanvas.getContext('2d');
const nextCanvas = document.getElementById('nextCanvas');
const nextCtx = nextCanvas.getContext('2d');

// DOM Elements
const scoreEl = document.getElementById('score');
const levelEl = document.getElementById('level');
const linesEl = document.getElementById('lines');
const highScoreMenu = document.getElementById('highScoreMenu');

const menuScreen = document.getElementById('menuScreen');
const pauseScreen = document.getElementById('pauseScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScoreEl = document.getElementById('finalScore');
const finalLevelEl = document.getElementById('finalLevel');
const bestScoreEl = document.getElementById('bestScore');

const startBtn = document.getElementById('startBtn');
const resumeBtn = document.getElementById('resumeBtn');
const restartBtn = document.getElementById('restartBtn');
const menuBtn = document.getElementById('menuBtn');
const menuBtn2 = document.getElementById('menuBtn2');
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');
const downBtn = document.getElementById('downBtn');
const dropBtn = document.getElementById('dropBtn');
const rotateLeftBtn = document.getElementById('rotateLeftBtn');
const rotateRightBtn = document.getElementById('rotateRightBtn');
const holdBtn = document.getElementById('holdBtn');
const pauseBtn = document.getElementById('pauseBtn');

// Game Constants
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;
const LINES_PER_LEVEL = 10;

// Game Variables
let gameState = GameState.MENU;
let board = [];
let currentPiece = null;
let heldPiece = null;
let canHold = true;
let pieceBag = [];
let nextPieces = [];

let score = 0;
let level = 1;
let lines = 0;
let highScore = parseInt(localStorage.getItem('tetrisHighScore') || '0');

let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;
let animationId = null;

let keys = {};

highScoreMenu.textContent = highScore;

// Canvas sizing
canvas.width = COLS * BLOCK_SIZE;
canvas.height = ROWS * BLOCK_SIZE;

// Piece Class - 2D Array Logic
class Piece {
  constructor(type) {
    this.type = type;
    this.shape = PIECES[type].shape.map(row => [...row]);
    this.color = PIECES[type].color;
    this.x = Math.floor(COLS / 2) - Math.floor(this.shape[0].length / 2);
    this.y = 0;
    this.rotation = 0;
  }

  // Rotation Matrix: 90 degrees clockwise
  rotate(clockwise = true) {
    const n = this.shape.length;
    const rotated = Array(n).fill().map(() => Array(n).fill(0));

    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        if (clockwise) {
          rotated[x][n - 1 - y] = this.shape[y][x];
        } else {
          rotated[n - 1 - x][y] = this.shape[y][x];
        }
      }
    }
    return rotated;
  }
}

// 7-Bag Randomizer
function fillBag() {
  pieceBag = [...PIECE_TYPES];
  // Fisher-Yates shuffle
  for (let i = pieceBag.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pieceBag[i], pieceBag[j]] = [pieceBag[j], pieceBag[i]];
  }
}

function getNextPiece() {
  if (pieceBag.length === 0) fillBag();
  if (nextPieces.length < 5) {
    while (nextPieces.length < 5) {
      if (pieceBag.length === 0) fillBag();
      nextPieces.push(pieceBag.pop());
    }
  }
  return nextPieces.shift();
}

// Board Management - 2D Array
function createBoard() {
  return Array(ROWS).fill().map(() => Array(COLS).fill(0));
}

function isValidMove(piece, offsetX = 0, offsetY = 0, testShape = null) {
  const shape = testShape || piece.shape;
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x]) {
        const newX = piece.x + x + offsetX;
        const newY = piece.y + y + offsetY;
        if (newX < 0 || newX >= COLS || newY >= ROWS) return false;
        if (newY >= 0 && board[newY][newX]) return false;
      }
    }
  }
  return true;
}

function placePiece() {
  currentPiece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) {
        const boardY = currentPiece.y + y;
        const boardX = currentPiece.x + x;
        if (boardY >= 0) {
          board[boardY][boardX] = currentPiece.color;
        }
      }
    });
  });
  clearLines();
  spawnPiece();
  canHold = true;
}

function clearLines() {
  let linesCleared = 0;
  for (let y = ROWS - 1; y >= 0; y--) {
    if (board[y].every(cell => cell!== 0)) {
      board.splice(y, 1);
      board.unshift(Array(COLS).fill(0));
      linesCleared++;
      y++; // Check same row again
    }
  }

  if (linesCleared > 0) {
    const linePoints = [0, 100, 300, 500, 800];
    score += linePoints[linesCleared] * level;
    lines += linesCleared;
    level = Math.floor(lines / LINES_PER_LEVEL) + 1;
    dropInterval = Math.max(50, 1000 - (level - 1) * 50);
    updateStats();

    if (score > highScore) {
      highScore = score;
      localStorage.setItem('tetrisHighScore', highScore);
    }
  }
}

function spawnPiece() {
  currentPiece = new Piece(getNextPiece());
  if (!isValidMove(currentPiece)) {
    gameOver();
  }
  drawNext();
  drawHold();
}

function holdPiece() {
  if (!canHold) return;
  if (!heldPiece) {
    heldPiece = currentPiece.type;
    spawnPiece();
  } else {
    const temp = heldPiece;
    heldPiece = currentPiece.type;
    currentPiece = new Piece(temp);
    currentPiece.x = Math.floor(COLS / 2) - Math.floor(currentPiece.shape[0].length / 2);
    currentPiece.y = 0;
  }
  canHold = false;
  drawHold();
}

// Wall Kick System
function tryRotate(clockwise) {
  const rotated = currentPiece.rotate(clockwise);
  const oldRotation = currentPiece.rotation;
  const newRotation = (oldRotation + (clockwise? 1 : 3)) % 4;

  const kickKey = `${oldRotation}->${newRotation}`;
  const kicks = WALL_KICKS[kickKey] || [[0, 0]];

  for (let [kickX, kickY] of kicks) {
    if (isValidMove(currentPiece, kickX, kickY, rotated)) {
      currentPiece.shape = rotated;
      currentPiece.x += kickX;
      currentPiece.y += kickY;
      currentPiece.rotation = newRotation;
      return true;
    }
  }
  return false;
}

function hardDrop() {
  let dropDistance = 0;
  while (isValidMove(currentPiece, 0, dropDistance + 1)) {
    dropDistance++;
  }
  currentPiece.y += dropDistance;
  score += dropDistance * 2;
  updateStats();
  placePiece();
}

// State Management
function setGameState(state) {
  gameState = state;
  menuScreen.style.display = state === GameState.MENU? 'block' : 'none';
  pauseScreen.style.display = state === GameState.PAUSED? 'block' : 'none';
  gameOverScreen.style.display = state === GameState.GAME_OVER? 'block' : 'none';

  if (state === GameState.PLAYING) {
    lastTime = performance.now();
    gameLoop(lastTime);
  } else {
    cancelAnimationFrame(animationId);
  }
}

function initGame() {
  board = createBoard();
  score = 0;
  level = 1;
  lines = 0;
  dropInterval = 1000;
  heldPiece = null;
  canHold = true;
  pieceBag = [];
  nextPieces = [];
  fillBag();
  for (let i = 0; i < 5; i++) {
    nextPieces.push(pieceBag.pop());
  }
  updateStats();
  spawnPiece();
}

function startGame() {
  initGame();
  setGameState(GameState.PLAYING);
}

function gameOver() {
  setGameState(GameState.GAME_OVER);
  finalScoreEl.textContent = score;
  finalLevelEl.textContent = level;
  bestScoreEl.textContent = highScore;
}

function updateStats() {
  scoreEl.textContent = score;
  levelEl.textContent = level;
  linesEl.textContent = lines;
  highScoreMenu.textContent = highScore;
}

// Game Loop
function gameLoop(currentTime) {
  if (gameState!== GameState.PLAYING) return;
  const deltaTime = currentTime - lastTime;
  lastTime = currentTime;

  update(deltaTime);
  draw();

  animationId = requestAnimationFrame(gameLoop);
}

function update(dt) {
  // Auto drop
  dropCounter += dt;
  if (dropCounter > dropInterval) {
    if (isValidMove(currentPiece, 0, 1)) {
      currentPiece.y++;
    } else {
      placePiece();
    }
    dropCounter = 0;
  }

  // Movement
  if (keys['ArrowLeft'] || keys['a']) {
    if (isValidMove(currentPiece, -1, 0)) currentPiece.x--;
    keys['ArrowLeft'] = keys['a'] = false;
  }
  if (keys['ArrowRight'] || keys['d']) {
    if (isValidMove(currentPiece, 1, 0)) currentPiece.x++;
    keys['ArrowRight'] = keys['d'] = false;
  }
  if (keys['ArrowDown'] || keys['s']) {
    if (isValidMove(currentPiece, 0, 1)) {
      currentPiece.y++;
      score += 1;
      updateStats();
    }
    keys['ArrowDown'] = keys['s'] = false;
  }
}

// Drawing
function draw() {
  ctx.fillStyle = '#0a0a14';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw grid
  ctx.strokeStyle = '#1a1a2e';
  ctx.lineWidth = 1;
  for (let x = 0; x <= COLS; x++) {
    ctx.beginPath();
    ctx.moveTo(x * BLOCK_SIZE, 0);
    ctx.lineTo(x * BLOCK_SIZE, ROWS * BLOCK_SIZE);
    ctx.stroke();
  }
  for (let y = 0; y <= ROWS; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * BLOCK_SIZE);
    ctx.lineTo(COLS * BLOCK_SIZE, y * BLOCK_SIZE);
    ctx.stroke();
  }

  // Draw board
  board.forEach((row, y) => {
    row.forEach((color, x) => {
      if (color) {
        ctx.fillStyle = color;
        ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
      }
    });
  });

  // Draw ghost piece
  let ghostY = currentPiece.y;
  while (isValidMove(currentPiece, 0, ghostY - currentPiece.y + 1)) {
    ghostY++;
  }
  ctx.globalAlpha = 0.2;
  drawPiece(currentPiece, currentPiece.x, ghostY);
  ctx.globalAlpha = 1;

  // Draw current piece
  drawPiece(currentPiece, currentPiece.x, currentPiece.y);
}

function drawPiece(piece, offsetX, offsetY) {
  piece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) {
        ctx.fillStyle = piece.color;
        ctx.fillRect((offsetX + x) * BLOCK_SIZE, (offsetY + y) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.strokeRect((offsetX + x) * BLOCK_SIZE, (offsetY + y) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
      }
    });
  });
}

function drawNext() {
  nextCtx.fillStyle = '#0a0a14';
  nextCtx.fillRect(0, 0, 100, 300);
  nextPieces.slice(0, 3).forEach((type, i) => {
    const piece = PIECES[type];
    const offsetY = i * 90 + 10;
    const offsetX = (100 - piece.shape[0].length * 20) / 2;
    piece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value) {
          nextCtx.fillStyle = piece.color;
          nextCtx.fillRect(offsetX + x * 20, offsetY + y * 20, 20, 20);
          nextCtx.strokeStyle = '#000';
          nextCtx.lineWidth = 1;
          nextCtx.strokeRect(offsetX + x * 20, offsetY + y * 20, 20, 20);
        }
      });
    });
  });
}

function drawHold() {
  holdCtx.fillStyle = '#0a0a14';
  holdCtx.fillRect(0, 0, 100, 100);
  if (heldPiece) {
    const piece = PIECES[heldPiece];
    const offsetX = (100 - piece.shape[0].length * 20) / 2;
    const offsetY = (100 - piece.shape.length * 20) / 2;
    piece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value) {
          holdCtx.fillStyle = canHold? piece.color : '#555';
          holdCtx.fillRect(offsetX + x * 20, offsetY + y * 20, 20, 20);
          holdCtx.strokeStyle = '#000';
          holdCtx.lineWidth = 1;
          holdCtx.strokeRect(offsetX + x * 20, offsetY + y * 20, 20, 20);
        }
      });
    });
  }
}

// Input
document.addEventListener('keydown', (e) => {
  if (gameState === GameState.PLAYING) {
    if (e.key === 'z' || e.key === 'Z') tryRotate(false);
    if (e.key === 'x' || e.key === 'X' || e.key === 'ArrowUp') tryRotate(true);
    if (e.key === ' ') { e.preventDefault(); hardDrop(); }
    if (e.key === 'c' || e.key === 'C') holdPiece();
    if (e.key === 'p' || e.key === 'P') setGameState(GameState.PAUSED);
  } else if (gameState === GameState.PAUSED && (e.key === 'p' || e.key === 'P')) {
    setGameState(GameState.PLAYING);
  }
  keys[e.key] = true;
});

document.addEventListener('keyup', (e) => { keys[e.key] = false; });

// Mobile controls
leftBtn.addEventListener('touchstart', (e) => { e.preventDefault(); keys['ArrowLeft'] = true; });
leftBtn.addEventListener('touchend', (e) => { e.preventDefault(); keys['ArrowLeft'] = false; });
rightBtn.addEventListener('touchstart', (e) => { e.preventDefault(); keys['ArrowRight'] = true; });
rightBtn.addEventListener('touchend', (e) => { e.preventDefault(); keys['ArrowRight'] = false; });
downBtn.addEventListener('touchstart', (e) => { e.preventDefault(); keys['ArrowDown'] = true; });
downBtn.addEventListener('touchend', (e) => { e.preventDefault(); keys['ArrowDown'] = false; });
dropBtn.addEventListener('click', () => { if (gameState === GameState.PLAYING) hardDrop(); });
rotateLeftBtn.addEventListener('click', () => { if (gameState === GameState.PLAYING) tryRotate(false); });
rotateRightBtn.addEventListener('click', () => { if (gameState === GameState.PLAYING) tryRotate(true); });
holdBtn.addEventListener('click', () => { if (gameState === GameState.PLAYING) holdPiece(); });
pauseBtn.addEventListener('click', () => {
  if (gameState === GameState.PLAYING) setGameState(GameState.PAUSED);
  else if (gameState === GameState.PAUSED) setGameState(GameState.PLAYING);
});

// Button events
startBtn.addEventListener('click', startGame);
resumeBtn.addEventListener('click', () => setGameState(GameState.PLAYING));
restartBtn.addEventListener('click', startGame);
menuBtn.addEventListener('click', () => setGameState(GameState.MENU));
menuBtn2.addEventListener('click', () => setGameState(GameState.MENU));

// Init
setGameState(GameState.MENU);
updateStats();