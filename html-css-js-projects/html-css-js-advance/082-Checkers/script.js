// Game States
const GameState = {
  MENU: 'MENU',
  PLAYING: 'PLAYING',
  GAME_OVER: 'GAME_OVER'
};

const Player = {
  RED: 1,
  BLACK: 2
};

const PieceType = {
  EMPTY: 0,
  RED: 1,
  RED_KING: 3,
  BLACK: 2,
  BLACK_KING: 4
};

// Canvas Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// DOM Elements
const turnDisplay = document.getElementById('turnDisplay');
const redScoreEl = document.getElementById('redScore');
const blackScoreEl = document.getElementById('blackScore');
const difficultySelect = document.getElementById('difficultySelect');

const menuScreen = document.getElementById('menuScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const gameOverText = document.getElementById('gameOverText');
const gameOverReason = document.getElementById('gameOverReason');
const thinkingDisplay = document.getElementById('thinkingDisplay');

const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const menuBtn = document.getElementById('menuBtn');
const undoBtn = document.getElementById('undoBtn');
const hintBtn = document.getElementById('hintBtn');
const newGameBtn = document.getElementById('newGameBtn');

// Game Constants
const BOARD_SIZE = 8;
const CELL_SIZE = 70;
const PIECE_RADIUS = 25;

// Game Variables
let gameState = GameState.MENU;
let board = [];
let currentPlayer = Player.RED;
let selectedPiece = null;
let validMoves = [];
let moveHistory = [];
let aiDepth = 4;
let isAIThinking = false;

// Responsive canvas
function resizeCanvas() {
  const size = Math.min(window.innerWidth * 0.9, window.innerHeight * 0.7, 560);
  canvas.width = size;
  canvas.height = size;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Board Management - 2D Array Logic
function initBoard() {
  board = Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill(PieceType.EMPTY));

  // Place black pieces
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if ((row + col) % 2 === 1) {
        board[row][col] = PieceType.BLACK;
      }
    }
  }

  // Place red pieces
  for (let row = 5; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if ((row + col) % 2 === 1) {
        board[row][col] = PieceType.RED;
      }
    }
  }
}

function cloneBoard(b) {
  return b.map(row => [...row]);
}

// Move Generation - Complex 2D Logic
function getValidMoves(row, col, boardState = board) {
  const piece = boardState[row][col];
  if (!piece) return [];

  const moves = [];
  const captures = [];
  const isKing = piece === PieceType.RED_KING || piece === PieceType.BLACK_KING;
  const directions = [];

  if (piece === PieceType.RED || isKing) {
    directions.push([-1, -1], [-1, 1]); // Up-left, Up-right
  }
  if (piece === PieceType.BLACK || isKing) {
    directions.push([1, -1], [1, 1]); // Down-left, Down-right
  }

  // Check captures first - forced captures rule
  for (let [dr, dc] of directions) {
    const jumpRow = row + dr * 2;
    const jumpCol = col + dc * 2;
    const midRow = row + dr;
    const midCol = col + dc;

    if (jumpRow >= 0 && jumpRow < BOARD_SIZE && jumpCol >= 0 && jumpCol < BOARD_SIZE) {
      if (!boardState[jumpRow][jumpCol] && boardState[midRow][midCol] &&
          isOpponent(piece, boardState[midRow][midCol])) {
        captures.push({ row: jumpRow, col: jumpCol, captured: { row: midRow, col: midCol } });
      }
    }
  }

  // If captures available, must capture
  if (captures.length > 0) return captures;

  // Regular moves
  for (let [dr, dc] of directions) {
    const newRow = row + dr;
    const newCol = col + dc;
    if (newRow >= 0 && newRow < BOARD_SIZE && newCol >= 0 && newCol < BOARD_SIZE) {
      if (!boardState[newRow][newCol]) {
        moves.push({ row: newRow, col: newCol, captured: null });
      }
    }
  }

  return moves;
}

function getAllValidMoves(player, boardState = board) {
  const allMoves = [];
  let hasCaptures = false;

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const piece = boardState[row][col];
      if (piece && isPlayerPiece(piece, player)) {
        const moves = getValidMoves(row, col, boardState);
        if (moves.length > 0) {
          if (moves[0].captured) hasCaptures = true;
          allMoves.push({ from: { row, col }, moves });
        }
      }
    }
  }

  // If captures available, only return captures
  if (hasCaptures) {
    return allMoves.map(m => ({
      from: m.from,
      moves: m.moves.filter(move => move.captured)
    })).filter(m => m.moves.length > 0);
  }

  return allMoves;
}

function isOpponent(piece1, piece2) {
  const p1Red = piece1 === PieceType.RED || piece1 === PieceType.RED_KING;
  const p2Red = piece2 === PieceType.RED || piece2 === PieceType.RED_KING;
  return p1Red!== p2Red;
}

function isPlayerPiece(piece, player) {
  if (player === Player.RED) return piece === PieceType.RED || piece === PieceType.RED_KING;
  return piece === PieceType.BLACK || piece === PieceType.BLACK_KING;
}

