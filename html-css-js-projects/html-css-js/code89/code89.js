// JavaScript for Code 89
class Spreadsheet {
    constructor(rows = 20, cols = 10) {
        this.rows = rows;
        this.cols = cols;
        this.data = {};
        this.formulas = {};
        this.selectedCell = {row: 0, col: 0};
        this.selectedRange = null;

        this.init();
    }

    init() {
        this.createTable();
        this.bindEvents();
        this.selectCell(0, 0);
    }

    createTable() {
        const container = document.getElementById('spreadsheet');
        const table = document.createElement('table');
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');

        // Corner cell
        const corner = document.createElement('th');
        headerRow.appendChild(corner);

        // Column headers A, B, C...
        for (let col = 0; col < this.cols; col++) {
            const th = document.createElement('th');
            th.textContent = this.getColName(col);
            headerRow.appendChild(th);
        }
        thead.appendChild(headerRow);
        table.appendChild(thead);

        const tbody = document.createElement('tbody');
        for (let row = 0; row < this.rows; row++) {
            const tr = document.createElement('tr');

            // Row header 1, 2, 3...
            const rowHeader = document.createElement('td');
            rowHeader.textContent = row + 1;
            tr.appendChild(rowHeader);

            for (let col = 0; col < this.cols; col++) {
                const td = document.createElement('td');
                const input = document.createElement('input');
                input.type = 'text';
                input.className = 'cell';
                input.dataset.row = row;
                input.dataset.col = col;

                input.addEventListener('focus', () => this.selectCell(row, col));
                input.addEventListener('blur', (e) => this.updateCell(row, col, e.target.value));
                input.addEventListener('keydown', (e) => this.handleKeydown(e, row, col));

                td.appendChild(input);
                tr.appendChild(td);
            }
            tbody.appendChild(tr);
        }
        table.appendChild(tbody);
        container.innerHTML = '';
        container.appendChild(table);
    }

