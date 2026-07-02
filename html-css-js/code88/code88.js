// JavaScript for Code 88
class ChessVsAI {
    constructor() {
        this.board = [];
        this.currentTurn = 'white'; // Player is always white
        this.selectedSquare = null;
        this.legalMoves = [];
        this.moveHistory = [];
        this.moveCount = 0;
        this.aiThinking = false;
        this.gameOver = false;
        this.showHints = false;

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
        this.board = [
            ['r','n','b','q','k','b','n','r'],
            ['p','p','p','p'],
            [null,null,null,null,null,null,null,null],
            [null,null,null,null,null,null,null,null],
            [null,null,null,null,null,null,null,null],
            [null,null,null,null,null,null,null,null],
            ['P','P','P','P','P','P','P','P'],
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
        document.getElementById('hint-btn').addEventListener('click', () => this.toggleHints());
    }

    render() {
        const squares = document.querySelectorAll('.square');
        squares.forEach(square => {
            const row = parseInt(square.dataset.row);
            const col = parseInt(square.dataset.col);
            const piece = this.board[row][col];

            square.innerHTML = '';
            square.classList.remove('selected', 'legal-move', 'legal-capture', 'last-move', 'ai-move');

            if (piece) {
                const pieceEl = document.createElement('span');
                pieceEl.classList.add('piece');
                pieceEl.textContent = this.getPieceSymbol(piece);
                square.appendChild(pieceEl);
            }

            if (this.selectedSquare && this.selectedSquare.row === row && this.selectedSquare.col === col) {
                square.classList.add('selected');
            }

            if (this.showHints && this.legalMoves.some(m => m.row === row && m.col === col)) {
                square.classList.add(piece? 'legal-capture' : 'legal-move');
            }
        });

        document.getElementById('current-turn').textContent =
            this.currentTurn === 'white'? 'White' : 'Black';
        document.getElementById('move-count').textContent = Math.floor(this.moveCount / 2);
        document.getElementById('captured-count').textContent = this.getCapturedCount();

        this.updateStatus();
    }

    getPieceSymbol(piece) {
        const color = piece === piece.toUpperCase()? 'white' : 'black';
        const type = piece.toLowerCase();
        return this.pieces[color][type];
    }

    handleSquareClick(row, col) {
        if (this.aiThinking || this.gameOver || this.currentTurn!== 'white') return;

        const piece = this.board[row][col];
        const isPlayerPiece = piece && piece === piece.toUpperCase();

        if (this.selectedSquare) {
            if (this.selectedSquare.row === row && this.selectedSquare.col === col) {
                this.selectedSquare = null;
                this.legalMoves = [];
                this.render();
                return;
            }

            if (this.legalMoves.some(m => m.row === row && m.col === col)) {
                this.playerMove(this.selectedSquare, {row, col});
                this.selectedSquare = null;
                this.legalMoves = [];
                return;
            }
        }

        if (isPlayerPiece) {
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

        if (this.isInBounds(row + dir, col) &&!this.board[row + dir][col]) {
            moves.push({row: row + dir, col});
            if (row === startRow &&!this.board[row + 2*dir][col]) {
                moves.push({row: row + 2*dir, col});
            }
        }

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

    playerMove(from, to) {
        this.makeMove(from, to);
        this.moveCount++;

        if (this.checkGameEnd()) return;

        this.currentTurn = 'black';
        this.render();
        this.aiMove();
    }

    aiMove() {
        this.aiThinking = true;
        this.updateStatus('AI is thinking...', 'thinking');

        setTimeout(() => {
            const allMoves = this.getAllLegalMoves('black');
            if (allMoves.length === 0) {
                this.checkGameEnd();
                return;
            }

            // Random AI - pick random legal move
            const randomMove = allMoves[Math.floor(Math.random() * allMoves.length)];
            this.makeMove(randomMove.from, randomMove.to);
            this.moveCount++;

            // Highlight AI move
            const toSquare = document.querySelector(`[data-row="${randomMove.to.row}"][data-col="${randomMove.to.col}"]`);
            toSquare.classList.add('ai-move');

            this.currentTurn = 'white';
            this.aiThinking = false;

            if (this.checkGameEnd()) return;
            this.render();
        }, 500);
    }

    getAllLegalMoves(color) {
        const moves = [];
        const isWhite = color === 'white';

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && ((isWhite && piece === piece.toUpperCase()) ||
                             (!isWhite && piece === piece.toLowerCase()))) {
                    const legalMoves = this.getLegalMoves(row, col);
                    legalMoves.forEach(move => {
                        moves.push({from: {row, col}, to: move});
                    });
                }
            }
        }
        return moves;
    }

    makeMove(from, to) {
        const piece = this.board[from.row][from.col];

        // Handle pawn promotion
        let finalPiece = piece;
        if (piece.toLowerCase() === 'p') {
            if ((piece === 'P' && to.row === 0) || (piece === 'p' && to.row === 7)) {
                finalPiece = piece === 'P'? 'Q' : 'q';
            }
        }

        this.board[to.row][to.col] = finalPiece;
        this.board[from.row][from.col] = null;

        this.moveHistory.push({from, to, piece});
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

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = board[row][col];
                if (piece && this.isOpponent(piece, color === 'white')) {
                    const temp = this.board;
                    this.board = board;
                    const moves = this.getPseudoLegalMoves(row, col);
                    this.board = temp;
                    if (moves.some(m => m.row === kingPos.row && m.col === kingPos.col)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    checkGameEnd() {
        const moves = this.getAllLegalMoves(this.currentTurn);
        if (moves.length === 0) {
            this.gameOver = true;
            if (this.isKingInCheck(this.board, this.currentTurn)) {
                const winner = this.currentTurn === 'white'? 'AI wins' : 'You win';
                this.updateStatus(`Checkmate! ${winner}!`, 'check');
            } else {
                this.updateStatus('Stalemate! Draw.', 'check');
            }
            return true;
        }
        return false;
    }

    updateStatus(msg, type) {
        const status = document.getElementById('game-status');
        if (msg) {
            status.textContent = msg;
            status.className = 'status ' + (type || '');
        } else {
            if (this.isKingInCheck(this.board, this.currentTurn)) {
                status.textContent = 'Check!';
                status.className = 'status check';
            } else if (this.currentTurn === 'white') {
                status.textContent = 'Your move';
                status.className = 'status';
            } else {
                status.textContent = 'AI is thinking...';
                status.className = 'status thinking';
            }
        }
    }

    getCapturedCount() {
        let count = 0;
        const initial = 32;
        const current = this.board.flat().filter(p => p!== null).length;
        return initial - current;
    }

    toggleHints() {
        this.showHints =!this.showHints;
        document.getElementById('hint-btn').textContent =
            this.showHints? 'Hide Legal Moves' : 'Show Legal Moves';
        this.render();
    }

    undo() {
        if (this.moveHistory.length < 2 || this.aiThinking || this.gameOver) return;

        // Undo AI move + player move
        for (let i = 0; i < 2; i++) {
            const lastMove = this.moveHistory.pop();
            this.board[lastMove.from.row][lastMove.from.col] = lastMove.piece;
            this.board[lastMove.to.row][lastMove.to.col] = null;
            this.moveCount--;
        }

        this.currentTurn = 'white';
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
        this.moveCount = 0;
        this.aiThinking = false;
        this.gameOver = false;
        this.render();
    }
}

new ChessVsAI();