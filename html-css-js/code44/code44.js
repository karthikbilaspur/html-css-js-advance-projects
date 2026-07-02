// JavaScript for Code 44
const notesListEl = document.getElementById('notes-list');
const noteTitleEl = document.getElementById('note-title');
const noteContentEl = document.getElementById('note-content');
const noteTagsEl = document.getElementById('note-tags');
const saveStatusEl = document.getElementById('save-status');
const noteMetaEl = document.getElementById('note-meta');
const newNoteBtn = document.getElementById('new-note-btn');
const deleteBtn = document.getElementById('delete-btn');
const searchEl = document.getElementById('search');

const STORAGE_KEY = 'notes_app_44_pro';
let notes = [];
let activeNoteId = null;
let saveTimeout = null;

// Init
window.addEventListener('DOMContentLoaded', () => {
    loadNotes();
    if (notes.length === 0) {
        createNewNote();
    } else {
        setActiveNote(notes[0].id);
    }
    renderNotesList();
});

// Load/save from localStorage
function loadNotes() {
    const saved = localStorage.getItem(STORAGE_KEY);
    notes = saved? JSON.parse(saved) : [];
}

function saveNotes() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    updateSaveStatus('Saved');
}

// Note operations
function createNewNote() {
    const newNote = {
        id: Date.now().toString(),
        title: 'Untitled Note',
        content: '',
        tags: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
    };
    notes.unshift(newNote);
    saveNotes();
    setActiveNote(newNote.id);
    renderNotesList();
    noteTitleEl.focus();
}

function setActiveNote(id) {
    activeNoteId = id;
    const note = notes.find(n => n.id === id);
    if (!note) return;

    noteTitleEl.value = note.title;
    noteContentEl.innerHTML = note.content;
    noteTagsEl.value = note.tags.join(', ');

    updateMeta(note);
    renderNotesList();
}

function updateActiveNote() {
    const note = notes.find(n => n.id === activeNoteId);
    if (!note) return;

    note.title = noteTitleEl.value || 'Untitled Note';
    note.content = noteContentEl.innerHTML;
    note.tags = noteTagsEl.value.split(',').map(t => t.trim()).filter(t => t);
    note.updatedAt = Date.now();

    // Move to top
    notes = [note,...notes.filter(n => n.id!== activeNoteId)];
    saveNotes();
    updateMeta(note);
}

function deleteActiveNote() {
    if (!activeNoteId ||!confirm('Delete this note?')) return;

    notes = notes.filter(n => n.id!== activeNoteId);
    saveNotes();

    if (notes.length > 0) {
        setActiveNote(notes[0].id);
    } else {
        createNewNote();
    }
    renderNotesList();
}

// Auto-save logic
function triggerSave() {
    updateSaveStatus('Saving...', true);
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
        updateActiveNote();
        renderNotesList();
    }, 500);
}

function updateSaveStatus(text, isSaving = false) {
    saveStatusEl.textContent = text;
    saveStatusEl.classList.toggle('saving', isSaving);
}

function updateMeta(note) {
    const date = new Date(note.updatedAt);
    const wordCount = noteContentEl.innerText.trim().split(/\s+/).filter(w => w).length;
    noteMetaEl.textContent = `${wordCount} words • Updated ${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
}

// Render sidebar list
function renderNotesList() {
    const query = searchEl.value.toLowerCase();
    const filtered = notes.filter(note =>
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query) ||
        note.tags.some(t => t.toLowerCase().includes(query))
    );

    notesListEl.innerHTML = filtered.map(note => {
        const preview = note.content.replace(/<[^>]*>/g, '').substring(0, 60);
        const date = new Date(note.updatedAt).toLocaleDateString();
        return `
            <div class="note-item ${note.id === activeNoteId? 'active' : ''}" data-id="${note.id}">
                <div class="note-item-title">${note.title}</div>
                <div class="note-item-preview">${preview || 'No content'}</div>
                <div class="note-item-date">${date}</div>
            </div>
        `;
    }).join('');
}

// Event listeners
noteTitleEl.addEventListener('blur', triggerSave);
noteContentEl.addEventListener('blur', triggerSave);
noteTagsEl.addEventListener('blur', triggerSave);

noteTitleEl.addEventListener('input', triggerSave);
noteContentEl.addEventListener('input', triggerSave);
noteTagsEl.addEventListener('input', triggerSave);

newNoteBtn.addEventListener('click', createNewNote);
deleteBtn.addEventListener('click', deleteActiveNote);
searchEl.addEventListener('input', renderNotesList);

notesListEl.addEventListener('click', (e) => {
    const item = e.target.closest('.note-item');
    if (item) setActiveNote(item.dataset.id);
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        createNewNote();
    }
});