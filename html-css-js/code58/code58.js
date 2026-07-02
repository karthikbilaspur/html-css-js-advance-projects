// JavaScript for Code 58
const taskInput = document.getElementById('task-input');
const addBtn = document.getElementById('add-btn');
const taskList = document.getElementById('task-list');
const taskCount = document.getElementById('task-count');
const clearCompletedBtn = document.getElementById('clear-completed');
const emptyState = document.getElementById('empty-state');

const STORAGE_KEY = 'dragdrop_tasks_58';
let tasks = [];
let draggedItem = null;

// Load tasks from localStorage
window.addEventListener('DOMContentLoaded', () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        tasks = JSON.parse(saved);
        renderTasks();
    } else {
        // Demo tasks
        tasks = [
            { id: Date.now(), text: 'Drag me to reorder', completed: false },
            { id: Date.now() + 1, text: 'Click checkbox to complete', completed: false },
            { id: Date.now() + 2, text: 'Delete me with X button', completed: true }
        ];
        saveTasks();
        renderTasks();
    }
});

// Add task
addBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTask();
});

function addTask() {
    const text = taskInput.value.trim();
    if (!text) return;

    const task = {
        id: Date.now(),
        text: text,
        completed: false
    };

    tasks.unshift(task);
    saveTasks();
    renderTasks();
    taskInput.value = '';
    taskInput.focus();
}

// Render tasks
function renderTasks() {
    if (tasks.length === 0) {
        taskList.innerHTML = '';
        emptyState.classList.add('show');
    } else {
        emptyState.classList.remove('show');
        taskList.innerHTML = tasks.map((task, index) => `
            <li class="task-item ${task.completed ? 'completed' : ''}" 
                draggable="true" 
                data-id="${task.id}"
                data-index="${index}">
                <span class="drag-handle">⋮⋮</span>
                <div class="checkbox ${task.completed ? 'checked' : ''}" data-id="${task.id}"></div>
                <span class="task-text">${escapeHtml(task.text)}</span>
                <button class="delete-btn" data-id="${task.id}">&times;</button>
            </li>
        `).join('');
    }
    updateCount();
    attachDragListeners();
}

// Drag and Drop Events
function attachDragListeners() {
    const items = taskList.querySelectorAll('.task-item');

    items.forEach(item => {
        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragover', handleDragOver);
        item.addEventListener('drop', handleDrop);
        item.addEventListener('dragend', handleDragEnd);
        item.addEventListener('dragenter', handleDragEnter);
        item.addEventListener('dragleave', handleDragLeave);
    });
}

function handleDragStart(e) {
    draggedItem = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);
}

function handleDragOver(e) {
    e.preventDefault();
    return false;
}

function handleDragEnter(e) {
    if (this !== draggedItem) {
        this.classList.add('drag-over');
    }
}

function handleDragLeave(e) {
    this.classList.remove('drag-over');
}

function handleDrop(e) {
    e.stopPropagation();
    e.preventDefault();

    if (draggedItem !== this) {
        const fromIndex = parseInt(draggedItem.dataset.index);
        const toIndex = parseInt(this.dataset.index);

        // Reorder array
        const [movedTask] = tasks.splice(fromIndex, 1);
        tasks.splice(toIndex, 0, movedTask);

        saveTasks();
        renderTasks();
    }

    return false;
}

function handleDragEnd(e) {
    const items = taskList.querySelectorAll('.task-item');
    items.forEach(item => {
        item.classList.remove('dragging', 'drag-over');
    });
    draggedItem = null;
}

// Toggle complete
taskList.addEventListener('click', (e) => {
    if (e.target.classList.contains('checkbox')) {
        const id = parseInt(e.target.dataset.id);
        toggleComplete(id);
    }
    
    if (e.target.classList.contains('delete-btn')) {
        const id = parseInt(e.target.dataset.id);
        deleteTask(id);
    }
});

function toggleComplete(id) {
    tasks = tasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
    );
    saveTasks();
    renderTasks();
}

function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    renderTasks();
}

// Clear completed
clearCompletedBtn.addEventListener('click', () => {
    tasks = tasks.filter(task => !task.completed);
    saveTasks();
    renderTasks();
});

function updateCount() {
    const remaining = tasks.filter(t => !t.completed).length;
    taskCount.textContent = `${remaining} task${remaining !== 1 ? 's' : ''} left`;
}

function saveTasks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}