// Execute move
function makeMove(from, to, boardState = board) {
  const newBoard = cloneBoard(boardState);
  const piece = newBoard[from.row][from.col];
  newBoard[from.row][from.col] = PieceType.EMPTY;

  // Check for king promotion
  let newPiece = piece;
  if (piece === PieceType.RED && to.row === 0) newPiece = PieceType.RED_KING;
  if (piece === PieceType.BLACK && to.row === BOARD_SIZE - 1) newPiece = PieceType.BLACK_KING;

  newBoard[to.row][to.col] = newPiece;

  // Remove captured piece
  if (to.captured) {
    newBoard[to.captured.row][to.captured.col] = PieceType.EMPTY;
    return { board: newBoard, captured: true };
  }

  return { board: newBoard, captured: false };
}

// Minimax AI with Alpha-Beta Pruning
function evaluateBoard(boardState) {
  let score = 0;
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const piece = boardState[row][col];
      if (piece === PieceType.BLACK) score += 10 + row; // Advance bonus
      else if (piece === PieceType.BLACK_KING) score += 15;
      else if (piece === PieceType.RED) score -= 10 + (7 - row);
      else if (piece === PieceType.RED_KING) score -= 15;
    }
  }
  return score;
}

function minimax(boardState, depth, alpha, beta, maximizingPlayer) {
  if (depth === 0) return evaluateBoard(boardState);

  const player = maximizingPlayer? Player.BLACK : Player.RED;
  const moves = getAllValidMoves(player, boardState);

  if (moves.length === 0) {
    return maximizingPlayer? -1000 : 1000; // Loss
  }

  if (maximizingPlayer) {
    let maxEval = -Infinity;
    for (let moveData of moves) {
      for (let move of moveData.moves) {
        const result = makeMove(moveData.from, move, boardState);
        const evalScore = minimax(result.board, depth - 1, alpha, beta, false);
        maxEval = Math.max(maxEval, evalScore);
        alpha = Math.max(alpha, evalScore);
        if (beta <= alpha) break; // Alpha-beta pruning
      }
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (let moveData of moves) {
      for (let move of moveData.moves) {
        const result = makeMove(moveData.from, move, boardState);
        const evalScore = minimax(result.board, depth - 1, alpha, beta, true);
        minEval = Math.min(minEval, evalScore);
        beta = Math.min(beta, evalScore);
        if (beta <= alpha) break;
      }
    }
    return minEval;
  }
}

function getBestMove(boardState, depth) {
  const moves = getAllValidMoves(Player.BLACK, boardState);
  let bestMove = null;
  let bestValue = -Infinity;

  for (let moveData of moves) {
    for (let move of moveData.moves) {
      const result = makeMove(moveData.from, move, boardState);
      const value = minimax(result.board, depth - 1, -Infinity, Infinity, false);
      if (value > bestValue) {
        bestValue = value;
        bestMove = { from: moveData.from, to: move };
      }
    }
  }

  return bestMove;
}

function makeAIMove() {
  if (currentPlayer!== Player.BLACK || isAIThinking) return;

  isAIThinking = true;
  thinkingDisplay.classList.add('active');

  setTimeout(() => {
    const move = getBestMove(board, aiDepth);
    if (move) {
      const result = makeMove(move.from, move.to, board);
      board = result.board;
      moveHistory.push({ board: cloneBoard(board), player: Player.BLACK });

      // Multi-jump check
      if (result.captured) {
        const furtherCaptures = getValidMoves(move.to.row, move.to.col).filter(m => m.captured);
        if (furtherCaptures.length > 0) {
          isAIThinking = false;
          thinkingDisplay.classList.remove('active');
          setTimeout(() => makeAIMove(), 500);
          return;
        }
      }

      currentPlayer = Player.RED;
      updateStats();
      checkGameOver();
    }
    isAIThinking = false;
    thinkingDisplay.classList.remove('active');
  }, 500);
}

// Game State Management
function setGameState(state) {
  gameState = state;
  menuScreen.style.display = state === GameState.MENU? 'block' : 'none';
  gameOverScreen.style.display = state === GameState.GAME_OVER? 'block' : 'none';
}

function startGame() {
  initBoard();
  currentPlayer = Player.RED;
  selectedPiece = null;
  validMoves = [];
  moveHistory = [{ board: cloneBoard(board), player: Player.RED }];
  aiDepth = parseInt(difficultySelect.value);
  setGameState(GameState.PLAYING);
  updateStats();
  draw();
}

function updateStats() {
  let redCount = 0, blackCount = 0;
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col] === PieceType.RED || board[row][col] === PieceType.RED_KING) redCount++;
      if (board[row][col] === PieceType.BLACK || board[row][col] === PieceType.BLACK_KING) blackCount++;
    }
  }
  redScoreEl.textContent = redCount;
  blackScoreEl.textContent = blackCount;
  turnDisplay.textContent = currentPlayer === Player.RED? 'Red' : 'Black';
  turnDisplay.style.color = currentPlayer === Player.RED? '#ff6b6b' : '#333';
}

