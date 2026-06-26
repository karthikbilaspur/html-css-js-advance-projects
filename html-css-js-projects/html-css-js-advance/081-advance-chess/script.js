// Game Constants
const PIECES = {
  'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
  'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
};

const PIECE_VALUES = { 'p': 100, 'n': 320, 'b': 330, 'r': 500, 'q': 900, 'k': 20000 };

const START_POS = [
  ['r','n','b','q','k','b','n','r'],
  ['p','p','p','p'],
  [0,0,0,0],
  [0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0],
  ['P','P','P','P','P','P','P','P'],
  ['R','N','B','Q','K','B','N','R']
];

// DOM Elements
const boardEl = document.getElementById('board');
const turnEl = document.getElementById('turn');
const statusEl = document.getElementById('status');
const menuScreen = document.getElementById('menuScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const gameOverText = document.getElementById('gameOverText');
const gameOverSubtext = document.getElementById('gameOverSubtext');

const startBtn = document.getElementById('startBtn');
const startBlackBtn = document.getElementById('startBlackBtn');
const restartBtn = document.getElementById('restartBtn');
const menuBtn = document.getElementById('menuBtn');
const undoBtn = document.getElementById('undoBtn');
const newGameBtn = document.getElementById('newGameBtn');
const depthSlider = document.getElementById('depthSlider');
const depthLabel = document.getElementById('depthLabel');

// Game State
let board = [];
let turn = 'w'; // 'w' or 'b'
let humanColor = 'w';
let aiDepth = 2;
let selectedSquare = null;
let legalMoves = [];
let moveHistory = [];
let capturedWhite = [];
let capturedBlack = [];
let gameActive = false;
let lastMove = null;

// Drag state
let draggedPiece = null;
let dragOffsetX = 0;
let dragOffsetY = 0;

depthSlider.addEventListener('input', (e) => {
  aiDepth = parseInt(e.target.value);
  depthLabel.textContent = aiDepth;
});

// Initialize Board
function initBoard() {
  board = START_POS.map(row => [...row]);
  boardEl.innerHTML = '';

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const square = document.createElement('div');
      square.className = `square ${(r + c) % 2 === 0? 'light' : 'dark'}`;
      square.dataset.row = r;
      square.dataset.col = c;
      square.addEventListener('click', () => handleSquareClick(r, c));
      square.addEventListener('mousedown', (e) => handleDragStart(e, r, c));
      square.addEventListener('touchstart', (e) => handleDragStart(e, r, c), { passive: false });
      boardEl.appendChild(square);
    }
  }
  renderBoard();
}

function renderBoard() {
  const squares = boardEl.children;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const idx = r * 8 + c;
      const square = squares[idx];
      const piece = board[r][c];

      square.innerHTML = '';
      square.className = `square ${(r + c) % 2 === 0? 'light' : 'dark'}`;

      if (lastMove && ((lastMove.from.r === r && lastMove.from.c === c) ||
          (lastMove.to.r === r && lastMove.to.c === c))) {
        square.classList.add('last-move');
      }

      if (piece) {
        const pieceEl = document.createElement('div');
        pieceEl.className = 'piece';
        pieceEl.textContent = PIECES[piece];
        pieceEl.style.color = piece === piece.toUpperCase()? '#fff' : '#000';
        pieceEl.style.textShadow = piece === piece.toUpperCase()? '2px 2px 4px rgba(0,0,0,0.8)' : '2px 2px 4px rgba(255,255,255,0.3)';
        square.appendChild(pieceEl);

        if (piece.toLowerCase() === 'k' && isInCheck(getColor(piece))) {
          square.classList.add('check');
        }
      }

      if (selectedSquare && selectedSquare.r === r && selectedSquare.c === c) {
        square.classList.add('selected');
      }

      if (legalMoves.some(m => m.r === r && m.c === c)) {
        square.classList.add(board[r][c]? 'legal-capture' : 'legal-move');
      }
    }
  }
  turnEl.textContent = turn === 'w'? 'White' : 'Black';
  updateCaptured();
}

function updateCaptured() {
  document.getElementById('capturedWhite').textContent = capturedWhite.map(p => PIECES[p]).join(' ');
  document.getElementById('capturedBlack').textContent = capturedBlack.map(p => PIECES[p]).join(' ');
}

function getColor(piece) {
  return piece === piece.toUpperCase()? 'w' : 'b';
}

