const addBtn = document.getElementById('addBtn');
const notesContainer = document.getElementById('notesContainer');
const searchInput = document.getElementById('searchInput');
const emptyState = document.getElementById('emptyState');
const emptyTitle = document.getElementById('emptyTitle');
const emptyText = document.getElementById('emptyText');

// Configure marked to be safe
marked.setOptions({
    breaks: true,
    gfm: true
});

// Load notes from localStorage
const notes = JSON.parse(localStorage.getItem('notes')) || [];

if (notes.length > 0) {
    notes.sort((a, b) => b.updated - a.updated); // Show newest first
    notes.forEach(note => addNewNote(note));
} else {
    updateEmptyState();
}

// Add new note
addBtn.addEventListener('click', () => addNewNote());

// Search functionality
searchInput.addEventListener('input', filterNotes);

function addNewNote(noteData = null) {
    const id = noteData?.id || Date.now();
    const text = noteData?.text || '';
    const created = noteData?.created || Date.now();
    const updated = noteData?.updated || Date.now();

    const note = document.createElement('div');
    note.classList.add('note');
    note.dataset.id = id;

    note.innerHTML = `
        <div class="note-header">
            <span class="note-date">${formatDate(updated)}</span>
            <div class="note-actions">
                <button class="note-btn edit-btn" aria-label="Edit note">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                </button>
                <button class="note-btn delete-btn" aria-label="Delete note">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            </div>
        </div>
        <div class="main ${text ? '' : 'hidden'}"></div>
        <textarea class="${text ? 'hidden' : ''}" placeholder="Start typing... (Markdown supported)" aria-label="Note content"></textarea>
    `;

    const editBtn = note.querySelector('.edit-btn');
    const deleteBtn = note.querySelector('.delete-btn');
    const main = note.querySelector('.main');
    const textArea = note.querySelector('textarea');
    const dateEl = note.querySelector('.note-date');

    textArea.value = text;
    renderMarkdown(text, main);

    deleteBtn.addEventListener('click', () => {
        if (confirm('Delete this note?')) {
            note.remove();
            updateLS();
            updateEmptyState();
        }
    });

    editBtn.addEventListener('click', () => {
        const isEditing = !textArea.classList.contains('hidden');
        if (isEditing) {
            main.classList.remove('hidden');
            textArea.classList.add('hidden');
        } else {
            main.classList.add('hidden');
            textArea.classList.remove('hidden');
            textArea.focus();
            autoResize(textArea);
        }
    });

    textArea.addEventListener('input', (e) => {
        const { value } = e.target;
        renderMarkdown(value, main);
        dateEl.textContent = formatDate(Date.now());
        autoResize(textArea);
        updateLS();
    });

    notesContainer.insertBefore(note, notesContainer.firstChild);
    updateEmptyState();
    filterNotes(); // Re-apply search filter

    if (!text) {
        textArea.focus();
    }
}

function renderMarkdown(text, element) {
    const rawHtml = marked.parse(text);
    const cleanHtml = DOMPurify.sanitize(rawHtml);
    element.innerHTML = cleanHtml;
}

function autoResize(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
}

function updateLS() {
    const noteElements = document.querySelectorAll('.note');
    const notes = [];

    noteElements.forEach(noteEl => {
        const id = +noteEl.dataset.id;
        const text = noteEl.querySelector('textarea').value;
        const existing = notes.find(n => n.id === id);
        notes.push({
            id,
            text,
            created: existing?.created || id,
            updated: Date.now()
        });
    });

    localStorage.setItem('notes', JSON.stringify(notes));
}

function updateEmptyState() {
    const allNotes = document.querySelectorAll('.note');
    const visibleNotes = Array.from(allNotes).filter(n => n.style.display !== 'none');
    const hasNotes = allNotes.length > 0;
    const hasVisibleNotes = visibleNotes.length > 0;

    if (!hasNotes) {
        emptyTitle.textContent = 'No notes yet';
        emptyText.textContent = 'Click "Add Note" to create your first note';
        emptyState.classList.remove('hidden');
    } else if (!hasVisibleNotes && searchInput.value) {
        emptyTitle.textContent = 'No matching notes';
        emptyText.textContent = 'Try a different search term';
        emptyState.classList.remove('hidden');
    } else {
        emptyState.classList.add('hidden');
    }
}

function filterNotes() {
    const searchTerm = searchInput.value.toLowerCase();
    const noteElements = document.querySelectorAll('.note');

    noteElements.forEach(noteEl => {
        const text = noteEl.querySelector('textarea').value.toLowerCase();
        noteEl.style.display = text.includes(searchTerm) ? 'flex' : 'none';
    });
    
    updateEmptyState();
}

function formatDate(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
}

// Auto-resize existing textareas on load
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.note textarea').forEach(autoResize);
});