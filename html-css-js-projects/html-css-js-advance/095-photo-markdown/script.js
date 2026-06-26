const imageInput = document.getElementById('imageInput');
const filterCanvas = document.getElementById('filterCanvas');
const ctx = filterCanvas.getContext('2d');
const canvasInfo = document.getElementById('canvasInfo');

const brightness = document.getElementById('brightness');
const contrast = document.getElementById('contrast');
const saturation = document.getElementById('saturation');
const blur = document.getElementById('blur');
const brightVal = document.getElementById('brightVal');
const contrastVal = document.getElementById('contrastVal');
const satVal = document.getElementById('satVal');
const blurVal = document.getElementById('blurVal');

const resetFiltersBtn = document.getElementById('resetFiltersBtn');
const downloadBtn = document.getElementById('downloadBtn');
const presetBtns = document.querySelectorAll('.preset-btn');

const modeBtns = document.querySelectorAll('.mode-btn');
const filterMode = document.getElementById('filterMode');
const notesMode = document.getElementById('notesMode');

const newNoteBtn = document.getElementById('newNoteBtn');
const notesList = document.getElementById('notesList');
const noteTitle = document.getElementById('noteTitle');
const markdownInput = document.getElementById('markdownInput');
const markdownPreview = document.getElementById('markdownPreview');
const deleteNoteBtn = document.getElementById('deleteNoteBtn');
const wordCount = document.getElementById('wordCount');

let originalImage = null;
let currentFilters = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  blur: 0
};

// NOTES DATA
let notes = JSON.parse(localStorage.getItem('filternotes095') || '[]');
let currentNote = null;

// MODE SWITCHING
modeBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    modeBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const mode = btn.dataset.mode;
    filterMode.style.display = mode === 'filter'? 'block' : 'none';
    notesMode.style.display = mode === 'notes'? 'block' : 'none';
  });
});

// PHOTO FILTER LOGIC
imageInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    const img = new Image();
    img.onload = () => {
      originalImage = img;
      const maxSize = 800;
      let w = img.width;
      let h = img.height;

      if (w > maxSize || h > maxSize) {
        const ratio = Math.min(maxSize / w, maxSize / h);
        w *= ratio;
        h *= ratio;
      }

      filterCanvas.width = w;
      filterCanvas.height = h;
      applyFilters();
      canvasInfo.textContent = `${img.width}x${img.height}`;
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
});

function applyFilters() {
  if (!originalImage) return;

  ctx.clearRect(0, 0, filterCanvas.width, filterCanvas.height);
  ctx.filter = `
    brightness(${currentFilters.brightness}%)
    contrast(${currentFilters.contrast}%)
    saturate(${currentFilters.saturation}%)
    blur(${currentFilters.blur}px)
  `;

  ctx.drawImage(originalImage, 0, 0, filterCanvas.width, filterCanvas.height);
  ctx.filter = 'none';
}

// CONCEPT: Canvas pixel manipulation from 2048 + Tetris
function applyPreset(preset) {
  switch(preset) {
    case 'grayscale':
      currentFilters = { brightness: 100, contrast: 120, saturation: 0, blur: 0 };
      break;
    case 'sepia':
      currentFilters = { brightness: 110, contrast: 110, saturation: 150, blur: 0 };
      ctx.filter = 'sepia(100%)';
      break;
    case 'invert':
      currentFilters = { brightness: 100, contrast: 100, saturation: 100, blur: 0 };
      ctx.filter = 'invert(100%)';
      break;
    case 'vintage':
      currentFilters = { brightness: 90, contrast: 130, saturation: 80, blur: 1 };
      break;
  }
  updateSliders();
  applyFilters();
}

function updateSliders() {
  brightness.value = currentFilters.brightness;
  contrast.value = currentFilters.contrast;
  saturation.value = currentFilters.saturation;
  blur.value = currentFilters.blur;

  brightVal.textContent = currentFilters.brightness;
  contrastVal.textContent = currentFilters.contrast;
  satVal.textContent = currentFilters.saturation;
  blurVal.textContent = currentFilters.blur;
}