// Move Generation - 2D Array Logic
function getLegalMoves(r, c, testBoard = board) {
  const piece = testBoard[r][c];
  if (!piece) return [];

  const color = getColor(piece);
  const type = piece.toLowerCase();
  const moves = [];

  const addMove = (toR, toC) => {
    if (toR < 0 || toR >= 8 || toC < 0 || toC >= 8) return;
    const target = testBoard[toR][toC];
    if (!target || getColor(target)!== color) {
      moves.push({ r: toR, c: toC });
    }
  };

  if (type === 'p') {
    const dir = color === 'w'? -1 : 1;
    const startRow = color === 'w'? 6 : 1;

    if (!testBoard[r + dir]?.[c]) {
      addMove(r + dir, c);
      if (r === startRow &&!testBoard[r + 2*dir]?.[c]) addMove(r + 2*dir, c);
    }
    [-1, 1].forEach(dc => {
      const target = testBoard[r + dir]?.[c + dc];
      if (target && getColor(target)!== color) addMove(r + dir, c + dc);
    });
  } else if (type === 'n') {
    [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]].forEach(([dr, dc]) => {
      addMove(r + dr, c + dc);
    });
  } else {
    const directions = type === 'b'? [[-1,-1],[-1,1],[1,-1],[1,1]] :
                       type === 'r'? [[-1,0],[1,0],[0,-1],[0,1]] :
                       [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];

    directions.forEach(([dr, dc]) => {
      for (let i = 1; i < 8; i++) {
        const nr = r + dr * i, nc = c + dc * i;
        if (nr < 0 || nr >= 8 || nc < 0 || nc >= 8) break;
        const target = testBoard[nr][nc];
        if (!target) {
          moves.push({ r: nr, c: nc });
        } else {
          if (getColor(target)!== color) moves.push({ r: nr, c: nc });
          break;
        }
        if (type === 'k') break; // King moves only 1 square
      }
    });
  }

  // Filter moves that leave king in check
  return moves.filter(move => {
    const newBoard = board.map(row => [...row]);
    newBoard[move.r][move.c] = newBoard[r][c];
    newBoard[r][c] = 0;
    return!isInCheck(color, newBoard);
  });
}

function isInCheck(color, testBoard = board) {
  let kingPos = null;
  const king = color === 'w'? 'K' : 'k';

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (testBoard[r][c] === king) {
        kingPos = { r, c };
        break;
      }
    }
  }
  if (!kingPos) return false;

  // Check if any enemy piece can attack king
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = testBoard[r][c];
      if (piece && getColor(piece)!== color) {
        const moves = getLegalMoves(r, c, testBoard);
        if (moves.some(m => m.r === kingPos.r && m.c === kingPos.c)) return true;
      }
    }
  }
  return false;
}

function getAllMoves(color) {
  const moves = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && getColor(piece) === color) {
        getLegalMoves(r, c).forEach(move => {
          moves.push({ from: { r, c }, to: move });
        });
      }
    }
  }
  return moves;
}

// Board Evaluation
function evaluateBoard() {
  let score = 0;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece) {
        const val = PIECE_VALUES[piece.toLowerCase()];
        score += getColor(piece) === 'w'? val : -val;
        // Center control bonus
        if ((r === 3 || r === 4) && (c === 3 || c === 4)) {
          score += getColor(piece) === 'w'? 10 : -10;
        }
      }
    }
  }
  return score;
}

