const editor = document.getElementById('editor');
const htmlSource = document.getElementById('html-source');
const toggleSourceBtn = document.getElementById('toggle-source');
const clearBtn = document.getElementById('clear-btn');
const formatBlock = document.getElementById('format-block');
const createLinkBtn = document.getElementById('create-link');
const insertImageBtn = document.getElementById('insert-image');
const foreColorInput = document.getElementById('fore-color');
const hiliteColorInput = document.getElementById('hilite-color');
const wordCountEl = document.getElementById('word-count');
const charCountEl = document.getElementById('char-count');

let isSourceMode = false;

// execCommand wrapper
function execCommand(command, value = null) {
    editor.focus();
    document.execCommand(command, false, value);
    updateToolbarState();
    updateStats();
}

// Toolbar buttons
document.querySelectorAll('[data-command]').forEach(btn => {
    btn.addEventListener('click', () => {
        const command = btn.dataset.command;
        execCommand(command);
    });
});

// Format block dropdown
formatBlock.addEventListener('change', (e) => {
    if (e.target.value) {
        execCommand('formatBlock', e.target.value);
    }
    e.target.value = '';
});

// Link
createLinkBtn.addEventListener('click', () => {
    const url = prompt('Enter URL:', 'https://');
    if (url) {
        execCommand('createLink', url);
    }
});

// Image
insertImageBtn.addEventListener('click', () => {
    const url = prompt('Enter image URL:', 'https://');
    if (url) {
        execCommand('insertImage', url);
    }
});

// Colors
foreColorInput.addEventListener('input', (e) => {
    execCommand('foreColor', e.target.value);
});

hiliteColorInput.addEventListener('input', (e) => {
    execCommand('hiliteColor', e.target.value);
});

// Toggle HTML source
toggleSourceBtn.addEventListener('click', () => {
    isSourceMode =!isSourceMode;

    if (isSourceMode) {
        htmlSource.value = formatHTML(editor.innerHTML);
        htmlSource.classList.remove('hidden');
        editor.classList.add('hidden');
        toggleSourceBtn.innerHTML = '<i class="fas fa-eye"></i> Visual Editor';
    } else {
        editor.innerHTML = htmlSource.value;
        htmlSource.classList.add('hidden');
        editor.classList.remove('hidden');
        toggleSourceBtn.innerHTML = '<i class="fas fa-code"></i> HTML Source';
    }
});

// Format HTML for readability
function formatHTML(html) {
    return html
      .replace(/></g, '>\n<')
      .replace(/(<[^/][^>]*>)/g, '  $1')
      .trim();
}

// Clear
clearBtn.addEventListener('click', () => {
    if (confirm('Clear all content?')) {
        editor.innerHTML = '<p><br></p>';
        updateStats();
    }
});

// Update toolbar button states
function updateToolbarState() {
    document.querySelectorAll('[data-command]').forEach(btn => {
        const command = btn.dataset.command;
        if (document.queryCommandState(command)) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// Update word/char count
function updateStats() {
    const text = editor.innerText || '';
    const words = text.trim().split(/\s+/).filter(w => w.length > 0);
    const chars = text.length;

    wordCountEl.textContent = `${words.length} word${words.length!== 1? 's' : ''}`;
    charCountEl.textContent = `${chars} character${chars!== 1? 's' : ''}`;
}

// Keyboard shortcuts
editor.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
        switch(e.key.toLowerCase()) {
            case 'b':
                e.preventDefault();
                execCommand('bold');
                break;
            case 'i':
                e.preventDefault();
                execCommand('italic');
                break;
            case 'u':
                e.preventDefault();
                execCommand('underline');
                break;
        }
    }
});

// Update on input
editor.addEventListener('input', () => {
    updateStats();
    updateToolbarState();
});

editor.addEventListener('mouseup', updateToolbarState);
editor.addEventListener('keyup', updateToolbarState);

// Paste as plain text
editor.addEventListener('paste', (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
});

// Init
editor.focus();
updateStats();