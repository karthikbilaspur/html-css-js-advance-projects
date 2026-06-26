// JavaScript for Code 59
const cardInput = document.getElementById('card-input');
const columnSelect = document.getElementById('column-select');
const addBtn = document.getElementById('add-btn');

const STORAGE_KEY = 'kanban_board_59';
let cards = [];

// Load from localStorage
window.addEventListener('DOMContentLoaded', () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        cards = JSON.parse(saved);
    } else {
        // Demo cards
        cards = [
            { id: Date.now(), text: 'Design homepage mockup', status: 'todo', created: Date.now() },
            { id: Date.now() + 1, text: 'Setup database schema', status: 'progress', created: Date.now() },
            { id: Date.now() + 2, text: 'Deploy to production', status: 'done', created: Date.now() }
        ];
        saveCards();
    }
    renderBoard();
});

// Add new card
addBtn.addEventListener('click', addCard);
cardInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addCard();
});

function addCard() {
    const text = cardInput.value.trim();
    if (!text) return;

    const card = {
        id: Date.now(),
        text: text,
        status: columnSelect.value,
        created: Date.now()
    };

    cards.push(card);
    saveCards();
    renderBoard();
    cardInput.value = '';
    cardInput.focus();
}

function renderBoard() {
    const columns = {
        todo: document.getElementById('todo-cards'),
        progress: document.getElementById('progress-cards'),
        done: document.getElementById('done-cards')
    };

    // Clear columns
    Object.values(columns).forEach(col => col.innerHTML = '');

    // Render cards to correct columns
    cards.forEach(card => {
        const cardEl = createCardElement(card);
        columns[card.status].appendChild(cardEl);
    });

    updateCounts();
    attachDragListeners();
}

function createCardElement(card) {
    const div = document.createElement('div');
    div.className = 'card';
    div.draggable = true;
    div.dataset.id = card.id;
    div.dataset.status = card.status;
    
    const date = new Date(card.created).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
    });

    div.innerHTML = `
        <div class="card-text">${escapeHtml(card.text)}</div>
        <div class="card-footer">
            <span class="card-date">${date}</span>
            <button class="delete-card" data-id="${card.id}">&times;</button>
        </div>
    `;

    return div;
}

// Drag and Drop
function attachDragListeners() {
    const cardElements = document.querySelectorAll('.card');
    const columnElements = document.querySelectorAll('.column');

    cardElements.forEach(card => {
        card.addEventListener('dragstart', handleDragStart);
        card.addEventListener('dragend', handleDragEnd);
    });

    columnElements.forEach(column => {
        column.addEventListener('dragover', handleDragOver);
        column.addEventListener('dragenter', handleDragEnter);
        column.addEventListener('dragleave', handleDragLeave);
        column.addEventListener('drop', handleDrop);
    });
}

let draggedCard = null;

function handleDragStart(e) {
    draggedCard = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
    draggedCard = null;
    
    // Remove drag-over from all columns
    document.querySelectorAll('.column').forEach(col => {
        col.classList.remove('drag-over');
    });
}

function handleDragOver(e) {
    e.preventDefault();
    return false;
}

function handleDragEnter(e) {
    if (this.classList.contains('column')) {
        this.classList.add('drag-over');
    }
}

function handleDragLeave(e) {
    if (this.classList.contains('column') && !this.contains(e.relatedTarget)) {
        this.classList.remove('drag-over');
    }
}

function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    
    this.classList.remove('drag-over');
    
    if (draggedCard && this.classList.contains('column')) {
        const cardId = parseInt(draggedCard.dataset.id);
        const newStatus = this.dataset.status;
        
        // Update card status
        cards = cards.map(card =>
            card.id === cardId ? { ...card, status: newStatus } : card
        );
        
        saveCards();
        renderBoard();
    }
    
    return false;
}

// Delete card
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('delete-card')) {
        const id = parseInt(e.target.dataset.id);
        cards = cards.filter(card => card.id !== id);
        saveCards();
        renderBoard();
    }
});

function updateCounts() {
    const todoCount = cards.filter(c => c.status === 'todo').length;
    const progressCount = cards.filter(c => c.status === 'progress').length;
    const doneCount = cards.filter(c => c.status === 'done').length;
    
    document.getElementById('todo-count').textContent = todoCount;
    document.getElementById('progress-count').textContent = progressCount;
    document.getElementById('done-count').textContent = doneCount;
}

function saveCards() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}