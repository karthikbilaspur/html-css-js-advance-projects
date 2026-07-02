// JavaScript for Code 73
const markdownInput = document.getElementById('markdown-input');
const preview = document.getElementById('preview');
const charCount = document.getElementById('char-count');
const wordCount = document.getElementById('word-count');
const toggleViewBtn = document.getElementById('toggle-view');
const clearBtn = document.getElementById('clear-btn');
const copyHtmlBtn = document.getElementById('copy-html');
const downloadBtn = document.getElementById('download-md');
const editorContainer = document.getElementById('editor-container');

let currentView = 'split';

// Configure marked with syntax highlighting
marked.setOptions({
    highlight: function(code, lang) {
        if (lang && hljs.getLanguage(lang)) {
            return hljs.highlight(code, { language: lang }).value;
        }
        return hljs.highlightAuto(code).value;
    },
    breaks: true,
    gfm: true
});

// Live preview
function updatePreview() {
    const markdown = markdownInput.value;
    const html = marked.parse(markdown);
    preview.innerHTML = html;

    // Update counts
    charCount.textContent = `${markdown.length} chars`;
    const words = markdown.trim().split(/\s+/).filter(w => w.length > 0);
    wordCount.textContent = `${words.length} words`;

    // Save to localStorage
    localStorage.setItem('markdown_73_draft', markdown);
}

// Load saved draft
function loadDraft() {
    const saved = localStorage.getItem('markdown_73_draft');
    if (saved) {
        markdownInput.value = saved;
    } else {
        markdownInput.value = markdownInput.placeholder;
    }
    updatePreview();
}

// Debounce for performance
let debounceTimer;
markdownInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(updatePreview, 150);
});

// Toggle view: split, editor-only, preview-only
toggleViewBtn.addEventListener('click', () => {
    if (currentView === 'split') {
        currentView = 'editor-only';
        editorContainer.className = 'editor-container editor-only';
        toggleViewBtn.textContent = 'Editor Only';
    } else if (currentView === 'editor-only') {
        currentView = 'preview-only';
        editorContainer.className = 'editor-container preview-only';
        toggleViewBtn.textContent = 'Preview Only';
    } else {
        currentView = 'split';
        editorContainer.className = 'editor-container';
        toggleViewBtn.textContent = 'Split View';
    }
});

// Clear
clearBtn.addEventListener('click', () => {
    if (confirm('Clear all content?')) {
        markdownInput.value = '';
        updatePreview();
        markdownInput.focus();
    }
});

// Copy HTML
copyHtmlBtn.addEventListener('click', async () => {
    const html = marked.parse(markdownInput.value);
    try {
        await navigator.clipboard.writeText(html);
        copyHtmlBtn.textContent = 'Copied!';
        setTimeout(() => copyHtmlBtn.textContent = 'Copy HTML', 2000);
    } catch (err) {
        alert('Failed to copy');
    }
});

// Download .md
downloadBtn.addEventListener('click', () => {
    const blob = new Blob([markdownInput.value], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.md';
    a.click();
    URL.revokeObjectURL(url);
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
        if (e.key === 's') {
            e.preventDefault();
            localStorage.setItem('markdown_73_draft', markdownInput.value);
        }
    }
});

// Init
loadDraft();
markdownInput.focus();

// Auto-resize textarea
markdownInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = this.scrollHeight + 'px';
});