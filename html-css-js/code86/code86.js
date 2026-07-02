class SudokuGenerator {
    constructor() {
        this.board = Array(9).fill().map(() => Array(9).fill(0));
        this.solution = Array(9).fill().map(() => Array(9).fill(0));
        this.selectedCell = null;
        this.mistakes = 0;
        this.maxMistakes = 3;
        this.timer = 0;
        this.timerInterval = null;
        this.isGameActive = false;

        this.difficultyMap = {
            easy: 36,
            medium: 30,
            hard: 26,
            expert: 22,
            evil: 17
        };

        this.init();
    }

    init() {
        this.createBoard();
        this.bindEvents();
        this.newGame();
    }

    createBoard() {
        const boardEl = document.getElementById('sudoku-board');
        boardEl.innerHTML = '';

        for (let i = 0; i < 81; i++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.index = i;
            cell.addEventListener('click', () => this.selectCell(i));
            boardEl.appendChild(cell);
        }
    }

    bindEvents() {
        document.getElementById('new-game').addEventListener('click', () => this.newGame());
        document.getElementById('check-solution').addEventListener('click', () => this.checkSolution());
        document.getElementById('solve').addEventListener('click', () => this.showSolution());
        document.getElementById('hint').addEventListener('click', () => this.giveHint());
        document.getElementById('reset').addEventListener('click', () => this.resetBoard());

        document.querySelectorAll('.num-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const num = parseInt(btn.dataset.num);
                this.inputNumber(num);
            });
        });

        document.addEventListener('keydown', (e) => {
            if (e.key >= '1' && e.key <= '9') {
                this.inputNumber(parseInt(e.key));
            } else if (e.key === '0' || e.key === 'Backspace' || e.key === 'Delete') {
                this.inputNumber(0);
            }
        });
    }

    newGame() {
        this.resetTimer();
        this.mistakes = 0;
        this.updateMistakes();
        this.clearMessage();
        this.selectedCell = null;

        const difficulty = document.getElementById('difficulty').value;
        const clues = this.difficultyMap[difficulty];

        this.generateSolvedBoard();
        this.solution = this.board.map(row => [...row]);
        this.removeNumbers(clues);
        this.renderBoard();
        this.startTimer();
        this.isGameActive = true;
    }

    generateSolvedBoard() {
        this.board = Array(9).fill().map(() => Array(9).fill(0));
        this.fillBoard();
    }

    fillBoard() {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (this.board[row][col] === 0) {
                    const nums = this.shuffle([1,2,3,4,5,6,7,8,9]);
                    for (let num of nums) {
                        if (this.isValid(row, col, num)) {
                            this.board[row][col] = num;
                            if (this.fillBoard()) return true;
                            this.board[row][col] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }

    isValid(row, col, num) {
        // Check row
        for (let x = 0; x < 9; x++) {
            if (this.board[row][x] === num) return false;
        }

        // Check column
        for (let x = 0; x < 9; x++) {
            if (this.board[x][col] === num) return false;
        }

        // Check 3x3 box
        const startRow = row - row % 3;
        const startCol = col - col % 3;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (this.board[i + startRow][j + startCol] === num) return false;
            }
        }

        return true;
    }

    removeNumbers(cluesToKeep) {
        let cellsToRemove = 81 - cluesToKeep;
        let attempts = 0;

        while (cellsToRemove > 0 && attempts < 1000) {
            const row = Math.floor(Math.random() * 9);
            const col = Math.floor(Math.random() * 9);

            if (this.board[row][col]!== 0) {
                const backup = this.board[row][col];
                this.board[row][col] = 0;

                // For evil difficulty, skip uniqueness check to allow multiple solutions
                const difficulty = document.getElementById('difficulty').value;
                if (difficulty === 'evil' || this.hasUniqueSolution()) {
                    cellsToRemove--;
                } else {
                    this.board[row][col] = backup;
                }
                attempts++;
            }
        }
    }

    hasUniqueSolution() {
        const boardCopy = this.board.map(row => [...row]);
        return this.countSolutions(boardCopy, 0) === 1;
    }

    countSolutions(board, count) {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (board[row][col] === 0) {
                    for (let num = 1; num <= 9; num++) {
                        if (this.isValidForBoard(board, row, col, num)) {
                            board[row][col] = num;
                            count = this.countSolutions(board, count);
                            if (count > 1) return count;
                            board[row][col] = 0;
                        }
                    }
                    return count;
                }
            }
        }
        return count + 1;
    }

    isValidForBoard(board, row, col, num) {
        for (let x = 0; x < 9; x++) {
            if (board[row][x] === num || board[x][col] === num) return false;
        }
        const startRow = row - row % 3;
        const startCol = col - col % 3;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (board[i + startRow][j + startCol] === num) return false;
            }
        }
        return true;
    }

    renderBoard() {
        const cells = document.querySelectorAll('.cell');
        cells.forEach((cell, index) => {
            const row = Math.floor(index / 9);
            const col = index % 9;
            const value = this.board[row][col];

            cell.textContent = value || '';
            cell.classList.remove('fixed', 'error', 'hint', 'selected');

            if (value!== 0 && this.solution[row][col] === value) {
                cell.classList.add('fixed');
            }
        });
    }

    selectCell(index) {
        if (!this.isGameActive) return;

        const row = Math.floor(index / 9);
        const col = index % 9;

        if (this.solution[row][col] === this.board[row][col] && this.board[row][col]!== 0) {
            return;
        }

        document.querySelectorAll('.cell').forEach(c => c.classList.remove('selected'));
        this.selectedCell = {row, col, index};
        document.querySelector(`[data-index="${index}"]`).classList.add('selected');
    }

    inputNumber(num) {
        if (!this.isGameActive ||!this.selectedCell) return;

        const {row, col, index} = this.selectedCell;
        const cell = document.querySelector(`[data-index="${index}"]`);

        if (cell.classList.contains('fixed')) return;

        if (num === 0) {
            this.board[row][col] = 0;
            cell.textContent = '';
            cell.classList.remove('error');
            return;
        }

        this.board[row][col] = num;
        cell.textContent = num;

        if (this.solution[row][col]!== num) {
            cell.classList.add('error');
            this.mistakes++;
            this.updateMistakes();
            this.showMessage('Wrong number!', 'error');

            if (this.mistakes >= this.maxMistakes) {
                this.gameOver();
            }
        } else {
            cell.classList.remove('error');
            cell.classList.add('hint');
            setTimeout(() => cell.classList.remove('hint'), 500);

            if (this.isBoardComplete()) {
                this.gameWon();
            }
        }
    }

    giveHint() {
        if (!this.isGameActive) return;

        const emptyCells = [];
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (this.board[row][col] === 0) {
                    emptyCells.push({row, col});
                }
            }
        }

        if (emptyCells.length === 0) return;

        const {row, col} = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        const index = row * 9 + col;
        const correctNum = this.solution[row][col];

        this.board[row][col] = correctNum;
        const cell = document.querySelector(`[data-index="${index}"]`);
        cell.textContent = correctNum;
        cell.classList.add('hint');
        cell.classList.remove('error');

        if (this.isBoardComplete()) {
            this.gameWon();
        }
    }

    checkSolution() {
        if (!this.isGameActive) return;

        let errors = 0;
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (this.board[row][col]!== 0 && this.board[row][col]!== this.solution[row][col]) {
                    errors++;
                    const index = row * 9 + col;
                    document.querySelector(`[data-index="${index}"]`).classList.add('error');
                }
            }
        }

        if (errors === 0) {
            this.showMessage('Looking good so far!', 'success');
        } else {
            this.showMessage(`Found ${errors} mistake${errors > 1? 's' : ''}`, 'error');
        }
    }

    showSolution() {
        if (!this.isGameActive) return;

        this.board = this.solution.map(row => [...row]);
        this.renderBoard();
        this.stopTimer();
        this.isGameActive = false;
        this.showMessage('Solution revealed', 'info');
    }

    resetBoard() {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (!document.querySelector(`[data-index="${row * 9 + col}"]`).classList.contains('fixed')) {
                    this.board[row][col] = 0;
                }
            }
        }
        this.renderBoard();
        this.mistakes = 0;
        this.updateMistakes();
        this.clearMessage();
    }

    isBoardComplete() {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (this.board[row][col]!== this.solution[row][col]) return false;
            }
        }
        return true;
    }

    gameWon() {
        this.stopTimer();
        this.isGameActive = false;
        const time = document.getElementById('time').textContent;
        this.showMessage(`You won! Time: ${time}`, 'success');
    }

    gameOver() {
        this.stopTimer();
        this.isGameActive = false;
        this.showMessage('Game Over! Too many mistakes.', 'error');
    }

    startTimer() {
        this.timer = 0;
        this.timerInterval = setInterval(() => {
            this.timer++;
            const mins = Math.floor(this.timer / 60).toString().padStart(2, '0');
            const secs = (this.timer % 60).toString().padStart(2, '0');
            document.getElementById('time').textContent = `${mins}:${secs}`;
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    resetTimer() {
        this.stopTimer();
        document.getElementById('time').textContent = '00:00';
    }

    updateMistakes() {
        document.getElementById('mistakes').textContent = this.mistakes;
    }

    showMessage(msg, type) {
        const msgEl = document.getElementById('message');
        msgEl.textContent = msg;
        msgEl.style.color = type === 'error'? '#e53e3e' : type === 'success'? '#38a169' : '#667eea';
    }

    clearMessage() {
        document.getElementById('message').textContent = '';
    }

    shuffle(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }
}

// Start the game
new SudokuGenerator();