const todoInput = document.getElementById('todoInput');
const noteInput = document.getElementById('noteInput');
const prioritySelect = document.getElementById('prioritySelect');
const categorySelect = document.getElementById('categorySelect');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const emptyState = document.getElementById('emptyState');
const clearDoneBtn = document.getElementById('clearDoneBtn');
const filterBtns = document.querySelectorAll('.filter-btn');

const totalCount = document.getElementById('totalCount');
const stinkyCount = document.getElementById('stinkyCount');
const doneCount = document.getElementById('doneCount');

let todos = JSON.parse(localStorage.getItem('stinkyTodos')) || [];
let currentFilter = 'all';

// Stinky threshold: 3 days in milliseconds
const STINKY_TIME = 3 * 24 * 60 * 60 * 1000;

function saveTodos() {
    localStorage.setItem('stinkyTodos', JSON.stringify(todos));
}

function addTodo() {
    const text = todoInput.value.trim();
    if (!text) return;

    const todo = {
        id: Date.now(),
        text: text,
        note: noteInput.value.trim(),
        priority: prioritySelect.value,
        category: categorySelect.value,
        completed: false,
        createdAt: Date.now(),
        stinky: false
    };

    todos.unshift(todo);
    saveTodos();
    renderTodos();

    todoInput.value = '';
    noteInput.value = '';
    todoInput.focus();
}

function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed =!todo.completed;
        saveTodos();
        renderTodos();
    }
}

function deleteTodo(id) {
    todos = todos.filter(t => t.id!== id);
    saveTodos();
    renderTodos();
}

function clearCompleted() {
    todos = todos.filter(t =>!t.completed);
    saveTodos();
    renderTodos();
}

function checkStinky() {
    const now = Date.now();
    let changed = false;

    todos.forEach(todo => {
        if (!todo.completed &&!todo.stinky) {
            const age = now - todo.createdAt;
            if (age > STINKY_TIME) {
                todo.stinky = true;
                changed = true;
            }
        }
    });

    if (changed) saveTodos();
}

function getAgeText(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'just now';
}

function getStinkyLevel(timestamp) {
    const age = Date.now() - timestamp;
    const days = Math.floor(age / 86400000);

    if (days >= 7) return '💀 ROTting';
    if (days >= 5) return '🤢 Very Stinky';
    if (days >= 3) return '😷 Stinky';
    return '';
}

function renderTodos() {
    checkStinky();

    let filtered = todos;

    if (currentFilter === 'active') {
        filtered = todos.filter(t =>!t.completed);
    } else if (currentFilter === 'stinky') {
        filtered = todos.filter(t => t.stinky &&!t.completed);
    } else if (currentFilter === 'done') {
        filtered = todos.filter(t => t.completed);
    }

    if (filtered.length === 0) {
        todoList.innerHTML = '';
        emptyState.classList.add('show');
    } else {
        emptyState.classList.remove('show');
        todoList.innerHTML = filtered.map(todo => `
            <div class="todo-item ${todo.completed? 'done' : ''} ${todo.stinky? 'stinky' : ''}">
                <div class="todo-checkbox ${todo.completed? 'checked' : ''}" 
                     onclick="toggleTodo(${todo.id})"></div>
                <div class="todo-content">
                    <div class="todo-header">
                        <span class="todo-text">${escapeHtml(todo.text)}</span>
                        <span class="priority ${todo.priority}">${todo.priority}</span>
                        <span class="category">${todo.category}</span>
                    </div>
                    ${todo.note? `<div class="todo-note">${escapeHtml(todo.note)}</div>` : ''}
                    <div class="todo-meta">
                        <span>${getAgeText(todo.createdAt)}</span>
                        ${todo.stinky &&!todo.completed? `<span class="stinky-badge">${getStinkyLevel(todo.createdAt)}</span>` : ''}
                    </div>
                </div>
                <div class="todo-actions">
                    <button class="action-btn delete" onclick="deleteTodo(${todo.id})">🗑️</button>
                </div>
            </div>
        `).join('');
    }

    updateStats();
}

function updateStats() {
    totalCount.textContent = todos.length;
    stinkyCount.textContent = todos.filter(t => t.stinky &&!t.completed).length;
    doneCount.textContent = todos.filter(t => t.completed).length;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Event Listeners
addBtn.addEventListener('click', addTodo);
todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTodo();
});

clearDoneBtn.addEventListener('click', clearCompleted);

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderTodos();
    });
});

// Check for stinky todos every minute
setInterval(() => {
    checkStinky();
    renderTodos();
}, 60000);

// Init
renderTodos();