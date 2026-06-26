class ChessGame {
    constructor() {
        this.board = [];
        this.currentTurn = 'white';
        this.selectedSquare = null;
        this.legalMoves = [];
        this.moveHistory = [];
        this.capturedPieces = {white: [], black: []};
        this.isFlipped = false;
        this.lastMove = null;

        this.pieces = {
            white: {k: '♔', q: '♕', r: '♖', b: '♗', n: '♘', p: '♙'},
            black: {k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟'}
        };

        this.init();
    }

    init() {
        this.setupBoard();
        this.createBoard();
        this.bindEvents();
        this.render();
    }

    setupBoard() {
        // Initial position
        this.board = [
            ['r','n','b','q','k','b','n','r'],
            ['p','p','p','p','p','p','p','p'],
            [null,null,null,null,null,null,null,null],
            [null,null,null,null,null,null,null,null],
            [null,null,null,null,null,null,null,null],
            [null,null,null,null,null,null,null,null],
            ['P','P','P','P'],
            ['R','N','B','Q','K','B','N','R']
        ];
    }

    createBoard() {
        const boardEl = document.getElementById('chess-board');
        boardEl.innerHTML = '';

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                square.classList.add('square');
                square.classList.add((row + col) % 2 === 0? 'light' : 'dark');
                square.dataset.row = row;
                square.dataset.col = col;
                square.addEventListener('click', () => this.handleSquareClick(row, col));
                boardEl.appendChild(square);
            }
        }
    }

    bindEvents() {
        document.getElementById('reset-btn').addEventListener('click', () => this.reset());
        document.getElementById('undo-btn').addEventListener('click', () => this.undo());
        document.getElementById('flip-btn').addEventListener('click', () => this.flipBoard());
    }

    render() {
        const squares = document.querySelectorAll('.square');
        squares.forEach(square => {
            const row = parseInt(square.dataset.row);
            const col = parseInt(square.dataset.col);
            const piece = this.board[row][col];

            square.innerHTML = '';
            square.classList.remove('selected', 'legal-move', 'legal-capture', 'last-move', 'in-check');

            if (piece) {
                const pieceEl = document.createElement('span');
                pieceEl.classList.add('piece');
                pieceEl.textContent = this.getPieceSymbol(piece);
                square.appendChild(pieceEl);
            }

            if (this.selectedSquare && this.selectedSquare.row === row && this.selectedSquare.col === col) {
                square.classList.add('selected');
            }

            if (this.legalMoves.some(m => m.row === row && m.col === col)) {
                if (piece) {
                    square.classList.add('legal-capture');
                } else {
                    square.classList.add('legal-move');
                }
            }

            if (this.lastMove &&
                ((this.lastMove.from.row === row && this.lastMove.from.col === col) ||
                 (this.lastMove.to.row === row && this.lastMove.to.col === col))) {
                square.classList.add('last-move');
            }
        });

        document.getElementById('current-turn').textContent =
            this.currentTurn.charAt(0).toUpperCase() + this.currentTurn.slice(1);

        this.updateCaptured();
        this.updateStatus();
    }

    getPieceSymbol(piece) {
        const color = piece === piece.toUpperCase()? 'white' : 'black';
        const type = piece.toLowerCase();
        return this.pieces[color][type];
    }

    handleSquareClick(row, col) {
        const piece = this.board[row][col];
        const pieceColor = piece? (piece === piece.toUpperCase()? 'white' : 'black') : null;

        if (this.selectedSquare) {
            if (this.selectedSquare.row === row && this.selectedSquare.col === col) {
                this.selectedSquare = null;
                this.legalMoves = [];
                this.render();
                return;
            }

            if (this.legalMoves.some(m => m.row === row && m.col === col)) {
                this.makeMove(this.selectedSquare, {row, col});
                this.selectedSquare = null;
                this.legalMoves = [];
                return;
            }
        }

        if (piece && pieceColor === this.currentTurn) {
            this.selectedSquare = {row, col};
            this.legalMoves = this.getLegalMoves(row, col);
            this.render();
        }
    }

    getLegalMoves(row, col) {
        const piece = this.board[row][col];
        if (!piece) return [];

        const moves = this.getPseudoLegalMoves(row, col);
        const color = piece === piece.toUpperCase()? 'white' : 'black';

        // Filter moves that leave king in check
        return moves.filter(move => {
            const boardCopy = this.board.map(r => [...r]);
            boardCopy[move.row][move.col] = piece;
            boardCopy[row][col] = null;
            return!this.isKingInCheck(boardCopy, color);
        });
    }

    getPseudoLegalMoves(row, col) {
        const piece = this.board[row][col].toLowerCase();
        const isWhite = this.board[row][col] === this.board[row][col].toUpperCase();

        switch(piece) {
            case 'p': return this.getPawnMoves(row, col, isWhite);
            case 'r': return this.getRookMoves(row, col, isWhite);
            case 'n': return this.getKnightMoves(row, col, isWhite);
            case 'b': return this.getBishopMoves(row, col, isWhite);
            case 'q': return this.getQueenMoves(row, col, isWhite);
            case 'k': return this.getKingMoves(row, col, isWhite);
            default: return [];
        }
    }

    getPawnMoves(row, col, isWhite) {
        const moves = [];
        const dir = isWhite? -1 : 1;
        const startRow = isWhite? 6 : 1;

        // Forward
        if (this.isInBounds(row + dir, col) &&!this.board[row + dir][col]) {
            moves.push({row: row + dir, col});
            // Double move from start
            if (row === startRow &&!this.board[row + 2*dir][col]) {
                moves.push({row: row + 2*dir, col});
            }
        }

        // Captures
        for (let dc of [-1, 1]) {
            const newRow = row + dir, newCol = col + dc;
            if (this.isInBounds(newRow, newCol)) {
                const target = this.board[newRow][newCol];
                if (target && this.isOpponent(target, isWhite)) {
                    moves.push({row: newRow, col: newCol});
                }
            }
        }

        return moves;
    }

    getRookMoves(row, col, isWhite) {
        return this.getSlidingMoves(row, col, isWhite, [[1,0], [-1,0], [0,1], [0,-1]]);
    }

    getBishopMoves(row, col, isWhite) {
        return this.getSlidingMoves(row, col, isWhite, [[1,1], [1,-1], [-1,1], [-1,-1]]);
    }

    getQueenMoves(row, col, isWhite) {
        return [...this.getRookMoves(row, col, isWhite),...this.getBishopMoves(row, col, isWhite)];
    }

    getSlidingMoves(row, col, isWhite, directions) {
        const moves = [];
        for (let [dr, dc] of directions) {
            let r = row + dr, c = col + dc;
            while (this.isInBounds(r, c)) {
                const target = this.board[r][c];
                if (!target) {
                    moves.push({row: r, col: c});
                } else {
                    if (this.isOpponent(target, isWhite)) {
                        moves.push({row: r, col: c});
                    }
                    break;
                }
                r += dr;
                c += dc;
            }
        }
        return moves;
    }

    getKnightMoves(row, col, isWhite) {
        const moves = [];
        const deltas = [[-2,-1], [-2,1], [-1,-2], [-1,2], [1,-2], [1,2], [2,-1], [2,1]];

        for (let [dr, dc] of deltas) {
            const r = row + dr, c = col + dc;
            if (this.isInBounds(r, c)) {
                const target = this.board[r][c];
                if (!target || this.isOpponent(target, isWhite)) {
                    moves.push({row: r, col: c});
                }
            }
        }
        return moves;
    }

    getKingMoves(row, col, isWhite) {
        const moves = [];
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                const r = row + dr, c = col + dc;
                if (this.isInBounds(r, c)) {
                    const target = this.board[r][c];
                    if (!target || this.isOpponent(target, isWhite)) {
                        moves.push({row: r, col: c});
                    }
                }
            }
        }
        return moves;
    }

    makeMove(from, to) {
        const piece = this.board[from.row][from.col];
        const captured = this.board[to.row][to.col];

        if (captured) {
            const capturedColor = captured === captured.toUpperCase()? 'white' : 'black';
            this.capturedPieces[capturedColor].push(captured);
        }

        // Handle pawn promotion
        let finalPiece = piece;
        if (piece.toLowerCase() === 'p') {
            if ((piece === 'P' && to.row === 0) || (piece === 'p' && to.row === 7)) {
                finalPiece = piece === 'P'? 'Q' : 'q'; // Auto-promote to queen
            }
        }

        this.board[to.row][to.col] = finalPiece;
        this.board[from.row][from.col] = null;

        this.lastMove = {from: {...from}, to: {...to}, piece, captured};
        this.moveHistory.push(this.lastMove);
        this.currentTurn = this.currentTurn === 'white'? 'black' : 'white';
        this.render();
    }

    isInBounds(row, col) {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
    }

    isOpponent(piece, isWhite) {
        const pieceIsWhite = piece === piece.toUpperCase();
        return pieceIsWhite!== isWhite;
    }

    isKingInCheck(board, color) {
        const king = color === 'white'? 'K' : 'k';
        let kingPos = null;

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (board[row][col] === king) {
                    kingPos = {row, col};
                    break;
                }
            }
        }

        if (!kingPos) return false;

        // Check if any opponent piece can attack king
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = board[row][col];
                if (piece && this.isOpponent(piece, color === 'white')) {
                    const moves = this.getPseudoLegalMovesForBoard(board, row, col);
                    if (moves.some(m => m.row === kingPos.row && m.col === kingPos.col)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    getPseudoLegalMovesForBoard(board, row, col) {
        const temp = this.board;
        this.board = board;
        const moves = this.getPseudoLegalMoves(row, col);
        this.board = temp;
        return moves;
    }

    updateCaptured() {
        document.getElementById('captured-white').textContent =
            this.capturedPieces.white.map(p => this.getPieceSymbol(p)).join(' ');
        document.getElementById('captured-black').textContent =
            this.capturedPieces.black.map(p => this.getPieceSymbol(p)).join(' ');
    }

    updateStatus() {
        const status = document.getElementById('game-status');
        if (this.isCheckmate()) {
            status.textContent = `Checkmate! ${this.currentTurn === 'white'? 'Black' : 'White'} wins!`;
            status.style.color = '#e53e3e';
        } else if (this.isKingInCheck(this.board, this.currentTurn)) {
            status.textContent = 'Check!';
            status.style.color = '#ed8936';
        } else {
            status.textContent = 'Select a piece to move';
            status.style.color = '#718096';
        }
    }

    isCheckmate() {
        if (!this.isKingInCheck(this.board, this.currentTurn)) return false;

        // Check if any legal move exists
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && ((this.currentTurn === 'white' && piece === piece.toUpperCase()) ||
                             (this.currentTurn === 'black' && piece === piece.toLowerCase()))) {
                    if (this.getLegalMoves(row, col).length > 0) return false;
                }
            }
        }
        return true;
    }

    undo() {
        if (this.moveHistory.length === 0) return;

        const lastMove = this.moveHistory.pop();
        this.board[lastMove.from.row][lastMove.from.col] = lastMove.piece;
        this.board[lastMove.to.row][lastMove.to.col] = lastMove.captured;

        if (lastMove.captured) {
            const color = lastMove.captured === lastMove.captured.toUpperCase()? 'white' : 'black';
            this.capturedPieces[color].pop();
        }

        this.currentTurn = this.currentTurn === 'white'? 'black' : 'white';
        this.lastMove = this.moveHistory[this.moveHistory.length - 1] || null;
        this.selectedSquare = null;
        this.legalMoves = [];
        this.render();
    }

    reset() {
        this.setupBoard();
        this.currentTurn = 'white';
        this.selectedSquare = null;
        this.legalMoves = [];
        this.moveHistory = [];
        this.capturedPieces = {white: [], black: []};
        this.lastMove = null;
        this.render();
    }

    flipBoard() {
        this.isFlipped =!this.isFlipped;
        document.getElementById('chess-board').classList.toggle('flipped');
    }
}

new ChessGame();