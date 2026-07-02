// Multiple arrays = columns. Cards = objects
let boards = {
    todo: [],
    doing: [],
    done: []
};

// Load from localStorage
function loadBoards() {
    const saved = localStorage.getItem('kanban');
    if (saved) {
        boards = JSON.parse(saved);
    }
    renderAllCards();
    updateCounts();
}

// Save to localStorage
function saveBoards() {
    localStorage.setItem('kanban', JSON.stringify(boards));
}

// Generate unique ID
function generateID() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Render all cards
function renderAllCards() {
    Object.keys(boards).forEach(status => {
        const container = document.getElementById(`${status}-cards`);
        container.innerHTML = '';

        boards[status].forEach(card => {
            const cardEl = createCardElement(card, status);
            container.appendChild(cardEl);
        });
    });
}

// Create card DOM element
function createCardElement(card, status) {
    const div = document.createElement('div');
    div.className = 'card';
    div.draggable = true;
    div.dataset.id = card.id;
    div.dataset.status = status;

    div.innerHTML = `
        <h4>${card.title}</h4>
        ${card.desc? `<p>${card.desc}</p>` : ''}
        <button class="delete" onclick="deleteCard('${card.id}', '${status}')">×</button>
    `;

    // Drag events
    div.addEventListener('dragstart', handleDragStart);
    div.addEventListener('dragend', handleDragEnd);

    return div;
}

// Add new card
function addCard(title, desc, status) {
    const card = {
        id: generateID(),
        title: title.trim(),
        desc: desc.trim(),
        createdAt: new Date().toISOString()
    };

    boards[status].push(card);
    saveBoards();
    renderAllCards();
    updateCounts();
}

// Delete card
function deleteCard(id, status) {
    boards[status] = boards[status].filter(card => card.id!== id);
    saveBoards();
    renderAllCards();
    updateCounts();
}

// Update counts
function updateCounts() {
    document.getElementById('todo-count').textContent = boards.todo.length;
    document.getElementById('doing-count').textContent = boards.doing.length;
    document.getElementById('done-count').textContent = boards.done.length;

    const total = boards.todo.length + boards.doing.length + boards.done.length;
    document.getElementById('total-cards').textContent = `${total} cards`;
}

// Drag and Drop handlers
let draggedCard = null;
let draggedFrom = null;

function handleDragStart(e) {
    draggedCard = e.target;
    draggedFrom = e.target.dataset.status;
    e.target.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    const column = e.target.closest('.cards');
    if (column) {
        column.classList.add('drag-over');
    }
}

function handleDragLeave(e) {
    const column = e.target.closest('.cards');
    if (column) {
        column.classList.remove('drag-over');
    }
}

function handleDrop(e) {
    e.preventDefault();
    const column = e.target.closest('.cards');

    if (!column ||!draggedCard) return;

    column.classList.remove('drag-over');

    const toStatus = column.id.replace('-cards', '');
    const cardId = draggedCard.dataset.id;

    if (draggedFrom === toStatus) return;

    // Move card between arrays
    const cardIndex = boards[draggedFrom].findIndex(c => c.id === cardId);
    const [card] = boards[draggedFrom].splice(cardIndex, 1);
    boards[toStatus].push(card);

    saveBoards();
    renderAllCards();
    updateCounts();

    draggedCard = null;
    draggedFrom = null;
}

// Modal controls
const modal = document.getElementById('modal');
const form = document.getElementById('card-form');
const titleInput = document.getElementById('card-title');
const descInput = document.getElementById('card-desc');
const statusInput = document.getElementById('card-status');

document.getElementById('add-board').onclick = () => openModal('todo');
document.querySelectorAll('.add-card').forEach(btn => {
    btn.onclick = () => openModal(btn.dataset.status);
});

document.getElementById('cancel').onclick = closeModal;

function openModal(status) {
    statusInput.value = status;
    modal.classList.add('active');
    titleInput.focus();
}

function closeModal() {
    modal.classList.remove('active');
    form.reset();
}

form.onsubmit = (e) => {
    e.preventDefault();
    addCard(titleInput.value, descInput.value, statusInput.value);
    closeModal();
};

window.onclick = (e) => {
    if (e.target === modal) closeModal();
};

// Setup drop zones
document.querySelectorAll('.cards').forEach(column => {
    column.addEventListener('dragover', handleDragOver);
    column.addEventListener('dragleave', handleDragLeave);
    column.addEventListener('drop', handleDrop);
});

// Init
loadBoards();