// Minimax with Alpha-Beta Pruning
function minimax(depth, alpha, beta, maximizing) {
  if (depth === 0) return evaluateBoard();

  const color = maximizing? 'w' : 'b';
  const moves = getAllMoves(color);

  if (moves.length === 0) {
    return isInCheck(color)? (maximizing? -99999 : 99999) : 0;
  }

  if (maximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      const piece = board[move.from.r][move.from.c];
      const captured = board[move.to.r][move.to.c];

      board[move.to.r][move.to.c] = piece;
      board[move.from.r][move.from.c] = 0;

      const eval = minimax(depth - 1, alpha, beta, false);

      board[move.from.r][move.from.c] = piece;
      board[move.to.r][move.to.c] = captured;

      maxEval = Math.max(maxEval, eval);
      alpha = Math.max(alpha, eval);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      const piece = board[move.from.r][move.from.c];
      const captured = board[move.to.r][move.to.c];

      board[move.to.r][move.to.c] = piece;
      board[move.from.r][move.from.c] = 0;

      const eval = minimax(depth - 1, alpha, beta, true);

      board[move.from.r][move.from.c] = piece;
      board[move.to.r][move.to.c] = captured;

      minEval = Math.min(minEval, eval);
      beta = Math.min(beta, eval);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

function getBestMove() {
  const moves = getAllMoves(turn);
  if (moves.length === 0) return null;

  let bestMove = null;
  let bestValue = turn === 'w'? -Infinity : Infinity;

  for (const move of moves) {
    const piece = board[move.from.r][move.from.c];
    const captured = board[move.to.r][move.to.c];

    board[move.to.r][move.to.c] = piece;
    board[move.from.r][move.from.c] = 0;

    const value = minimax(aiDepth - 1, -Infinity, Infinity, turn === 'b');

    board[move.from.r][move.from.c] = piece;
    board[move.to.r][move.to.c] = captured;

    if (turn === 'w' && value > bestValue) {
      bestValue = value;
      bestMove = move;
    } else if (turn === 'b' && value < bestValue) {
      bestValue = value;
      bestMove = move;
    }
  }
  return bestMove;
}

// Game Logic
function makeMove(from, to) {
  const piece = board[from.r][from.c];
  const captured = board[to.r][to.c];

  if (captured) {
    if (getColor(captured) === 'w') capturedWhite.push(captured);
    else capturedBlack.push(captured);
  }

  board[to.r][to.c] = piece;
  board[from.r][from.c] = 0;
  lastMove = { from, to };

  moveHistory.push({ board: board.map(r => [...r]), turn, captured });

  turn = turn === 'w'? 'b' : 'w';
  selectedSquare = null;
  legalMoves = [];
  renderBoard();

  if (getAllMoves(turn).length === 0) {
    setTimeout(() => {
      if (isInCheck(turn)) {
        gameOverText.textContent = 'Checkmate!';
        gameOverSubtext.textContent = turn === 'w'? 'Black wins' : 'White wins';
      } else {
        gameOverText.textContent = 'Stalemate!';
        gameOverSubtext.textContent = 'Draw';
      }
      setGameState(GameState.GAME_OVER);
    }, 500);
    return;
  }

  if (turn!== humanColor && gameActive) {
    statusEl.textContent = 'AI thinking...';
    setTimeout(() => {
      const aiMove = getBestMove();
      if (aiMove) {
        makeMove(aiMove.from, aiMove.to);
        statusEl.textContent = 'Your move';
      }
    }, 500);
  }
}

function handleSquareClick(r, c) {
  if (!gameActive || turn!== humanColor) return;

  const piece = board[r][c];

  if (selectedSquare) {
    if (legalMoves.some(m => m.r === r && m.c === c)) {
      makeMove(selectedSquare, { r, c });
    } else {
      selectedSquare = null;
      legalMoves = [];
      if (piece && getColor(piece) === turn) {
        selectedSquare = { r, c };
        legalMoves = getLegalMoves(r, c);
      }
      renderBoard();
    }
  } else if (piece && getColor(piece) === turn) {
    selectedSquare = { r, c };
    legalMoves = getLegalMoves(r, c);
    renderBoard();
  }
}

function handleDragStart(e, r, c) {
  if (!gameActive || turn!== humanColor) return;
  const piece = board[r][c];
  if (!piece || getColor(piece)!== turn) return;

  e.preventDefault();
  selectedSquare = { r, c };
  legalMoves = getLegalMoves(r, c);
  renderBoard();

  const touch = e.touches? e.touches[0] : e;
  draggedPiece = { piece, fromR: r, fromC: c };
  dragOffsetX = touch.clientX;
  dragOffsetY = touch.clientY;

  document.addEventListener('mousemove', handleDragMove);
  document.addEventListener('mouseup', handleDragEnd);
  document.addEventListener('touchmove', handleDragMove, { passive: false });
  document.addEventListener('touchend', handleDragEnd);
}

function handleDragMove(e) {
  if (!draggedPiece) return;
  e.preventDefault();

  const touch = e.touches? e.touches[0] : e;
  const boardRect = boardEl.getBoundingClientRect();
  const x = touch.clientX - boardRect.left;
  const y = touch.clientY - boardRect.top;

  // Show drag ghost
}

function handleDragEnd(e) {
  if (!draggedPiece) return;

  const touch = e.changedTouches? e.changedTouches[0] : e;
  const boardRect = boardEl.getBoundingClientRect();
  const x = touch.clientX - boardRect.left;
  const y = touch.clientY - boardRect.top;

  const c = Math.floor(x / (boardRect.width / 8));
  const r = Math.floor(y / (boardRect.height / 8));

  if (legalMoves.some(m => m.r === r && m.c === c)) {
    makeMove(draggedPiece.fromR, draggedPiece.fromC, r, c);
  }

  draggedPiece = null;
  selectedSquare = null;
  legalMoves = [];
  renderBoard();

  document.removeEventListener('mousemove', handleDragMove);
  document.removeEventListener('mouseup', handleDragEnd);
  document.removeEventListener('touchmove', handleDragMove);
  document.removeEventListener('touchend', handleDragEnd);
}

function startNewGame(color) {
  humanColor = color;
  gameActive = true;
  initBoard();
  setGameState(GameState.PLAYING);

  if (humanColor === 'b') {
    setTimeout(() => {
      const aiMove = getBestMove();
      if (aiMove) makeMove(aiMove.from, aiMove.to);
    }, 500);
  }
}

// Button events
startBtn.addEventListener('click', () => startNewGame('w'));
startBlackBtn.addEventListener('click', () => startNewGame('b'));
restartBtn.addEventListener('click', () => startNewGame(humanColor));
menuBtn.addEventListener('click', () => {
  gameActive = false;
  setGameState(GameState.MENU);
});

undoBtn.addEventListener('click', () => {
  if (moveHistory.length >= 2) {
    moveHistory.pop();
    moveHistory.pop();
    const last = moveHistory[moveHistory.length - 1];
    if (last) {
      board = last.board.map(r => [...r]);
      turn = last.turn;
      renderBoard();
    }
  }
});

newGameBtn.addEventListener('click', () => startNewGame(humanColor));

// Init
initBoard();
setGameState(GameState.MENU);