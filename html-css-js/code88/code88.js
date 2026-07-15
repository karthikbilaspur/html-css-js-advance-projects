const PIECES = {
  'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
  'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
};

const PIECE_VALUES = { 'p': 100, 'n': 320, 'b': 330, 'r': 500, 'q': 900, 'k': 20000 };

const POS_TABLES = {
  'p': [
    [ 0,  0,  0,  0,  0,  0,  0,  0],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [ 5,  5, 10, 25, 25, 10,  5,  5],
    [ 0,  0, 20, 20,  0,  0],
    [ 5, -5,-10,  0,  0,-10, -5,  5],
    [ 5, 10, 10,-20,-20, 10, 10,  5],
    [ 0,  0]
  ],
  'n': [
    [-50,-40,-30,-30,-30,-30,-40,-50],
    [-40,-20,  0,  0,-20,-40],
    [-30,  0, 10, 15, 15, 10,  0,-30],
    [-30,  5, 15, 20, 20, 15,  5,-30],
    [-30,  0, 15, 20, 20, 15,  0,-30],
    [-30,  5, 10, 15, 15, 10,  5,-30],
    [-40,-20,  0,  5,  0,-20,-40],
    [-50,-40,-30,-30,-40,-50]
  ],
  'b': [
    [-20,-10,-10,-10,-10,-20],
    [-10,  0,  0,-10],
    [-10,  0,  5, 10, 10,  5,  0,-10],
    [-10,  5,  5, 10, 10,  5,  5,-10],
    [-10,  0, 10, 10, 10, 10,  0,-10],
    [-10, 10, 10, 10, 10, 10, 10,-10],
    [-10,  5,  0,  0,  0,  0,  5,-10],
    [-20,-10,-10,-10,-10,-10,-10,-20]
  ],
  'r': [
    [ 0,  0,  0,  0,  0,  0],
    [ 5, 10, 10, 10, 10, 10, 10,  5],
    [-5,  0,  0,  0, -5],
    [-5,  0,  0, -5],
    [-5,  0, -5],
    [-5,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0, -5],
    [ 0,  0,  0,  5,  5,  0,  0,  0]
  ],
  'q': [
    [-20,-10,-10, -5, -5,-10,-10,-20],
    [-10,  0,  0,-10],
    [-10,  0,  5,  0,-10],
    [ -5,  0,  5,  0, -5],
    [  0,  5,  0, -5],
    [-10,  5,  5,  5,  0,-10],
    [-10,  0,  5,  0,  0,  0,  0,-10],
    [-20,-10,-10, -5, -5,-10,-10,-20]
  ],
  'k': [
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-20,-30,-30,-40,-40,-30,-30,-20],
    [-10,-20,-20,-20,-20,-20,-20,-10],
    [ 20, 20,  0,  0, 20, 20],
    [ 20, 30, 10,  0, 10, 30, 20]
  ]
};

class ChessGame {
  constructor() {
    this.board = this.initBoard();
    this.turn = 'w';
    this.castling = { wK: true, wQ: true, bK: true, bQ: true };
    this.enPassant = null;
    this.halfMoveClock = 0;
    this.fullMoveNumber = 1;
    this.history = [];
    this.selectedSquare = null;
    this.legalMoves = [];
    this.lastMove = null;
    this.flipped = false;
    this.gameOver = false;
    this.draggedPiece = null;
    this.dragOffset = { x: 0, y: 0 };
    this.aiEnabled = false;
    this.aiThinking = false;
    this.soundEnabled = true;
    this.promotionResolver = null;
    
    this.attackCache = new Map();
    this.moveGenCache = new Map();
    
    this.init();
  }

  init() {
    this.renderBoard();
    this.setupEventListeners();
    this.updateUI();
  }