[brightness, contrast, saturation, blur].forEach(slider => {
  slider.addEventListener('input', (e) => {
    const id = e.target.id;
    currentFilters[id] = parseInt(e.target.value);
    document.getElementById(id + 'Val').textContent = e.target.value;
    applyFilters();
  });
});

presetBtns.forEach(btn => {
  btn.addEventListener('click', () => applyPreset(btn.dataset.preset));
});

resetFiltersBtn.addEventListener('click', () => {
  currentFilters = { brightness: 100, contrast: 100, saturation: 100, blur: 0 };
  updateSliders();
  applyFilters();
});

downloadBtn.addEventListener('click', () => {
  if (!originalImage) return;
  const link = document.createElement('a');
  link.download = 'filtered-image.png';
  link.href = filterCanvas.toDataURL();
  link.click();
});

// MARKDOWN NOTES LOGIC
function renderNotesList() {
  notesList.innerHTML = '';
  notes.forEach((note, i) => {
    const item = document.createElement('div');
    item.className = 'note-item';
    if (currentNote && currentNote.id === note.id) item.classList.add('active');
    item.innerHTML = `
      <div class="note-item-title">${note.title || 'Untitled'}</div>
      <div class="note-item-date">${new Date(note.updated).toLocaleDateString()}</div>
    `;
    item.addEventListener('click', () => loadNote(i));
    notesList.appendChild(item);
  });
}

function loadNote(index) {
  currentNote = notes[index];
  noteTitle.value = currentNote.title;
  markdownInput.value = currentNote.content;
  renderMarkdown();
  renderNotesList();
  updateWordCount();
}

newNoteBtn.addEventListener('click', () => {
  const note = {
    id: Date.now(),
    title: 'New Note',
    content: '',
    created: Date.now(),
    updated: Date.now()
  };
  notes.unshift(note);
  currentNote = note;
  saveNotes();
  renderNotesList();
  loadNote(0);
});

deleteNoteBtn.addEventListener('click', () => {
  if (!currentNote) return;
  if (confirm('Delete this note?')) {
    notes = notes.filter(n => n.id!== currentNote.id);
    currentNote = notes[0] || null;
    saveNotes();
    renderNotesList();
    if (currentNote) loadNote(0);
    else {
      noteTitle.value = '';
      markdownInput.value = '';
      renderMarkdown();
    }
  }
});

noteTitle.addEventListener('input', () => {
  if (!currentNote) return;
  currentNote.title = noteTitle.value;
  currentNote.updated = Date.now();
  saveNotes();
  renderNotesList();
});

markdownInput.addEventListener('input', () => {
  if (!currentNote) return;
  currentNote.content = markdownInput.value;
  currentNote.updated = Date.now();
  renderMarkdown();
  updateWordCount();
  saveNotes();
});

// CONCEPT: Markdown parsing with regex - teaches string manipulation
function renderMarkdown() {
  let html = markdownInput.value;

  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Bold, italic, code
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/`(.*?)`/g, '<code>$1</code>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

  // Lists
  html = html.replace(/^\- (.*$)/gim, '<ul><li>$1</li></ul>');
  html = html.replace(/<\/ul>\n<ul>/g, '');

  // Line breaks
  html = html.replace(/\n/g, '<br>');

  markdownPreview.innerHTML = html || '<span style="color:#7f8c8d">Preview will appear here...</span>';
}

function updateWordCount() {
  const words = markdownInput.value.trim().split(/\s+/).filter(w => w.length > 0).length;
  wordCount.textContent = `${words} words`;
}

function saveNotes() {
  localStorage.setItem('filternotes095', JSON.stringify(notes));
}

// Init
renderNotesList();
if (notes.length > 0) loadNote(0);
renderMarkdown();