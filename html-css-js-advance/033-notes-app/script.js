const addBtn = document.getElementById('addBtn');
const notesContainer = document.getElementById('notesContainer');
const searchInput = document.getElementById('searchInput');
const emptyState = document.getElementById('emptyState');

// Load notes from localStorage
const notes = JSON.parse(localStorage.getItem('notes')) || [];

if (notes.length > 0) {
    notes.forEach(note => addNewNote(note));
} else {
    updateEmptyState();
}

// Add new note
addBtn.addEventListener('click', () => addNewNote());

// Search functionality
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const noteElements = document.querySelectorAll('.note');

    noteElements.forEach(noteEl => {
        const text = noteEl.querySelector('textarea').value.toLowerCase();
        noteEl.style.display = text.includes(searchTerm) ? 'flex' : 'none';
    });
});

function addNewNote(text = '') {
    const note = document.createElement('div');
    note.classList.add('note');

    note.innerHTML = `
        <div class="note-header">
            <button class="note-btn edit-btn" title="Edit">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
            </button>
            <button class="note-btn delete-btn" title="Delete">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
            </button>
        </div>
        <div class="main ${text ? '' : 'hidden'}"></div>
        <textarea class="${text ? 'hidden' : ''}" placeholder="Start typing... (Markdown supported)"></textarea>
    `;

    const editBtn = note.querySelector('.edit-btn');
    const deleteBtn = note.querySelector('.delete-btn');
    const main = note.querySelector('.main');
    const textArea = note.querySelector('textarea');

    textArea.value = text;
    main.innerHTML = marked.parse(text);

    deleteBtn.addEventListener('click', () => {
        note.remove();
        updateLS();
        updateEmptyState();
    });

    editBtn.addEventListener('click', () => {
        main.classList.toggle('hidden');
        textArea.classList.toggle('hidden');
    });

    textArea.addEventListener('input', (e) => {
        const { value } = e.target;
        main.innerHTML = marked.parse(value);
        updateLS();
    });

    notesContainer.appendChild(note);
    updateEmptyState();

    // Focus on textarea if new note
    if (!text) {
        textArea.focus();
    }
}

function updateLS() {
    const notesText = document.querySelectorAll('textarea');
    const notes = [];

    notesText.forEach(note => notes.push(note.value));

    localStorage.setItem('notes', JSON.stringify(notes));
}

function updateEmptyState() {
    const hasNotes = document.querySelectorAll('.note').length > 0;
    emptyState.classList.toggle('hidden', hasNotes);
}