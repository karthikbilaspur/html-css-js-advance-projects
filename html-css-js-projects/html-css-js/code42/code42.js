// JavaScript for Code 42
// Todo List v1 - Using createElement, appendChild, with delete
// Advanced features: localStorage, filters, edit, due dates

class TodoApp {
  constructor() {
    this.todos = this.loadTodos();
    this.currentFilter = 'all';
    
    this.todoInput = document.getElementById('todoInput');
    this.dateInput = document.getElementById('dateInput');
    this.addBtn = document.getElementById('addBtn');
    this.todoList = document.getElementById('todoList');
    this.clearCompleted = document.getElementById('clearCompleted');
    
    this.initEventListeners();
    this.render();
  }

  initEventListeners() {
    this.addBtn.addEventListener('click', () => this.addTodo());
    this.todoInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.addTodo();
    });
    
    this.clearCompleted.addEventListener('click', () => this.clearCompletedTodos());
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.setFilter(e.target.dataset.filter));
    });
  }

  loadTodos() {
    const stored = localStorage.getItem('code42_todos');
    return stored ? JSON.parse(stored) : [];
  }

  saveTodos() {
    localStorage.setItem('code42_todos', JSON.stringify(this.todos));
    this.updateCounts();
  }

  addTodo() {
    const text = this.todoInput.value.trim();
    if (!text) return;

    const todo = {
      id: Date.now(),
      text: text,
      completed: false,
      dueDate: this.dateInput.value || null,
      createdAt: new Date().toISOString()
    };

    this.todos.unshift(todo);
    this.todoInput.value = '';
    this.dateInput.value = '';
    this.saveTodos();
    this.render();
  }

  deleteTodo(id) {
    this.todos = this.todos.filter(t => t.id !== id);
    this.saveTodos();
    this.render();
  }

  toggleTodo(id) {
    const todo = this.todos.find(t => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      this.saveTodos();
      this.render();
    }
  }

  editTodo(id, newText) {
    const todo = this.todos.find(t => t.id === id);
    if (todo && newText.trim()) {
      todo.text = newText.trim();
      this.saveTodos();
      this.render();
    }
  }

  clearCompletedTodos() {
    this.todos = this.todos.filter(t => !t.completed);
    this.saveTodos();
    this.render();
  }

  setFilter(filter) {
    this.currentFilter = filter;
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === filter);
    });
    this.render();
  }

  getFilteredTodos() {
    switch (this.currentFilter) {
      case 'active':
        return this.todos.filter(t => !t.completed);
      case 'completed':
        return this.todos.filter(t => t.completed);
      default:
        return this.todos;
    }
  }

  createTodoElement(todo) {
    // Using createElement and appendChild as requested
    const li = document.createElement('li');
    li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
    li.dataset.id = todo.id;

    // Checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'todo-checkbox';
    checkbox.checked = todo.completed;
    checkbox.addEventListener('change', () => this.toggleTodo(todo.id));

    // Content wrapper
    const content = document.createElement('div');
    content.className = 'todo-content';

    // Text
    const textSpan = document.createElement('div');
    textSpan.className = 'todo-text';
    textSpan.textContent = todo.text;
    textSpan.addEventListener('dblclick', () => this.startEdit(todo.id, textSpan));

    // Edit input - hidden initially
    const editInput = document.createElement('input');
    editInput.type = 'text';
    editInput.className = 'edit-input';
    editInput.style.display = 'none';
    editInput.value = todo.text;
    editInput.addEventListener('blur', () => this.finishEdit(todo.id, editInput));
    editInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') editInput.blur();
      if (e.key === 'Escape') this.render();
    });

    // Due date
    if (todo.dueDate) {
      const dateSpan = document.createElement('div');
      dateSpan.className = 'todo-date';
      const due = new Date(todo.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (due < today && !todo.completed) {
        dateSpan.classList.add('overdue');
      }
      dateSpan.textContent = `Due: ${due.toLocaleDateString()}`;
      content.appendChild(textSpan);
      content.appendChild(editInput);
      content.appendChild(dateSpan);
    } else {
      content.appendChild(textSpan);
      content.appendChild(editInput);
    }

    // Actions
    const actions = document.createElement('div');
    actions.className = 'todo-actions';

    const editBtn = document.createElement('button');
    editBtn.className = 'icon-btn';
    editBtn.innerHTML = '✏️';
    editBtn.title = 'Edit';
    editBtn.addEventListener('click', () => this.startEdit(todo.id, textSpan));

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'icon-btn delete-btn';
    deleteBtn.innerHTML = '🗑️';
    deleteBtn.title = 'Delete';
    deleteBtn.addEventListener('click', () => this.deleteTodo(todo.id));

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    // Append all using appendChild
    li.appendChild(checkbox);
    li.appendChild(content);
    li.appendChild(actions);

    return li;
  }

  startEdit(id, textElement) {
    const li = document.querySelector(`[data-id="${id}"]`);
    const input = li.querySelector('.edit-input');
    textElement.style.display = 'none';
    input.style.display = 'block';
    input.focus();
    input.select();
  }

  finishEdit(id, input) {
    this.editTodo(id, input.value);
  }

  updateCounts() {
    const all = this.todos.length;
    const active = this.todos.filter(t => !t.completed).length;
    const completed = all - active;

    document.getElementById('allCount').textContent = all;
    document.getElementById('activeCount').textContent = active;
    document.getElementById('completedCount').textContent = completed;
    document.getElementById('itemsLeft').textContent = `${active} item${active !== 1 ? 's' : ''} left`;
  }

  render() {
    // Clear list using appendChild approach
    while (this.todoList.firstChild) {
      this.todoList.removeChild(this.todoList.firstChild);
    }

    const filtered = this.getFilteredTodos();

    if (filtered.length === 0) {
      const emptyDiv = document.createElement('div');
      emptyDiv.className = 'empty-state';
      emptyDiv.textContent = this.currentFilter === 'all' 
        ? 'No todos yet. Add one above!' 
        : `No ${this.currentFilter} todos`;
      this.todoList.appendChild(emptyDiv);
    } else {
      filtered.forEach(todo => {
        const todoEl = this.createTodoElement(todo);
        this.todoList.appendChild(todoEl);
      });
    }

    this.updateCounts();
  }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  new TodoApp();
});