    bindEvents() {
        document.getElementById('formula-input').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.updateCell(this.selectedCell.row, this.selectedCell.col, e.target.value);
                this.moveSelection(1, 0);
            }
        });

        document.getElementById('formula-input').addEventListener('blur', (e) => {
            this.updateCell(this.selectedCell.row, this.selectedCell.col, e.target.value);
        });

        document.getElementById('add-row').addEventListener('click', () => this.addRow());
        document.getElementById('add-col').addEventListener('click', () => this.addCol());
        document.getElementById('clear-all').addEventListener('click', () => this.clearAll());
        document.getElementById('export-csv').addEventListener('click', () => this.exportCSV());
    }

    selectCell(row, col) {
        document.querySelectorAll('.cell.selected').forEach(c => c.classList.remove('selected'));

        this.selectedCell = {row, col};
        const cell = this.getCellElement(row, col);
        if (cell) {
            cell.classList.add('selected');
            cell.focus();
        }

        const cellRef = this.getColName(col) + (row + 1);
        document.getElementById('cell-ref').textContent = cellRef;

        const key = `${row},${col}`;
        const value = this.formulas[key] || this.data[key] || '';
        document.getElementById('formula-input').value = value;

        this.updateStatus();
    }

    updateCell(row, col, value) {
        const key = `${row},${col}`;
        const cell = this.getCellElement(row, col);

        if (value.startsWith('=')) {
            this.formulas[key] = value;
            this.evaluateFormula(row, col);
        } else {
            delete this.formulas[key];
            this.data[key] = value;
            if (cell) {
                cell.value = value;
                cell.classList.remove('formula', 'error');
            }
        }

        this.recalculateAll();
        this.updateStatus();
    }

    evaluateFormula(row, col) {
        const key = `${row},${col}`;
        const formula = this.formulas[key];
        const cell = this.getCellElement(row, col);

        try {
            if (formula.toUpperCase().startsWith('=SUM(')) {
                const result = this.evaluateSum(formula);
                this.data[key] = result;
                if (cell) {
                    cell.value = result;
                    cell.classList.add('formula');
                    cell.classList.remove('error');
                }
            } else {
                throw new Error('Unsupported formula');
            }
        } catch (e) {
            if (cell) {
                cell.value = '#ERROR';
                cell.classList.add('error');
                cell.classList.remove('formula');
            }
            this.data[key] = '#ERROR';
        }
    }

    evaluateSum(formula) {
        // Parse =SUM(A1:B3) or =SUM(A1,B2,C3)
        const match = formula.match(/=SUM\(([^)]+)\)/i);
        if (!match) throw new Error('Invalid SUM syntax');

        const range = match[1].trim();
        let sum = 0;

        if (range.includes(':')) {
            // Range like A1:B3
            const [start, end] = range.split(':');
            const startCell = this.parseCellRef(start.trim());
            const endCell = this.parseCellRef(end.trim());

            for (let r = startCell.row; r <= endCell.row; r++) {
                for (let c = startCell.col; c <= endCell.col; c++) {
                    const val = this.getCellValue(r, c);
                    sum += this.toNumber(val);
                }
            }
        } else {
            // List like A1,B2,C3
            const cells = range.split(',');
            for (let cellRef of cells) {
                const cell = this.parseCellRef(cellRef.trim());
                const val = this.getCellValue(cell.row, cell.col);
                sum += this.toNumber(val);
            }
        }

        return sum;
    }

    parseCellRef(ref) {
        const match = ref.match(/^([A-Z]+)(\d+)$/);
        if (!match) throw new Error('Invalid cell reference');
        const col = this.colNameToIndex(match[1]);
        const row = parseInt(match[2]) - 1;
        return {row, col};
    }

    colNameToIndex(name) {
        let index = 0;
        for (let i = 0; i < name.length; i++) {
            index = index * 26 + (name.charCodeAt(i) - 64);
        }
        return index - 1;
    }

    getColName(index) {
        let name = '';
        index++;
        while (index > 0) {
            let rem = (index - 1) % 26;
            name = String.fromCharCode(65 + rem) + name;
            index = Math.floor((index - 1) / 26);
        }
        return name;
    }

    getCellValue(row, col) {
        const key = `${row},${col}`;
        return this.data[key] || '';
    }

    toNumber(val) {
        if (val === '' || val === null || val === undefined) return 0;
        if (val === '#ERROR') return 0;
        const num = parseFloat(val);
        return isNaN(num)? 0 : num;
    }

    getCellElement(row, col) {
        return document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
    }

    recalculateAll() {
        // Re-evaluate all formulas after any change
        for (let key in this.formulas) {
            const [row, col] = key.split(',').map(Number);
            this.evaluateFormula(row, col);
        }
    }

    handleKeydown(e, row, col) {
        switch(e.key) {
            case 'Enter':
                e.preventDefault();
                this.moveSelection(1, 0);
                break;
            case 'Tab':
                e.preventDefault();
                this.moveSelection(0, e.shiftKey? -1 : 1);
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.moveSelection(-1, 0);
                break;
            case 'ArrowDown':
                e.preventDefault();
                this.moveSelection(1, 0);
                break;
            case 'ArrowLeft':
                if (e.target.selectionStart === 0) {
                    e.preventDefault();
                    this.moveSelection(0, -1);
                }
                break;
            case 'ArrowRight':
                if (e.target.selectionStart === e.target.value.length) {
                    e.preventDefault();
                    this.moveSelection(0, 1);
                }
                break;
        }
    }

    moveSelection(dr, dc) {
        let newRow = this.selectedCell.row + dr;
        let newCol = this.selectedCell.col + dc;

        if (newRow >= 0 && newRow < this.rows && newCol >= 0 && newCol < this.cols) {
            this.selectCell(newRow, newCol);
        }
    }

    addRow() {
        this.rows++;
        this.createTable();
        this.renderData();
    }

    addCol() {
        this.cols++;
        this.createTable();
        this.renderData();
    }

    clearAll() {
        if (confirm('Clear all data?')) {
            this.data = {};
            this.formulas = {};
            this.createTable();
        }
    }

    exportCSV() {
        let csv = '';
        for (let row = 0; row < this.rows; row++) {
            let rowData = [];
            for (let col = 0; col < this.cols; col++) {
                const val = this.getCellValue(row, col);
                rowData.push(`"${val}"`);
            }
            csv += rowData.join(',') + '\n';
        }

        const blob = new Blob([csv], {type: 'text/csv'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'spreadsheet.csv';
        a.click();
    }

    renderData() {
        for (let key in this.data) {
            const [row, col] = key.split(',').map(Number);
            const cell = this.getCellElement(row, col);
            if (cell) cell.value = this.data[key];
        }
        this.recalculateAll();
    }

    updateStatus() {
        const cellRef = this.getColName(this.selectedCell.col) + (this.selectedCell.row + 1);
        const key = `${this.selectedCell.row},${this.selectedCell.col}`;
        const value = this.data[key] || '';
        document.getElementById('status').textContent = `Cell ${cellRef}`;
        document.getElementById('selection-info').textContent = value? `Value: ${value}` : '';
    }
}

new Spreadsheet();