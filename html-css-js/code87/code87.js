const PIECES = {
  'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
  'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
};

const PIECE_VALUES = { 'p': 1, 'n': 3, 'b': 3, 'r': 5, 'q': 9, 'k': 0 };

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
      [null, null, null, null, null, null],
      [null, null, null, null],
      [null, null, null, null, null, null],
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
    if (this.gameOver) return;
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
      if (square && (square.rank !== this.selectedSquare.rank || square.file !== this.selectedSquare.file)) {
        this.tryMove(square.rank, square.file);
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
    this.selectedSquare = { rank, file };
    this.legalMoves = this.getLegalMoves(rank, file);
    this.updateHighlights();
  }

  tryMove(toRank, toFile) {
    if (!this.selectedSquare) return;

    const fromRank = this.selectedSquare.rank;
    const fromFile = this.selectedSquare.file;
    const move = this.legalMoves.find(m => m.toRank === toRank && m.toFile === toFile);

    if (move) {
      this.makeMove(fromRank, fromFile, toRank, toFile, move);
    }

    this.selectedSquare = null;
    this.legalMoves = [];
    this.updateHighlights();
  }

  makeMove(fromRank, fromFile, toRank, toFile, moveInfo = null) {
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

    // Handle special moves
    let isEnPassant = false;
    let isCastling = false;
    let promotionPiece = null;

    if (piece.toLowerCase() === 'p') {
      // En passant
      if (this.enPassant && toRank === this.enPassant.rank && toFile === this.enPassant.file) {
        isEnPassant = true;
        this.board[fromRank][toFile] = null;
      }
      // Promotion
      if (toRank === 0 || toRank === 7) {
        if (moveInfo?.promotion) {
          promotionPiece = moveInfo.promotion;
        } else {
          this.showPromotionDialog(toRank, toFile, fromRank, fromFile);
          return;
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

    // Update castling rights
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

    // Set en passant
    this.enPassant = null;
    if (piece.toLowerCase() === 'p' && Math.abs(toRank - fromRank) === 2) {
      this.enPassant = { rank: (fromRank + toRank) / 2, file: fromFile };
    }

    // Make the move
    this.board[toRank][toFile] = promotionPiece || piece;
    this.board[fromRank][fromFile] = null;

    // Update move clocks
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

    this.renderBoard();
    this.updateUI();
    this.checkGameState();
  }

  showPromotionDialog(toRank, toFile, fromRank, fromFile) {
    const modal = document.getElementById('promotionModal');
    const choices = document.getElementById('promotionChoices');
    choices.innerHTML = '';

    const pieces = this.turn === 'w' ? ['Q', 'R', 'B', 'N'] : ['q', 'r', 'b', 'n'];
    pieces.forEach(piece => {
      const btn = document.createElement('div');
      btn.className = 'promotion-piece';
      btn.textContent = PIECES[piece];
      btn.addEventListener('click', () => {
        modal.classList.remove('active');
        this.makeMove(fromRank, fromFile, toRank, toFile, { promotion: piece });
      });
      choices.appendChild(btn);
    });

    modal.classList.add('active');
  }

  getLegalMoves(rank, file) {
    const piece = this.board[rank][file];
    if (!piece || this.getPieceColor(piece) !== this.turn) return [];

    const pseudoLegal = this.getPseudoLegalMoves(rank, file);
    return pseudoLegal.filter(move => {
      const boardCopy = this.board.map(row => [...row]);
      boardCopy[move.toRank][move.toFile] = piece;
      boardCopy[rank][file] = null;
      return !this.isInCheck(this.turn, boardCopy);
    });
  }

  getPseudoLegalMoves(rank, file) {
    const piece = this.board[rank][file];
    const moves = [];
    const type = piece.toLowerCase();

    if (type === 'p') {
      const dir = this.getPieceColor(piece) === 'w' ? -1 : 1;
      const startRank = this.getPieceColor(piece) === 'w' ? 6 : 1;

      // Forward
      if (this.board[rank + dir]?.[file] === null) {
        moves.push({ toRank: rank + dir, toFile: file });
        if (rank === startRank && this.board[rank + 2 * dir]?.[file] === null) {
          moves.push({ toRank: rank + 2 * dir, toFile: file });
        }
      }

      // Captures
      for (const df of [-1, 1]) {
        const newFile = file + df;
        if (newFile >= 0 && newFile < 8) {
          const target = this.board[rank + dir]?.[newFile];
          if (target && this.getPieceColor(target) !== this.getPieceColor(piece)) {
            moves.push({ toRank: rank + dir, toFile: newFile });
          }
          // En passant
          if (this.enPassant && rank + dir === this.enPassant.rank && newFile === this.enPassant.file) {
            moves.push({ toRank: rank + dir, toFile: newFile });
          }
        }
      }
    } else if (type === 'n') {
      const knightMoves = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1]
      ];
      for (const [dr, df] of knightMoves) {
        const newRank = rank + dr;
        const newFile = file + df;
        if (newRank >= 0 && newRank < 8 && newFile >= 0 && newFile < 8) {
          const target = this.board[newRank][newFile];
          if (!target || this.getPieceColor(target) !== this.getPieceColor(piece)) {
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
          const target = this.board[newRank][newFile];
          if (!target) {
            moves.push({ toRank: newRank, toFile: newFile });
          } else {
            if (this.getPieceColor(target) !== this.getPieceColor(piece)) {
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
            const target = this.board[newRank][newFile];
            if (!target || this.getPieceColor(target) !== this.getPieceColor(piece)) {
              moves.push({ toRank: newRank, toFile: newFile });
            }
          }
        }
      }

      // Castling
      if (!this.isInCheck(this.turn)) {
        const kingRank = this.getPieceColor(piece) === 'w' ? 7 : 0;
        if (rank === kingRank && file === 4) {
          // Kingside
          if (this.turn === 'w' ? this.castling.wK : this.castling.bK) {
            if (!this.board[kingRank][5] && !this.board[kingRank][6] &&
                !this.isSquareAttacked(kingRank, 5, this.turn === 'w' ? 'b' : 'w') &&
                !this.isSquareAttacked(kingRank, 6, this.turn === 'w' ? 'b' : 'w')) {
              moves.push({ toRank: kingRank, toFile: 6 });
            }
          }
          // Queenside
          if (this.turn === 'w' ? this.castling.wQ : this.castling.bQ) {
            if (!this.board[kingRank][1] && !this.board[kingRank][2] && !this.board[kingRank][3] &&
                !this.isSquareAttacked(kingRank, 2, this.turn === 'w' ? 'b' : 'w') &&
                !this.isSquareAttacked(kingRank, 3, this.turn === 'w' ? 'b' : 'w')) {
              moves.push({ toRank: kingRank, toFile: 2 });
            }
          }
        }
      }
    }

    return moves;
  }

  isSquareAttacked(rank, file, byColor, board = this.board) {
    for (let r = 0; r < 8; r++) {
      for (let f = 0; f < 8; f++) {
        const piece = board[r][f];
        if (piece && this.getPieceColor(piece) === byColor) {
          const moves = this.getPseudoLegalMovesWithoutCastling(r, f, board);
          if (moves.some(m => m.toRank === rank && m.toFile === file)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  getPseudoLegalMovesWithoutCastling(rank, file, board = this.board) {
    const oldBoard = this.board;
    this.board = board;
    const moves = this.getPseudoLegalMoves(rank, file);
    this.board = oldBoard;
    return moves.filter(m => {
      const piece = board[rank][file];
      if (piece.toLowerCase() === 'k' && Math.abs(m.toFile - file) === 2) {
        return false; // Exclude castling
      }
      return true;
    });
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
    }

    return this.isSquareAttacked(kingRank, kingFile, color === 'w' ? 'b' : 'w', board);
  }

  hasLegalMoves(color) {
    for (let r = 0; r < 8; r++) {
      for (let f = 0; f < 8; f++) {
        const piece = this.board[r][f];
        if (piece && this.getPieceColor(piece) === color) {
          if (this.getLegalMoves(r, f).length > 0) {
            return true;
          }
        }
      }
    }
    return false;
  }

  checkGameState() {
    const inCheck = this.isInCheck(this.turn);
    const hasMoves = this.hasLegalMoves(this.turn);

    if (!hasMoves) {
      this.gameOver = true;
      if (inCheck) {
        this.showGameOver(
          'Checkmate!',
          `${this.turn === 'w' ? 'Black' : 'White'} wins by checkmate`
        );
      } else {
        this.showGameOver('Stalemate!', 'Game drawn by stalemate');
      }
    } else if (inCheck) {
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

    return notation;
  }

  updateHighlights() {
    const squares = document.querySelectorAll('.square');
    squares.forEach(square => {
      square.classList.remove('selected', 'legal-move', 'legal-capture', 'last-move', 'check', 'highlight');
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
          if (target || (this.enPassant && move.toRank === this.enPassant.rank && move.toFile === this.enPassant.file)) {
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
    
    turnIndicator.className = `turn-indicator ${this.turn === 'w' ? 'white' : 'black'}`;
    statusText.textContent = `${this.turn === 'w' ? 'White' : 'Black'} to move`;

    if (this.isInCheck(this.turn)) {
      gameStateText.textContent = 'Check!';
      gameStateText.style.color = '#e74c3c';
    } else {
      gameStateText.textContent = '';
    }

    document.getElementById('undoBtn').disabled = this.history.length === 0;

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
    const initialPieces = {
      'P': 8, 'N': 2, 'B': 2, 'R': 2, 'Q': 1, 'K': 1,
      'p': 8, 'n': 2, 'b': 2, 'r': 2, 'q': 1, 'k': 1
    };

    const currentPieces = {
      'P': 0, 'N': 0, 'B': 0, 'R': 0, 'Q': 0, 'K': 0,
      'p': 0, 'n': 0, 'b': 0, 'r': 0, 'q': 0, 'k': 0
    };

    for (let r = 0; r < 8; r++) {
      for (let f = 0; f < 8; f++) {
        const piece = this.board[r][f];
        if (piece) currentPieces[piece]++;
      }
    }

    const whiteCaptured = document.getElementById('capturedWhite');
    const blackCaptured = document.getElementById('capturedBlack');
    whiteCaptured.innerHTML = '';
    blackCaptured.innerHTML = '';

    for (const piece in initialPieces) {
      const captured = initialPieces[piece] - currentPieces[piece];
      for (let i = 0; i < captured; i++) {
        const el = document.createElement('span');
        el.textContent = PIECES[piece];
        if (this.getPieceColor(piece) === 'w') {
          blackCaptured.appendChild(el);
        } else {
          whiteCaptured.appendChild(el);
        }
      }
    }
  }

  undoMove() {
    if (this.history.length === 0) return;

    const lastState = this.history.pop();
    this.board = lastState.board;
    this.turn = lastState.turn;
    this.castling = lastState.castling;
    this.enPassant = lastState.enPassant;
    this.halfMoveClock = lastState.halfMoveClock;
    this.fullMoveNumber = lastState.fullMoveNumber;
    this.lastMove = lastState.lastMove;
    this.gameOver = false;
    this.selectedSquare = null;
    this.legalMoves = [];

    this.renderBoard();
    this.updateUI();
  }

  newGame() {
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

    this.renderBoard();
    this.updateUI();
    this.showNotification('New game started!');
  }

  flipBoard() {
    this.flipped = !this.flipped;
    this.renderBoard();
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
    setTimeout(() => notification.remove(), 3000);
  }
}

new ChessGame();