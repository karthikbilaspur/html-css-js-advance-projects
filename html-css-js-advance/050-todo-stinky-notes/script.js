class StinkyTodo {
    constructor() {
        this.todos = this.loadTodos();
        this.currentFilter = 'all';
        this.currentPage = 1;
        this.itemsPerPage = 8;
        this.STINKY_TIME = 3 * 24 * 60 * 1000; // 3 days

        this.elements = this.cacheElements();
        this.bindEvents();
        this.render();
        this.startStinkTimer();
    }

    cacheElements() {
        return {
            todoInput: document.getElementById('todoInput'),
            noteInput: document.getElementById('noteInput'),
            prioritySelect: document.getElementById('prioritySelect'),
            categorySelect: document.getElementById('categorySelect'),
            dueDateInput: document.getElementById('dueDateInput'),
            addBtn: document.getElementById('addBtn'),
            todoList: document.getElementById('todoList'),
            emptyState: document.getElementById('emptyState'),
            clearDoneBtn: document.getElementById('clearDoneBtn'),
            filterBtns: document.querySelectorAll('.filter-btn'),
            pagination: document.getElementById('pagination'),
            totalCount: document.getElementById('totalCount'),
            stinkyCount: document.getElementById('stinkyCount'),
            doneCount: document.getElementById('doneCount'),
            overdueCount: document.getElementById('overdueCount'),
            toast: document.getElementById('toast')
        };
    }

    bindEvents() {
        this.elements.addBtn.addEventListener('click', () => this.addTodo());
        this.elements.todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTodo();
        });
        this.elements.clearDoneBtn.addEventListener('click', () => this.clearCompleted());

        this.elements.filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.elements.filterBtns.forEach(b => {
                    b.classList.remove('active');
                    b.setAttribute('aria-selected', 'false');
                });
                btn.classList.add('active');
                btn.setAttribute('aria-selected', 'true');
                this.currentFilter = btn.dataset.filter;
                this.currentPage = 1;
                this.render();
            });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'n' && e.target.tagName!== 'INPUT' && e.target.tagName!== 'TEXTAREA') {
                e.preventDefault();
                this.elements.todoInput.focus();
            }
        });
    }

    loadTodos() {
        return JSON.parse(localStorage.getItem('stinkyTodos')) || [];
    }

    saveTodos() {
        localStorage.setItem('stinkyTodos', JSON.stringify(this.todos));
    }

    addTodo() {
        const text = this.elements.todoInput.value.trim();
        if (!text) {
            this.showToast('Task cannot be empty!');
            return;
        }

        const todo = {
            id: Date.now(),
            text,
            note: this.elements.noteInput.value.trim(),
            priority: this.elements.prioritySelect.value,
            category: this.elements.categorySelect.value,
            dueDate: this.elements.dueDateInput.value? new Date(this.elements.dueDateInput.value).getTime() : null,
            completed: false,
            createdAt: Date.now(),
            stinky: false,
            stinkyLevel: 0
        };

        this.todos.unshift(todo);
        this.saveTodos();
        this.currentPage = 1;
        this.render();
        this.showToast('Task added!');

        this.elements.todoInput.value = '';
        this.elements.noteInput.value = '';
        this.elements.dueDateInput.value = '';
        this.elements.todoInput.focus();
    }

    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed =!todo.completed;
            this.saveTodos();
            this.render();
        }
    }

    deleteTodo(id) {
        this.todos = this.todos.filter(t => t.id!== id);
        this.saveTodos();
        this.render();
        this.showToast('Task deleted');
    }

    editTodo(id, newText) {
        const todo = this.todos.find(t => t.id === id);
        if (todo && newText.trim()) {
            todo.text = newText.trim();
            this.saveTodos();
            this.render();
        }
    }

    clearCompleted() {
        const count = this.todos.filter(t => t.completed).length;
        this.todos = this.todos.filter(t =>!t.completed);
        this.saveTodos();
        this.render();
        this.showToast(`Cleared ${count} completed task${count!== 1? 's' : ''}`);
    }

    checkStinky() {
        const now = Date.now();
        let changed = false;

        this.todos.forEach(todo => {
            if (!todo.completed) {
                const age = now - todo.createdAt;
                const days = Math.floor(age / 86400000);

                if (age > this.STINKY_TIME &&!todo.stinky) {
                    todo.stinky = true;
                    changed = true;
                }

                if (days >= 7) todo.stinkyLevel = 3;
                else if (days >= 5) todo.stinkyLevel = 2;
                else if (days >= 3) todo.stinkyLevel = 1;
                else todo.stinkyLevel = 0;
            }
        });

        if (changed) this.saveTodos();
    }

    isOverdue(todo) {
        return todo.dueDate &&!todo.completed && Date.now() > todo.dueDate;
    }

    getFilteredTodos() {
        this.checkStinky();
        let filtered = this.todos;

        switch (this.currentFilter) {
            case 'active':
                filtered = this.todos.filter(t =>!t.completed);
                break;
            case 'stinky':
                filtered = this.todos.filter(t => t.stinky &&!t.completed);
                break;
            case 'overdue':
                filtered = this.todos.filter(t => this.isOverdue(t));
                break;
            case 'done':
                filtered = this.todos.filter(t => t.completed);
                break;
        }

        return filtered;
    }

    getPaginatedTodos() {
        const filtered = this.getFilteredTodos();
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        return {
            items: filtered.slice(start, end),
            total: filtered.length,
            pages: Math.ceil(filtered.length / this.itemsPerPage)
        };
    }

    render() {
        const { items, total, pages } = this.getPaginatedTodos();

        if (total === 0) {
            this.elements.todoList.innerHTML = '';
            this.elements.emptyState.classList.add('show');
            this.elements.pagination.innerHTML = '';
        } else {
            this.elements.emptyState.classList.remove('show');
            this.elements.todoList.innerHTML = items.map(todo => this.renderTodoItem(todo)).join('');
            this.renderPagination(pages);
        }

        this.updateStats();
    }

    renderTodoItem(todo) {
        const stinkyClass = todo.stinky? `stinky level-${todo.stinkyLevel}` : '';
        const overdueClass = this.isOverdue(todo)? 'overdue' : '';

        return `
            <div class="todo-item ${todo.completed? 'done' : ''} ${stinkyClass} ${overdueClass}" role="listitem">
                <button class="todo-checkbox ${todo.completed? 'checked' : ''}" 
                        onclick="app.toggleTodo(${todo.id})"
                        aria-label="${todo.completed? 'Mark incomplete' : 'Mark complete'}">
                </button>
                <div class="todo-content">
                    <div class="todo-header">
                        <span class="todo-text" contenteditable="false" 
                              onblur="app.editTodo(${todo.id}, this.textContent)"
                              onkeydown="if(event.key==='Enter'){event.preventDefault();this.blur();}"
                              ondblclick="this.contentEditable=true;this.focus();"
                              role="textbox"
                              aria-label="Task text">${this.escapeHtml(todo.text)}</span>
                        <span class="priority ${todo.priority}">${todo.priority}</span>
                        <span class="category">${todo.category}</span>
                    </div>
                    ${todo.note? `<div class="todo-note">${this.escapeHtml(todo.note)}</div>` : ''}
                    <div class="todo-meta">
                        <span>${this.getAgeText(todo.createdAt)}</span>
                        ${todo.dueDate? `<span class="due-date ${this.isOverdue(todo)? 'overdue' : ''}">Due: ${new Date(todo.dueDate).toLocaleDateString()}</span>` : ''}
                        ${todo.stinky &&!todo.completed? `<span class="stinky-badge">${this.getStinkyLevel(todo.createdAt)}</span>` : ''}
                    </div>
                </div>
                <div class="todo-actions">
                    <button class="action-btn delete" onclick="app.deleteTodo(${todo.id})" aria-label="Delete task">🗑</button>
                </div>
            </div>
        `;
    }

    renderPagination(totalPages) {
        if (totalPages <= 1) {
            this.elements.pagination.innerHTML = '';
            return;
        }

        let html = '';

        // Prev button
        html += `<button class="page-btn" onclick="app.goToPage(${this.currentPage - 1})" ${this.currentPage === 1? 'disabled' : ''} aria-label="Previous page">‹</button>`;

        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.currentPage - 1 && i <= this.currentPage + 1)) {
                html += `<button class="page-btn ${i === this.currentPage? 'active' : ''}" onclick="app.goToPage(${i})" aria-label="Page ${i}" aria-current="${i === this.currentPage? 'page' : 'false'}">${i}</button>`;
            } else if (i === this.currentPage - 2 || i === this.currentPage + 2) {
                html += `<span class="page-btn" style="cursor:default;border:none;">...</span>`;
            }
        }

        // Next button
        html += `<button class="page-btn" onclick="app.goToPage(${this.currentPage + 1})" ${this.currentPage === totalPages? 'disabled' : ''} aria-label="Next page">›</button>`;

        this.elements.pagination.innerHTML = html;
    }

    goToPage(page) {
        this.currentPage = page;
        this.render();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    updateStats() {
        this.elements.totalCount.textContent = this.todos.length;
        this.elements.stinkyCount.textContent = this.todos.filter(t => t.stinky &&!t.completed).length;
        this.elements.doneCount.textContent = this.todos.filter(t => t.completed).length;
        this.elements.overdueCount.textContent = this.todos.filter(t => this.isOverdue(t)).length;
    }

    getAgeText(timestamp) {
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

    getStinkyLevel(timestamp) {
        const age = Date.now() - timestamp;
        const days = Math.floor(age / 86400000);

        if (days >= 7) return '💀 ROTting';
        if (days >= 5) return '🤢 Very Stinky';
        if (days >= 3) return '😷 Stinky';
        return '';
    }

    showToast(message) {
        this.elements.toast.textContent = message;
        this.elements.toast.classList.add('show');
        setTimeout(() => this.elements.toast.classList.remove('show'), 3000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    startStinkTimer() {
        setInterval(() => {
            this.checkStinky();
            this.render();
        }, 60000); // Check every minute
    }
}

// Init
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new StinkyTodo();
});