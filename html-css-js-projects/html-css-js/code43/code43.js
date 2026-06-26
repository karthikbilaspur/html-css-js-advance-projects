// Todo List v2 - Best Features with localStorage + JSON
class TodoAppV2 {
  constructor() {
    this.state = this.loadState();
    this.currentListId = this.state.lists[0]?.id || null;
    this.currentFilter = 'all';
    this.sortBy = 'created';
    this.searchQuery = '';

    this.initTheme();
    this.initEventListeners();
    this.render();
  }

  // localStorage + JSON handling
  loadState() {
    try {
      const stored = localStorage.getItem('code43_state');
      if (stored) {
        return JSON.parse(stored); // JSON.parse usage
      }
    } catch (e) {
      console.error('Failed to load state:', e);
    }
    return {
      lists: [{ id: 1, name: 'My Tasks', todos: [] }],
      theme: 'dark'
    };
  }

  saveState() {
    localStorage.setItem('code43_state', JSON.stringify(this.state)); // localStorage.setItem + JSON.stringify
  }

  initTheme() {
    document.body.dataset.theme = this.state.theme;
    document.getElementById('themeToggle').textContent = this.state.theme === 'dark'? '🌙' : '☀️';
  }

  initEventListeners() {
    document.getElementById('todoInput').addEventListener('keypress', e => {
      if (e.key === 'Enter') this.addTodo();
    });

    document.getElementById('searchInput').addEventListener('input', e => {
      this.searchQuery = e.target.value.toLowerCase();
      this.render();
    });

    document.getElementById('sortBy').addEventListener('change', e => {
      this.sortBy = e.target.value;
      this.render();
    });

    document.querySelectorAll('.chip').forEach(chip => {
      chip.addEventListener('click', e => this.setFilter(e.target.dataset.filter));
    });

    document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());
    document.getElementById('addListBtn').addEventListener('click', () => this.addList());
    document.getElementById('clearDone').addEventListener('click', () => this.clearCompleted());
    document.getElementById('exportBtn').addEventListener('click', () => this.exportJSON());
    document.getElementById('importBtn').addEventListener('click', () => document.getElementById('importFile').click());
    document.getElementById('importFile').addEventListener('change', e => this.importJSON(e));
  }

  getCurrentList() {
    return this.state.lists.find(l => l.id === this.currentListId);
  }

  addTodo() {
    const input = document.getElementById('todoInput');
    const text = input.value.trim();
    if (!text) return;

    const todo = {
      id: Date.now(),
      text,
      completed: false,
      priority: document.getElementById('priorityInput').value,
      dueDate: document.getElementById('dateInput').value || null,
      tags: document.getElementById('tagsInput').value.split(',').map(t => t.trim()).filter(Boolean),
      createdAt: new Date().toISOString(),
      notes: ''
    };

    this.getCurrentList().todos.unshift(todo);
    input.value = '';
    document.getElementById('tagsInput').value = '';
    document.getElementById('dateInput').value = '';
    this.saveState();
    this.render();
  }

  toggleTodo(todoId) {
    const todo = this.getCurrentList().todos.find(t => t.id === todoId);
    if (todo) {
      todo.completed =!todo.completed;
      todo.completedAt = todo.completed? new Date().toISOString() : null;
      this.saveState();
      this.render();
    }
  }

  deleteTodo(todoId) {
    const list = this.getCurrentList();
    list.todos = list.todos.filter(t => t.id!== todoId);
    this.saveState();
    this.render();
  }

  editTodo(todoId) {
    const todo = this.getCurrentList().todos.find(t => t.id === todoId);
    const newText = prompt('Edit task:', todo.text);
    if (newText!== null && newText.trim()) {
      todo.text = newText.trim();
      this.saveState();
      this.render();
    }
  }

  addList() {
    const name = prompt('List name:');
    if (name && name.trim()) {
      const newList = { id: Date.now(), name: name.trim(), todos: [] };
      this.state.lists.push(newList);
      this.currentListId = newList.id;
      this.saveState();
      this.render();
    }
  }

  switchList(listId) {
    this.currentListId = listId;
    this.render();
  }

  setFilter(filter) {
    this.currentFilter = filter;
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
    this.render();
  }

  toggleTheme() {
    this.state.theme = this.state.theme === 'dark'? 'light' : 'dark';
    this.initTheme();
    this.saveState();
  }

  clearCompleted() {
    const list = this.getCurrentList();
    list.todos = list.todos.filter(t =>!t.completed);
    this.saveState();
    this.render();
  }

  // Export/Import JSON - key feature
  exportJSON() {
    const dataStr = JSON.stringify(this.state, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `todos-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  }

  importJSON(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const imported = JSON.parse(evt.target.result);
        if (imported.lists && Array.isArray(imported.lists)) {
          this.state = imported;
          this.currentListId = this.state.lists[0]?.id;
          this.saveState();
          this.render();
          alert('Import successful!');
        }
      } catch (err) {
        alert('Invalid JSON file');
      }
    };
    reader.readAsText(file);
  }

  getFilteredTodos() {
    let todos = [...this.getCurrentList().todos];
    const today = new Date().toISOString().split('T')[0];

    // Search filter
    if (this.searchQuery) {
      todos = todos.filter(t =>
        t.text.toLowerCase().includes(this.searchQuery) ||
        t.tags.some(tag => tag.toLowerCase().includes(this.searchQuery))
      );
    }

    // Status filter
    switch (this.currentFilter) {
      case 'today':
        todos = todos.filter(t => t.dueDate === today &&!t.completed);
        break;
      case 'upcoming':
        todos = todos.filter(t => t.dueDate > today &&!t.completed);
        break;
      case 'completed':
        todos = todos.filter(t => t.completed);
        break;
    }

    // Sorting
    todos.sort((a, b) => {
      switch (this.sortBy) {
        case 'due':
          return (a.dueDate || '9999') > (b.dueDate || '9999')? 1 : -1;
        case 'priority':
          const p = { high: 3, medium: 2, low: 1 };
          return p[b.priority] - p[a.priority];
        case 'alpha':
          return a.text.localeCompare(b.text);
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    return todos;
  }

  createTodoElement(todo) {
    const div = document.createElement('div');
    div.className = `todo ${todo.completed? 'completed' : ''}`;
    div.draggable = true;
    div.dataset.id = todo.id;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'todo-checkbox';
    checkbox.checked = todo.completed;
    checkbox.addEventListener('change', () => this.toggleTodo(todo.id));

    const body = document.createElement('div');
    body.className = 'todo-body';

    const title = document.createElement('div');
    title.className = 'todo-title';
    title.textContent = todo.text;

    const meta = document.createElement('div');
    meta.className = 'todo-meta';

    const priority = document.createElement('span');
    priority.className = `priority ${todo.priority}`;
    priority.textContent = todo.priority;
    meta.appendChild(priority);

    if (todo.dueDate) {
      const due = document.createElement('span');
      due.className = 'due';
      const today = new Date().toISOString().split('T')[0];
      if (todo.dueDate < today &&!todo.completed) due.classList.add('overdue');
      due.textContent = `📅 ${todo.dueDate}`;
      meta.appendChild(due);
    }

    todo.tags.forEach(tag => {
      const tagEl = document.createElement('span');
      tagEl.className = 'tag';
      tagEl.textContent = `#${tag}`;
      meta.appendChild(tagEl);
    });

    body.appendChild(title);
    body.appendChild(meta);

    const actions = document.createElement('div');
    actions.className = 'todo-actions';

    const editBtn = document.createElement('button');
    editBtn.className = 'icon-btn';
    editBtn.innerHTML = '✏️';
    editBtn.addEventListener('click', () => this.editTodo(todo.id));

    const delBtn = document.createElement('button');
    delBtn.className = 'icon-btn';
    delBtn.innerHTML = '🗑️';
    delBtn.addEventListener('click', () => this.deleteTodo(todo.id));

    actions.appendChild(editBtn);
    actions.appendChild(delBtn);

    div.appendChild(checkbox);
    div.appendChild(body);
    div.appendChild(actions);

    return div;
  }

  renderLists() {
    const container = document.getElementById('listsContainer');
    container.innerHTML = '';
    this.state.lists.forEach(list => {
      const div = document.createElement('div');
      div.className = `list-item ${list.id === this.currentListId? 'active' : ''}`;
      div.innerHTML = `
        <span>${list.name}</span>
        <span class="list-count">${list.todos.filter(t =>!t.completed).length}</span>
      `;
      div.addEventListener('click', () => this.switchList(list.id));
      container.appendChild(div);
    });
  }

  render() {
    this.renderLists();

    const list = this.getCurrentList();
    document.getElementById('currentListName').textContent = list.name;

    const todos = this.getFilteredTodos();
    const todoList = document.getElementById('todoList');
    todoList.innerHTML = '';

    if (todos.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty';
      empty.textContent = this.searchQuery? 'No matching tasks' : 'No tasks yet. Add one above!';
      todoList.appendChild(empty);
    } else {
      todos.forEach(todo => todoList.appendChild(this.createTodoElement(todo)));
    }

    const total = list.todos.length;
    const completed = list.todos.filter(t => t.completed).length;
    document.getElementById('statsText').textContent = `${completed}/${total} completed`;
  }
}

document.addEventListener('DOMContentLoaded', () => new TodoAppV2());