function checkGameOver() {
  const redMoves = getAllValidMoves(Player.RED);
  const blackMoves = getAllValidMoves(Player.BLACK);

  if (redMoves.length === 0) {
    endGame('Black wins!', 'Red has no moves');
  } else if (blackMoves.length === 0) {
    endGame('Red wins!', 'Black has no moves');
  }

  let redCount = 0, blackCount = 0;
  board.forEach(row => row.forEach(piece => {
    if (piece === PieceType.RED || piece === PieceType.RED_KING) redCount++;
    if (piece === PieceType.BLACK || piece === PieceType.BLACK_KING) blackCount++;
  }));

  if (redCount === 0) endGame('Black wins!', 'All red pieces captured');
  if (blackCount === 0) endGame('Red wins!', 'All black pieces captured');
}

function endGame(winner, reason) {
  setGameState(GameState.GAME_OVER);
  gameOverText.textContent = winner;
  gameOverReason.textContent = reason;
}

// Drawing
function draw() {
  const cellSize = canvas.width / BOARD_SIZE;

  // Draw board
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      ctx.fillStyle = (row + col) % 2 === 0? '#f0d9b5' : '#b58863';
      ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
    }
  }

  // Draw valid moves
  ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
  validMoves.forEach(move => {
    ctx.beginPath();
    ctx.arc(move.col * cellSize + cellSize / 2, move.row * cellSize + cellSize / 2, 15, 0, Math.PI * 2);
    ctx.fill();
  });

  // Draw pieces
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const piece = board[row][col];
      if (piece) {
        const x = col * cellSize + cellSize / 2;
        const y = row * cellSize + cellSize / 2;

        // Piece shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.arc(x + 2, y + 2, PIECE_RADIUS, 0, Math.PI * 2);
        ctx.fill();

        // Piece body
        ctx.fillStyle = (piece === PieceType.RED || piece === PieceType.RED_KING)? '#c41e3a' : '#2c2c2c';
        ctx.beginPath();
        ctx.arc(x, y, PIECE_RADIUS, 0, Math.PI * 2);
        ctx.fill();

        // Piece highlight
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.stroke();

        // King crown
        if (piece === PieceType.RED_KING || piece === PieceType.BLACK_KING) {
          ctx.fillStyle = '#ffd700';
          ctx.font = 'bold 24px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('♔', x, y);
        }

        // Selected piece highlight
        if (selectedPiece && selectedPiece.row === row && selectedPiece.col === col) {
          ctx.strokeStyle = '#00ff00';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(x, y, PIECE_RADIUS + 5, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    }
  }
}

// Input Handling
canvas.addEventListener('click', (e) => {
  if (gameState!== GameState.PLAYING || currentPlayer!== Player.RED || isAIThinking) return;

  const rect = canvas.getBoundingClientRect();
  const cellSize = canvas.width / BOARD_SIZE;
  const col = Math.floor((e.clientX - rect.left) / cellSize);
  const row = Math.floor((e.clientY - rect.top) / cellSize);

  if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) return;

  const piece = board[row][col];

  // Select piece
  if (piece && isPlayerPiece(piece, Player.RED)) {
    selectedPiece = { row, col };
    validMoves = getValidMoves(row, col);
    draw();
    return;
  }

  // Move piece
  if (selectedPiece && validMoves.some(m => m.row === row && m.col === col)) {
    const move = validMoves.find(m => m.row === row && m.col === col);
    const result = makeMove(selectedPiece, move, board);
    board = result.board;
    moveHistory.push({ board: cloneBoard(board), player: Player.RED });

    // Multi-jump
    if (result.captured) {
      const furtherCaptures = getValidMoves(row, col).filter(m => m.captured);
      if (furtherCaptures.length > 0) {
        selectedPiece = { row, col };
        validMoves = furtherCaptures;
        draw();
        return;
      }
    }

    selectedPiece = null;
    validMoves = [];
    currentPlayer = Player.BLACK;
    updateStats();
    checkGameOver();
    draw();

    if (gameState === GameState.PLAYING) {
      setTimeout(() => makeAIMove(), 500);
    }
  } else {
    selectedPiece = null;
    validMoves = [];
    draw();
  }
});

// Button Events
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);
menuBtn.addEventListener('click', () => setGameState(GameState.MENU));
newGameBtn.addEventListener('click', startGame);

undoBtn.addEventListener('click', () => {
  if (moveHistory.length > 2 && gameState === GameState.PLAYING &&!isAIThinking) {
    moveHistory.pop(); // Remove AI move
    moveHistory.pop(); // Remove player move
    const lastState = moveHistory[moveHistory.length - 1];
    board = cloneBoard(lastState.board);
    currentPlayer = Player.RED;
    selectedPiece = null;
    validMoves = [];
    updateStats();
    draw();
  }
});

hintBtn.addEventListener('click', () => {
  if (gameState!== GameState.PLAYING || currentPlayer!== Player.RED) return;
  const moves = getAllValidMoves(Player.RED);
  if (moves.length > 0) {
    const randomMove = moves[Math.floor(Math.random() * moves.length)];
    selectedPiece = randomMove.from;
    validMoves = randomMove.moves;
    draw();
  }
});

// Init
setGameState(GameState.MENU);
initBoard();
draw();