  initBoard() {
    return [
      ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
      ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null],
      ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
      ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
    ];
  }

  renderBoard() {
    const boardEl = document.getElementById('board');
    boardEl.innerHTML = '';

    for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
        const displayRank = this.flipped ? 7 - rank : rank;
        const displayFile = this.flipped ? 7 - file : file;
        
        const square = document.createElement('div');
        square.className = `square ${(rank + file) % 2 === 0 ? 'light' : 'dark'}`;
        square.dataset.rank = displayRank;
        square.dataset.file = displayFile;

        if (file === 0) {
          const rankCoord = document.createElement('div');
          rankCoord.className = 'coordinates rank-coord';
          rankCoord.textContent = 8 - displayRank;
          square.appendChild(rankCoord);
        }
        if (rank === 7) {
          const fileCoord = document.createElement('div');
          fileCoord.className = 'coordinates file-coord';
          fileCoord.textContent = String.fromCharCode(97 + displayFile);
          square.appendChild(fileCoord);
        }

        const piece = this.board[displayRank][displayFile];
        if (piece) {
          const pieceEl = document.createElement('div');
          pieceEl.className = 'piece';
          pieceEl.textContent = PIECES[piece];
          pieceEl.dataset.piece = piece;
          pieceEl.draggable = false;
          square.appendChild(pieceEl);
        }

        boardEl.appendChild(square);
      }
    }

    this.updateHighlights();
  }

  setupEventListeners() {
    const board = document.getElementById('board');
    
    board.addEventListener('mousedown', (e) => this.handleMouseDown(e));
    board.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    board.addEventListener('mouseup', (e) => this.handleMouseUp(e));
    board.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
    board.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
    board.addEventListener('touchend', (e) => this.handleTouchEnd(e));

    document.getElementById('newGameBtn').addEventListener('click', () => this.newGame());
    document.getElementById('undoBtn').addEventListener('click', () => this.undoMove());
    document.getElementById('flipBoardBtn').addEventListener('click', () => this.flipBoard());
    document.getElementById('aiToggleBtn').addEventListener('click', () => this.toggleAI());
    document.getElementById('soundToggleBtn').addEventListener('click', () => this.toggleSound());
    document.getElementById('gameOverNewGameBtn').addEventListener('click', () => {
      document.getElementById('gameOverModal').classList.remove('active');
      this.newGame();
    });
  }

  getSquareFromEvent(e) {
    const board = document.getElementById('board');
    const rect = board.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
    const squareSize = rect.width / 8;
    const file = Math.floor(x / squareSize);
    const rank = Math.floor(y / squareSize);
    
    if (file >= 0 && file < 8 && rank >= 0 && rank < 8) {
      const square = board.children[rank * 8 + file];
      return {
        rank: parseInt(square.dataset.rank),
        file: parseInt(square.dataset.file),
        element: square
      };
    }
    return null;
  }

  handleMouseDown(e) {
    if (this.gameOver || this.aiThinking) return;
    if (this.aiEnabled && this.turn === 'b') return;
    
    const square = this.getSquareFromEvent(e);
    if (!square) return;

    const piece = this.board[square.rank][square.file];
    if (piece && this.getPieceColor(piece) === this.turn) {
      this.selectSquare(square.rank, square.file);
      this.startDrag(e, square);
    } else if (this.selectedSquare) {
      this.tryMove(square.rank, square.file);
    }
  }

  handleMouseMove(e) {
    if (this.draggedPiece) {
      this.updateDragPosition(e);
    }
  }

  handleMouseUp(e) {
    if (this.draggedPiece) {
      const square = this.getSquareFromEvent(e);
      if (square && (square.rank !== this.selectedSquare?.rank || square.file !== this.selectedSquare?.file)) {
        this.tryMove(square.rank, square.file);
      } else {
        this.clearSelection();
      }
      this.endDrag();
    }
  }

  handleTouchStart(e) {
    e.preventDefault();
    this.handleMouseDown(e);
  }

  handleTouchMove(e) {
    e.preventDefault();
    this.handleMouseMove(e);
  }

  handleTouchEnd(e) {
    e.preventDefault();
    const touch = e.changedTouches[0];
    this.handleMouseUp({ clientX: touch.clientX, clientY: touch.clientY });
  }

  startDrag(e, square) {
    const pieceEl = square.element.querySelector('.piece');
    if (!pieceEl) return;

    this.draggedPiece = pieceEl;
    pieceEl.classList.add('dragging');
    
    const rect = pieceEl.getBoundingClientRect();
    this.dragOffset = {
      x: (e.clientX || e.touches?.[0]?.clientX) - rect.left - rect.width / 2,
      y: (e.clientY || e.touches?.[0]?.clientY) - rect.top - rect.height / 2
    };
    
    this.updateDragPosition(e);
  }

  updateDragPosition(e) {
    if (!this.draggedPiece) return;
    const x = (e.clientX || e.touches?.[0]?.clientX) - this.dragOffset.x;
    const y = (e.clientY || e.touches?.[0]?.clientY) - this.dragOffset.y;
    this.draggedPiece.style.left = x + 'px';
    this.draggedPiece.style.top = y + 'px';
  }

  endDrag() {
    if (this.draggedPiece) {
      this.draggedPiece.classList.remove('dragging');
      this.draggedPiece.style.left = '';
      this.draggedPiece.style.top = '';
      this.draggedPiece = null;
    }
  }

  selectSquare(rank, file) {
    this.clearCaches();
    this.selectedSquare = { rank, file };
    this.legalMoves = this.getLegalMoves(rank, file);
    this.updateHighlights();
  }

  clearSelection() {
    this.selectedSquare = null;
    this.legalMoves = [];
    this.updateHighlights();
  }

  tryMove(toRank, toFile) {
    if (!this.selectedSquare || this.aiThinking) return;

    const fromRank = this.selectedSquare.rank;
    const fromFile = this.selectedSquare.file;
    const move = this.legalMoves.find(m => m.toRank === toRank && m.toFile === toFile);

    if (move) {
      this.makeMove(fromRank, fromFile, toRank, toFile, move);
      if (!this.gameOver && this.aiEnabled && this.turn === 'b') {
        setTimeout(() => this.makeAIMove(), 300);
      }
    }

    this.clearSelection();
  }

  async makeMove(fromRank, fromFile, toRank, toFile, moveInfo = null) {
    const piece = this.board[fromRank][fromFile];
    const captured = this.board[toRank][toFile];
    
    const historyEntry = {
      board: this.board.map(row => [...row]),
      turn: this.turn,
      castling: { ...this.castling },
      enPassant: this.enPassant,
      halfMoveClock: this.halfMoveClock,
      fullMoveNumber: this.fullMoveNumber,
      move: { fromRank, fromFile, toRank, toFile, piece, captured },
      lastMove: this.lastMove
    };

    let isEnPassant = false;
    let isCastling = false;
    let promotionPiece = null;

    if (piece.toLowerCase() === 'p') {
      if (this.enPassant && toRank === this.enPassant.rank && toFile === this.enPassant.file) {
        isEnPassant = true;
        this.board[fromRank][toFile] = null;
      }
      if (toRank === 0 || toRank === 7) {
        if (moveInfo?.promotion) {
          promotionPiece = moveInfo.promotion;
        } else {
          promotionPiece = await this.showPromotionDialog(this.turn);
        }
      }
    }

    if (piece.toLowerCase() === 'k' && Math.abs(toFile - fromFile) === 2) {
      isCastling = true;
      const rookFromFile = toFile > fromFile ? 7 : 0;
      const rookToFile = toFile > fromFile ? 5 : 3;
      this.board[toRank][rookToFile] = this.board[toRank][rookFromFile];
      this.board[toRank][rookFromFile] = null;
    }

    if (piece === 'K') {
      this.castling.wK = false;
      this.castling.wQ = false;
    } else if (piece === 'k') {
      this.castling.bK = false;
      this.castling.bQ = false;
    } else if (piece === 'R') {
      if (fromRank === 7 && fromFile === 0) this.castling.wQ = false;
      if (fromRank === 7 && fromFile === 7) this.castling.wK = false;
    } else if (piece === 'r') {
      if (fromRank === 0 && fromFile === 0) this.castling.bQ = false;
      if (fromRank === 0 && fromFile === 7) this.castling.bK = false;
    }

    if (captured === 'r' && toRank === 0 && toFile === 0) this.castling.bQ = false;
    if (captured === 'r' && toRank === 0 && toFile === 7) this.castling.bK = false;
    if (captured === 'R' && toRank === 7 && toFile === 0) this.castling.wQ = false;
    if (captured === 'R' && toRank === 7 && toFile === 7) this.castling.wK = false;

    this.enPassant = null;
    if (piece.toLowerCase() === 'p' && Math.abs(toRank - fromRank) === 2) {
      this.enPassant = { rank: (fromRank + toRank) / 2, file: fromFile };
    }

    this.board[toRank][toFile] = promotionPiece || piece;
    this.board[fromRank][fromFile] = null;

    if (piece.toLowerCase() === 'p' || captured) {
      this.halfMoveClock = 0;
    } else {
      this.halfMoveClock++;
    }

    if (this.turn === 'b') {
      this.fullMoveNumber++;
    }

    historyEntry.notation = this.getMoveNotation(historyEntry.move, isEnPassant, isCastling, promotionPiece);
    this.history.push(historyEntry);
    
    this.lastMove = { fromRank, fromFile, toRank, toFile };
    this.turn = this.turn === 'w' ? 'b' : 'w';

    this.clearCaches();
    this.playSound(captured ? 'capture' : 'move');
    this.renderBoard();
    this.updateUI();
    this.checkGameState();
  }

  showPromotionDialog(color) {
    return new Promise((resolve) => {
      const modal = document.getElementById('promotionModal');
      const choices = document.getElementById('promotionChoices');
      choices.innerHTML = '';

      const pieces = color === 'w' ? ['Q', 'R', 'B', 'N'] : ['q', 'r', 'b', 'n'];
      pieces.forEach(piece => {
        const btn = document.createElement('div');
        btn.className = 'promotion-piece';
        btn.textContent = PIECES[piece];
        btn.addEventListener('click', () => {
          modal.classList.remove('active');
          resolve(piece);
        });
        choices.appendChild(btn);
      });

      modal.classList.add('active');
    });
  }

  getLegalMoves(rank, file) {
    const piece = this.board[rank][file];
    if (!piece || this.getPieceColor(piece) !== this.turn) return [];

    const cacheKey = `${rank},${file},${this.turn},${this.boardToFen()}`;
    if (this.moveGenCache.has(cacheKey)) {
      return this.moveGenCache.get(cacheKey);
    }

    const pseudoLegal = this.getPseudoLegalMoves(rank, file, this.board);
    const legal = pseudoLegal.filter(move => {
      const boardCopy = this.board.map(row => [...row]);
      boardCopy[move.toRank][move.toFile] = piece;
      boardCopy[rank][file] = null;
      
      if (piece.toLowerCase() === 'p' && this.enPassant && 
          move.toRank === this.enPassant.rank && move.toFile === this.enPassant.file) {
        boardCopy[this.enPassant.rank + (this.getPieceColor(piece) === 'w' ? 1 : -1)][this.enPassant.file] = null;
      }
      
      return !this.isInCheck(this.turn, boardCopy);
    });

    this.moveGenCache.set(cacheKey, legal);
    return legal;
  }

  getPseudoLegalMoves(rank, file, board) {
    const piece = board[rank][file];
    if (!piece) return [];
    
    const moves = [];
    const type = piece.toLowerCase();
    const color = this.getPieceColor(piece);

    if (type === 'p') {
      const dir = color === 'w' ? -1 : 1;
      const startRank = color === 'w' ? 6 : 1;

      if (board[rank + dir]?.[file] === null) {
        moves.push({ toRank: rank + dir, toFile: file });
        if (rank === startRank && board[rank + 2 * dir]?.[file] === null) {
          moves.push({ toRank: rank + 2 * dir, toFile: file });
        }
      }

      for (const df of [-1, 1]) {
        const newFile = file + df;
        if (newFile >= 0 && newFile < 8) {
          const target = board[rank + dir]?.[newFile];
          if (target && this.getPieceColor(target) !== color) {
            moves.push({ toRank: rank + dir, toFile: newFile });
          }
          if (this.enPassant && rank + dir === this.enPassant.rank && newFile === this.enPassant.file) {
            moves.push({ toRank: rank + dir, toFile: newFile, enPassant: true });
          }
        }
      }
    } else if (type === 'n') {
      const knightMoves = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
      for (const [dr, df] of knightMoves) {
        const newRank = rank + dr;
        const newFile = file + df;
        if (newRank >= 0 && newRank < 8 && newFile >= 0 && newFile < 8) {
          const target = board[newRank][newFile];
          if (!target || this.getPieceColor(target) !== color) {
            moves.push({ toRank: newRank, toFile: newFile });
          }
        }
      }
    } else if (type === 'b' || type === 'r' || type === 'q') {
      const directions = [];
      if (type === 'b' || type === 'q') directions.push([-1, -1], [-1, 1], [1, -1], [1, 1]);
      if (type === 'r' || type === 'q') directions.push([-1, 0], [1, 0], [0, -1], [0, 1]);

      for (const [dr, df] of directions) {
        let newRank = rank + dr;
        let newFile = file + df;
        while (newRank >= 0 && newRank < 8 && newFile >= 0 && newFile < 8) {
          const target = board[newRank][newFile];
          if (!target) {
            moves.push({ toRank: newRank, toFile: newFile });
          } else {
            if (this.getPieceColor(target) !== color) {
              moves.push({ toRank: newRank, toFile: newFile });
            }
            break;
          }
          newRank += dr;
          newFile += df;
        }
      }
    } else if (type === 'k') {
      for (let dr = -1; dr <= 1; dr++) {
        for (let df = -1; df <= 1; df++) {
          if (dr === 0 && df === 0) continue;
          const newRank = rank + dr;
          const newFile = file + df;
          if (newRank >= 0 && newRank < 8 && newFile >= 0 && newFile < 8) {
            const target = board[newRank][newFile];
            if (!target || this.getPieceColor(target) !== color) {
              moves.push({ toRank: newRank, toFile: newFile });
            }
          }
        }
      }

      if (!this.isInCheck(this.turn, board)) {
        const kingRank = color === 'w' ? 7 : 0;
        if (rank === kingRank && file === 4) {
          const canCastleK = this.turn === 'w' ? this.castling.wK : this.castling.bK;
          const canCastleQ = this.turn === 'w' ? this.castling.wQ : this.castling.bQ;
          
          if (canCastleK && !board[kingRank][5] && !board[kingRank][6]) {
            if (!this.isSquareAttacked(kingRank, 5, this.turn === 'w' ? 'b' : 'w', board) &&
                !this.isSquareAttacked(kingRank, 6, this.turn === 'w' ? 'b' : 'w', board)) {
              moves.push({ toRank: kingRank, toFile: 6, castling: 'k' });
            }
          }
          if (canCastleQ && !board[kingRank][1] && !board[kingRank][2] && !board[kingRank][3]) {
            if (!this.isSquareAttacked(kingRank, 2, this.turn === 'w' ? 'b' : 'w', board) &&
                !this.isSquareAttacked(kingRank, 3, this.turn === 'w' ? 'b' : 'w', board)) {
              moves.push({ toRank: kingRank, toFile: 2, castling: 'q' });
            }
          }
        }
      }
    }

    return moves;
  }

  isSquareAttacked(rank, file, byColor, board = this.board) {
    const cacheKey = `${rank},${file},${byColor},${this.boardToFen(board)}`;
    if (this.attackCache.has(cacheKey)) {
      return this.attackCache.get(cacheKey);
    }

    for (let r = 0; r < 8; r++) {
      for (let f = 0; f < 8; f++) {
        const piece = board[r][f];
        if (piece && this.getPieceColor(piece) === byColor) {
          const moves = this.getAttackingMoves(r, f, board);
          if (moves.some(m => m.toRank === rank && m.toFile === file)) {
            this.attackCache.set(cacheKey, true);
            return true;
          }
        }
      }
    }
    this.attackCache.set(cacheKey, false);
    return false;
  }

  getAttackingMoves(rank, file, board) {
    const piece = board[rank][file];
    if (!piece) return [];
    
    const moves = [];
    const type = piece.toLowerCase();
    const color = this.getPieceColor(piece);

    if (type === 'p') {
      const dir = color === 'w' ? -1 : 1;
      for (const df of [-1, 1]) {
        const newFile = file + df;
        if (newFile >= 0 && newFile < 8 && rank + dir >= 0 && rank + dir < 8) {
          moves.push({ toRank: rank + dir, toFile: newFile });
        }
      }
    } else if (type === 'n') {
      const knightMoves = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
      for (const [dr, df] of knightMoves) {
        const newRank = rank + dr;
        const newFile = file + df;
        if (newRank >= 0 && newRank < 8 && newFile >= 0 && newFile < 8) {
          moves.push({ toRank: newRank, toFile: newFile });
        }
      }
    } else if (type === 'b' || type === 'r' || type === 'q') {
      const directions = [];
      if (type === 'b' || type === 'q') directions.push([-1, -1], [-1, 1], [1, -1], [1, 1]);
      if (type === 'r' || type === 'q') directions.push([-1, 0], [1, 0], [0, -1], [0, 1]);

      for (const [dr, df] of directions) {
        let newRank = rank + dr;
        let newFile = file + df;
        while (newRank >= 0 && newRank < 8 && newFile >= 0 && newFile < 8) {
          moves.push({ toRank: newRank, toFile: newFile });
          if (board[newRank][newFile]) break;
          newRank += dr;
          newFile += df;
        }
      }
    } else if (type === 'k') {
      for (let dr = -1; dr <= 1; dr++) {
        for (let df = -1; df <= 1; df++) {
          if (dr === 0 && df === 0) continue;
          const newRank = rank + dr;
          const newFile = file + df;
          if (newRank >= 0 && newRank < 8 && newFile >= 0 && newFile < 8) {
            moves.push({ toRank: newRank, toFile: newFile });
          }
        }
      }
    }

    return moves;
  }

  isInCheck(color, board = this.board) {
    let kingRank, kingFile;
    const king = color === 'w' ? 'K' : 'k';
    
    for (let r = 0; r < 8; r++) {
      for (let f = 0; f < 8; f++) {
        if (board[r][f] === king) {
          kingRank = r;
          kingFile = f;
          break;
        }
      }
      if (kingRank !== undefined) break;
    }

    if (kingRank === undefined) return false;
    return this.isSquareAttacked(kingRank, kingFile, color === 'w' ? 'b' : 'w', board);
  }

  hasLegalMoves(color) {
    for (let r = 0; r < 8; r++) {
      for (let f = 0; f < 8; f++) {
        const piece = this.board[r][f];
        if (piece && this.getPieceColor(piece) === color) {
          const moves = this.getLegalMoves(r, f);
          if (moves.length > 0) return true;
        }
      }
    }
    return false;
  }

  checkGameState() {
    if (this.halfMoveClock >= 100) {
      this.gameOver = true;
      this.showGameOver('Draw', 'Game drawn by 50-move rule');
      return;
    }

    const inCheck = this.isInCheck(this.turn);
    const hasMoves = this.hasLegalMoves(this.turn);

    if (!hasMoves) {
      this.gameOver = true;
      if (inCheck) {
        this.playSound('checkmate');
        this.showGameOver('Checkmate!', `${this.turn === 'w' ? 'Black' : 'White'} wins!`);
      } else {
        this.showGameOver('Stalemate!', 'Game drawn by stalemate');
      }
    } else if (inCheck) {
      this.playSound('check');
      this.showNotification('Check!');
    }
  }

  getPieceColor(piece) {
    return piece === piece.toUpperCase() ? 'w' : 'b';
  }

  getMoveNotation(move, isEnPassant, isCastling, promotion) {
    if (isCastling) {
      return move.toFile > move.fromFile ? 'O-O' : 'O-O-O';
    }

    const piece = move.piece.toLowerCase();
    let notation = '';

    if (piece !== 'p') {
      notation += piece.toUpperCase();
    }

    if (move.captured || isEnPassant) {
      if (piece === 'p') {
        notation += String.fromCharCode(97 + move.fromFile);
      }
      notation += 'x';
    }

    notation += String.fromCharCode(97 + move.toFile) + (8 - move.toRank);

    if (promotion) {
      notation += '=' + promotion.toUpperCase();
    }

    const boardAfter = this.board.map(row => [...row]);
    boardAfter[move.toRank][move.toFile] = promotion || move.piece;
    boardAfter[move.fromRank][move.fromFile] = null;
    
    if (this.isInCheck(this.turn === 'w' ? 'b' : 'w', boardAfter)) {
      notation += '+';
    }

    return notation;
  }

  updateHighlights() {
    const squares = document.querySelectorAll('.square');
    squares.forEach(square => {
      square.classList.remove('selected', 'legal-move', 'legal-capture', 'last-move', 'check');
    });

    if (this.lastMove) {
      this.getSquareElement(this.lastMove.fromRank, this.lastMove.fromFile)?.classList.add('last-move');
      this.getSquareElement(this.lastMove.toRank, this.lastMove.toFile)?.classList.add('last-move');
    }

    if (this.selectedSquare) {
      this.getSquareElement(this.selectedSquare.rank, this.selectedSquare.file)?.classList.add('selected');
      
      this.legalMoves.forEach(move => {
        const square = this.getSquareElement(move.toRank, move.toFile);
        if (square) {
          const target = this.board[move.toRank][move.toFile];
          if (target || move.enPassant) {
            square.classList.add('legal-capture');
          } else {
            square.classList.add('legal-move');
          }
        }
      });
    }

    if (this.isInCheck(this.turn)) {
      for (let r = 0; r < 8; r++) {
        for (let f = 0; f < 8; f++) {
          if (this.board[r][f] === (this.turn === 'w' ? 'K' : 'k')) {
            this.getSquareElement(r, f)?.classList.add('check');
          }
        }
      }
    }
  }

  getSquareElement(rank, file) {
    return document.querySelector(`.square[data-rank="${rank}"][data-file="${file}"]`);
  }

  updateUI() {
    const turnIndicator = document.getElementById('turnIndicator');
    const statusText = document.getElementById('statusText');
    const gameStateText = document.getElementById('gameStateText');
    const aiThinking = document.getElementById('aiThinking');
    
    turnIndicator.className = `turn-indicator ${this.turn === 'w' ? 'white' : 'black'}`;
    statusText.textContent = `${this.turn === 'w' ? 'White' : 'Black'} to move`;

    if (this.isInCheck(this.turn)) {
      gameStateText.textContent = 'Check!';
      gameStateText.style.color = '#e74c3c';
    } else {
      gameStateText.textContent = '';
    }

    if (this.aiThinking) {
      aiThinking.innerHTML = '<span class="thinking">AI thinking...</span>';
    } else {
      aiThinking.textContent = '';
    }

    document.getElementById('undoBtn').disabled = this.history.length === 0 || this.aiThinking;
    document.getElementById('aiToggleBtn').textContent = `AI: ${this.aiEnabled ? 'ON' : 'OFF'}`;
    document.getElementById('aiToggleBtn').classList.toggle('toggle-active', this.aiEnabled);

    this.updateMoveHistory();
    this.updateCapturedPieces();
  }

  updateMoveHistory() {
    const historyEl = document.getElementById('moveHistory');
    historyEl.innerHTML = '';

    for (let i = 0; i < this.history.length; i += 2) {
      const moveNumber = Math.floor(i / 2) + 1;
      const whiteMove = this.history[i];
      const blackMove = this.history[i + 1];

      const row = document.createElement('div');
      row.className = 'move-row';
      
      const numEl = document.createElement('div');
      numEl.className = 'move-number';
      numEl.textContent = moveNumber + '.';
      
      const whiteEl = document.createElement('div');
      whiteEl.className = 'move';
      whiteEl.textContent = whiteMove.notation;
      
      const blackEl = document.createElement('div');
      blackEl.className = 'move';
      blackEl.textContent = blackMove ? blackMove.notation : '';
      
      row.appendChild(numEl);
      row.appendChild(whiteEl);
      row.appendChild(blackEl);
      historyEl.appendChild(row);
    }

    historyEl.scrollTop = historyEl.scrollHeight;
  }

  updateCapturedPieces() {
    const initial = {
      'P': 8, 'N': 2, 'B': 2, 'R': 2, 'Q': 1,
      'p': 8, 'n': 2, 'b': 2, 'r': 2, 'q': 1
    };

    const current = { 'P': 0, 'N': 0, 'B': 0, 'R': 0, 'Q': 0, 'p': 0, 'n': 0, 'b': 0, 'r': 0, 'q': 0 };

    for (let r = 0; r < 8; r++) {
      for (let f = 0; f < 8; f++) {
        const piece = this.board[r][f];
        if (piece && piece !== 'K' && piece !== 'k') current[piece]++;
      }
    }

    const byWhite = document.getElementById('capturedByWhite');
    const byBlack = document.getElementById('capturedByBlack');
    byWhite.innerHTML = '';
    byBlack.innerHTML = '';

    for (const piece in initial) {
      const captured = initial[piece] - current[piece];
      for (let i = 0; i < captured; i++) {
        const el = document.createElement('span');
        el.textContent = PIECES[piece];
        if (this.getPieceColor(piece) === 'w') {
          byBlack.appendChild(el);
        } else {
          byWhite.appendChild(el);
        }
      }
    }
  }

  undoMove() {
    if (this.history.length === 0 || this.aiThinking) return;

    const movesToUndo = this.aiEnabled && this.turn === 'w' ? 2 : 1;
    
    for (let i = 0; i < movesToUndo && this.history.length > 0; i++) {
      const lastState = this.history.pop();
      this.board = lastState.board;
      this.turn = lastState.turn;
      this.castling = lastState.castling;
      this.enPassant = lastState.enPassant;
      this.halfMoveClock = lastState.halfMoveClock;
      this.fullMoveNumber = lastState.fullMoveNumber;
      this.lastMove = lastState.lastMove;
    }

    this.gameOver = false;
    this.clearSelection();
    this.clearCaches();
    this.renderBoard();
    this.updateUI();
    this.playSound('move');
  }

  newGame() {
    if (this.aiThinking) return;
    
    this.board = this.initBoard();
    this.turn = 'w';
    this.castling = { wK: true, wQ: true, bK: true, bQ: true };
    this.enPassant = null;
    this.halfMoveClock = 0;
    this.fullMoveNumber = 1;
    this.history = [];
    this.selectedSquare = null;
    this.legalMoves = [];
    this.lastMove = null;
    this.gameOver = false;

    this.clearCaches();
    this.renderBoard();
    this.updateUI();
    this.showNotification('New game started!');
    this.playSound('start');
  }

  flipBoard() {
    this.flipped = !this.flipped;
    this.renderBoard();
    this.playSound('move');
  }

  toggleAI() {
    this.aiEnabled = !this.aiEnabled;
    this.updateUI();
    this.showNotification(`AI ${this.aiEnabled ? 'enabled' : 'disabled'}`);
    
    if (this.aiEnabled && this.turn === 'b' && !this.gameOver) {
      setTimeout(() => this.makeAIMove(), 500);
    }
  }

  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    document.getElementById('soundToggleBtn').textContent = `Sound: ${this.soundEnabled ? 'ON' : 'OFF'}`;
    this.showNotification(`Sound ${this.soundEnabled ? 'enabled' : 'disabled'}`);
  }

  clearCaches() {
    this.attackCache.clear();
    this.moveGenCache.clear();
  }

  boardToFen(board = this.board) {
    let fen = '';
    for (let r = 0; r < 8; r++) {
      let empty = 0;
      for (let f = 0; f < 8; f++) {
        const piece = board[r][f];
        if (piece) {
          if (empty > 0) { fen += empty; empty = 0; }
          fen += piece;
        } else {
          empty++;
        }
      }
      if (empty > 0) fen += empty;
      if (r < 7) fen += '/';
    }
    return fen;
  }

  // AI with Minimax + Alpha-Beta Pruning - No recursion overflow
  async makeAIMove() {
    if (this.gameOver || this.turn !== 'b') return;
    
    this.aiThinking = true;
    this.updateUI();
    
    // Use setTimeout to allow UI update
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const depth = 3;
    const bestMove = this.getBestMove(depth);
    
    this.aiThinking = false;
    
    if (bestMove) {
      await this.makeMove(bestMove.fromRank, bestMove.fromFile, bestMove.toRank, bestMove.toFile, bestMove);
    }
  }

  getBestMove(depth) {
    let bestScore = -Infinity;
    let bestMove = null;
    const alpha = -Infinity;
    const beta = Infinity;
    
    const allMoves = this.getAllLegalMoves('b');
    
    // Order moves for better pruning - captures first
    allMoves.sort((a, b) => {
      const aCapture = this.board[a.toRank][a.toFile] ? PIECE_VALUES[this.board[a.toRank][a.toFile].toLowerCase()] : 0;
      const bCapture = this.board[b.toRank][b.toFile] ? PIECE_VALUES[this.board[b.toRank][b.toFile].toLowerCase()] : 0;
      return bCapture - aCapture;
    });
    
    for (const move of allMoves) {
      const boardCopy = this.simulateMove(move);
      const score = this.minimax(boardCopy, depth - 1, alpha, beta, false);
      
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }
    
    return bestMove;
  }

  minimax(board, depth, alpha, beta, isMaximizing) {
    if (depth === 0) {
      return this.evaluateBoard(board);
    }

    const color = isMaximizing ? 'b' : 'w';
    const moves = this.getAllLegalMoves(color, board);
    
    if (moves.length === 0) {
      if (this.isInCheck(color, board)) {
        return isMaximizing ? -99999 : 99999;
      }
      return 0; // Stalemate
    }

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (const move of moves) {
        const newBoard = this.simulateMove(move, board);
        const eval_score = this.minimax(newBoard, depth - 1, alpha, beta, false);
        maxEval = Math.max(maxEval, eval_score);
        alpha = Math.max(alpha, eval_score);
        if (beta <= alpha) break; // Alpha-beta pruning
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const move of moves) {
        const newBoard = this.simulateMove(move, board);
        const eval_score = this.minimax(newBoard, depth - 1, alpha, beta, true);
        minEval = Math.min(minEval, eval_score);
        beta = Math.min(beta, eval_score);
        if (beta <= alpha) break; // Alpha-beta pruning
      }
      return minEval;
    }
  }

  getAllLegalMoves(color, board = this.board) {
    const moves = [];
    for (let r = 0; r < 8; r++) {
      for (let f = 0; f < 8; f++) {
        const piece = board[r][f];
        if (piece && this.getPieceColor(piece) === color) {
          const pieceMoves = this.getPseudoLegalMoves(r, f, board);
          for (const move of pieceMoves) {
            const tempBoard = board.map(row => [...row]);
            tempBoard[move.toRank][move.toFile] = piece;
            tempBoard[r][f] = null;
            if (!this.isInCheck(color, tempBoard)) {
              moves.push({ fromRank: r, fromFile: f, ...move });
            }
          }
        }
      }
    }
    return moves;
  }

  simulateMove(move, board = this.board) {
    const newBoard = board.map(row => [...row]);
    newBoard[move.toRank][move.toFile] = newBoard[move.fromRank][move.fromFile];
    newBoard[move.fromRank][move.fromFile] = null;
    return newBoard;
  }

  evaluateBoard(board) {
    let score = 0;
    
    for (let r = 0; r < 8; r++) {
      for (let f = 0; f < 8; f++) {
        const piece = board[r][f];
        if (piece) {
          const val = PIECE_VALUES[piece.toLowerCase()];
          const posVal = POS_TABLES[piece.toLowerCase()][this.getPieceColor(piece) === 'w' ? r : 7 - r][f];
          const pieceScore = val + posVal;
          score += this.getPieceColor(piece) === 'b' ? pieceScore : -pieceScore;
        }
      }
    }
    
    return score;
  }

  playSound(type) {
    if (!this.soundEnabled) return;
    // Simple audio feedback using Web Audio API
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      const sounds = {
        move: [400, 0.05],
        capture: [300, 0.1],
        check: [500, 0.15],
        checkmate: [200, 0.3],
        start: [600, 0.1]
      };
      
      const [freq, duration] = sounds[type] || sounds.move;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Audio not supported, silent fail
    }
  }

  showGameOver(title, message) {
    document.getElementById('gameOverTitle').textContent = title;
    document.getElementById('gameOverMessage').textContent = message;
    document.getElementById('gameOverModal').classList.add('active');
  }

  showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 2500);
  }
}

new ChessGame();