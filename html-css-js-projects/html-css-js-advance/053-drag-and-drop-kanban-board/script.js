const kanbanBoard = document.getElementById('kanbanBoard');
const categorySlider = document.getElementById('categorySlider');
const taskModal = document.getElementById('taskModal');
const addTaskBtn = document.getElementById('addTaskBtn');
const cancelBtn = document.getElementById('cancelBtn');
const saveBtn = document.getElementById('saveBtn');
const taskTitle = document.getElementById('taskTitle');
const taskDesc = document.getElementById('taskDesc');
const taskPriority = document.getElementById('taskPriority');
const taskCategory = document.getElementById('taskCategory');

let tasks = JSON.parse(localStorage.getItem('kanbanTasks')) || [];
let currentFilter = 'all';
let draggedTask = null;

const STINKY_TIME = 3 * 24 * 60 * 60 * 1000; // 3 days

// Init
renderTasks();
setupTouchSlider();
setupDragDrop();

// Modal controls
addTaskBtn.addEventListener('click', () => taskModal.classList.add('active'));
cancelBtn.addEventListener('click', () => {
    taskModal.classList.remove('active');
    clearForm();
});

saveBtn.addEventListener('click', () => {
    const title = taskTitle.value.trim();
    if (!title) return;

    const task = {
        id: Date.now(),
        title: title,
        description: taskDesc.value.trim(),
        priority: taskPriority.value,
        category: taskCategory.value,
        status: 'todo',
        createdAt: Date.now()
    };

    tasks.push(task);
    saveTasks();
    renderTasks();
    taskModal.classList.remove('active');
    clearForm();
});

function clearForm() {
    taskTitle.value = '';
    taskDesc.value = '';
    taskPriority.value = 'medium';
    taskCategory.value = 'general';
}

function saveTasks() {
    localStorage.setItem('kanbanTasks', JSON.stringify(tasks));
}

function renderTasks() {
    const columns = {
        todo: document.getElementById('todoColumn'),
        progress: document.getElementById('progressColumn'),
        done: document.getElementById('doneColumn')
    };

    // Clear columns
    Object.values(columns).forEach(col => col.innerHTML = '');

    // Filter tasks
    let filteredTasks = tasks;
    if (currentFilter === 'stinky') {
        filteredTasks = tasks.filter(t => isStinky(t) && t.status!== 'done');
    } else if (currentFilter!== 'all') {
        filteredTasks = tasks.filter(t => t.status === currentFilter);
    }

    // Render tasks
    filteredTasks.forEach(task => {
        const taskEl = createTaskElement(task);
        columns[task.status].appendChild(taskEl);
    });

    updateCounts();
}

function createTaskElement(task) {
    const isStinky = checkStinky(task);
    const age = getAgeText(task.createdAt);

    const div = document.createElement('div');
    div.className = `task-card ${task.status === 'done'? 'done' : ''} ${isStinky? 'stinky' : ''}`;
    div.draggable = true;
    div.dataset.id = task.id;

    div.innerHTML = `
        <div class="task-header">
            <div class="task-title">${escapeHtml(task.title)}</div>
            <span class="task-priority priority-${task.priority}">${task.priority}</span>
        </div>
        ${task.description? `<div class="task-desc">${escapeHtml(task.description)}</div>` : ''}
        <div class="task-footer">
            <span class="task-category">${task.category}</span>
            <span class="task-age ${isStinky? 'stinky-text' : ''}">${age}</span>
        </div>
    `;

    // Drag events
    div.addEventListener('dragstart', handleDragStart);
    div.addEventListener('dragend', handleDragEnd);

    return div;
}

function checkStinky(task) {
    if (task.status === 'done') return false;
    return Date.now() - task.createdAt > STINKY_TIME;
}

function isStinky(task) {
    return checkStinky(task);
}

function getAgeText(timestamp) {
    const diff = Date.now() - timestamp;
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor(diff / 3600000);

    if (days >= 3) return `💀 ${days}d old`;
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'just now';
}

function updateCounts() {
    document.getElementById('todoCount').textContent = tasks.filter(t => t.status === 'todo').length;
    document.getElementById('progressCount').textContent = tasks.filter(t => t.status === 'progress').length;
    document.getElementById('doneCount').textContent = tasks.filter(t => t.status === 'done').length;
}

// Drag and Drop
function setupDragDrop() {
    document.querySelectorAll('.column-body').forEach(column => {
        column.addEventListener('dragover', handleDragOver);
        column.addEventListener('drop', handleDrop);
        column.addEventListener('dragleave', handleDragLeave);
    });
}

function handleDragStart(e) {
    draggedTask = tasks.find(t => t.id == e.target.dataset.id);
    e.target.classList.add('dragging');
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
}

function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');

    if (draggedTask) {
        const newStatus = e.currentTarget.parentElement.dataset.status;
        draggedTask.status = newStatus;
        saveTasks();
        renderTasks();
        draggedTask = null;
    }
}

// Touch Slider for Categories
function setupTouchSlider() {
    let isDown = false;
    let startX;
    let scrollLeft;

    categorySlider.addEventListener('mousedown', (e) => {
        isDown = true;
        startX = e.pageX - categorySlider.offsetLeft;
        scrollLeft = categorySlider.scrollLeft;
    });

    categorySlider.addEventListener('mouseleave', () => isDown = false);
    categorySlider.addEventListener('mouseup', () => isDown = false);

    categorySlider.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - categorySlider.offsetLeft;
        const walk = (x - startX) * 2;
        categorySlider.scrollLeft = scrollLeft - walk;
    });

    // Touch events
    categorySlider.addEventListener('touchstart', (e) => {
        isDown = true;
        startX = e.touches[0].pageX - categorySlider.offsetLeft;
        scrollLeft = categorySlider.scrollLeft;
    });

    categorySlider.addEventListener('touchend', () => isDown = false);

    categorySlider.addEventListener('touchmove', (e) => {
        if (!isDown) return;
        const x = e.touches[0].pageX - categorySlider.offsetLeft;
        const walk = (x - startX) * 2;
        categorySlider.scrollLeft = scrollLeft - walk;
    });

    // Category filter buttons
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderTasks();
        });
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Check for stinky tasks every minute
setInterval(() => {
    renderTasks();
}, 60000);