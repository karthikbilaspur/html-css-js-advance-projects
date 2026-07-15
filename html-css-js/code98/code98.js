class VSCodeClone {
    constructor() {
        this.files = new Map();
        this.openTabs = [];
        this.activeFile = null;
        this.theme = 'dark';
        this.searchMatches = [];
        this.currentMatch = -1;

        this.initFiles();
        this.init();
    }

    initFiles() {
        this.files.set('index.html', {
            content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>App</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <h1>Hello World</h1>
    <button onclick="greet()">Click Me</button>
    <script src="app.js"></script>
</body>
</html>`,
            language: 'html',
            saved: true
        });

        this.files.set('style.css', {
            content: `body {
    margin: 0;
    padding: 20px;
    font-family: sans-serif;
    background: #f0f0f0;
}

h1 {
    color: #007acc;
    font-size: 2rem;
}

button {
    padding: 10px 20px;
    background: #007acc;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

button:hover {
    background: #005a9e;
}`,
            language: 'css',
            saved: true
        });

        this.files.set('app.js', {
            content: `// Main application file
console.log("Code98 Editor v2 loaded");

function greet() {
    const name = prompt("Enter your name:");
    if (name) {
        alert(\`Hello, \${name}!\`);
        console.log(\`Greeted: \${name}\`);
    }
}

// Auto-save simulation
let autoSaveTimer;
function autoSave() {
    clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(() => {
        console.log("Auto-saved");
    }, 2000);
}`,
            language: 'javascript',
            saved: true
        });

        this.files.set('config.json', {
            content: `{
    "name": "my-app",
    "version": "1.0.0",
    "theme": "dark",
    "editor": {
        "fontSize": 14,
        "tabSize": 4,
        "wordWrap": true
    }
}`,
            language: 'json',
            saved: true
        });
    }

    init() {
        this.renderFileTree();
        this.bindEvents();
        this.openFile('app.js');
        this.startAutoSave();
    }

    bindEvents() {
        // Activity bar
        document.querySelectorAll('.activity-item').forEach(item => {
            item.addEventListener('click', () => {
                document.querySelectorAll('.activity-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');

                document.querySelectorAll('.panel').forEach(p => p.classList.add('hidden'));
                document.getElementById(item.dataset.panel + '-panel').classList.remove('hidden');
            });
        });

        // Editor
        const editor = document.getElementById('editor');
        editor.addEventListener('input', () => this.onEditorInput());
        editor.addEventListener('scroll', () => this.syncScroll());
        editor.addEventListener('keyup', () => this.updateCursorPos());
        editor.addEventListener('click', () => this.updateCursorPos());
        editor.addEventListener('keydown', (e) => this.handleKeyDown(e));

        // Buttons
        document.getElementById('theme-toggle').addEventListener('click', () => this.toggleTheme());
        document.getElementById('save-btn').addEventListener('click', () => this.saveFile());
        document.getElementById('run-btn').addEventListener('click', () => this.runCode());
        document.getElementById('format-btn').addEventListener('click', () => this.formatCode());
        document.getElementById('new-file').addEventListener('click', () => this.newFile());
        document.getElementById('close-output').addEventListener('click', () => this.closeOutput());

        // Search
        document.getElementById('search-input').addEventListener('input', () => this.search());
        document.getElementById('replace-all-btn').addEventListener('click', () => this.replaceAll());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                if (e.key === 's') {
                    e.preventDefault();
                    this.saveFile();
                }
                if (e.key === 'f') {
                    e.preventDefault();
                    document.querySelector('[data-panel="search"]').click();
                    document.getElementById('search-input').focus();
                }
            }
            if (e.key === 'F5') {
                e.preventDefault();
                this.runCode();
            }
        });

        // Context menu
        document.addEventListener('contextmenu', (e) => {
            if (e.target.closest('.file-item')) {
                e.preventDefault();
                this.showContextMenu(e, e.target.closest('.file-item').dataset.file);
            }
        });
        document.addEventListener('click', () => this.hideContextMenu());
    }

    renderFileTree() {
        const tree = document.getElementById('file-tree');
        tree.innerHTML = '';

        const folder = document.createElement('div');
        folder.className = 'folder';

        const folderHeader = document.createElement('div');
        folderHeader.className = 'folder-header';
        folderHeader.innerHTML = '<span class="arrow">▼</span><span>📂 src</span>';
        folderHeader.addEventListener('click', () => {
            folder.classList.toggle('collapsed');
        });

        const folderContent = document.createElement('div');
        folderContent.className = 'folder-content';

        Array.from(this.files.keys()).forEach(filename => {
            const file = this.files.get(filename);
            const item = document.createElement('div');
            item.className = 'file-item';
            if (filename === this.activeFile) item.classList.add('active');
            if (!file.saved) item.classList.add('modified');

            const icon = this.getFileIcon(filename);
            item.innerHTML = `<span>${icon}</span> ${filename}`;
            item.dataset.file = filename;
            item.addEventListener('click', () => this.openFile(filename));

            folderContent.appendChild(item);
        });

        folder.appendChild(folderHeader);
        folder.appendChild(folderContent);
        tree.appendChild(folder);
    }

    getFileIcon(filename) {
        const ext = filename.split('.').pop();
        const icons = {html: '🌐', css: '🎨', js: '📜', json: '⚙️', md: '📝'};
        return icons[ext] || '📄';
    }

    openFile(filename) {
        if (!this.files.has(filename)) return;

        if (!this.openTabs.includes(filename)) {
            this.openTabs.push(filename);
        }

        this.activeFile = filename;
        this.renderTabs();
        this.loadFileContent();
        this.renderFileTree();
        this.updateStatusBar();
    }

    loadFileContent() {
        const editor = document.getElementById('editor');
        const file = this.files.get(this.activeFile);
        editor.value = file.content;
        this.highlightSyntax();
        this.updateLineNumbers();
        this.updateCursorPos();
    }

    renderTabs() {
        const tabs = document.getElementById('tabs');
        tabs.innerHTML = '';

        this.openTabs.forEach(filename => {
            const file = this.files.get(filename);
            const tab = document.createElement('div');
            tab.className = 'tab';
            if (filename === this.activeFile) tab.classList.add('active');

            tab.innerHTML = `
                <span>${filename}</span>
                ${!file.saved? '<div class="tab-unsaved"></div>' : '<div class="tab-close">✕</div>'}
            `;

            tab.addEventListener('click', (e) => {
                if (!e.target.classList.contains('tab-close')) {
                    this.openFile(filename);
                }
            });

            tab.querySelector('.tab-close')?.addEventListener('click', (e) => {
                e.stopPropagation();
                this.closeTab(filename);
            });

            tabs.appendChild(tab);
        });
    }

    closeTab(filename) {
        const index = this.openTabs.indexOf(filename);
        if (index > -1) {
            this.openTabs.splice(index, 1);

            if (this.activeFile === filename) {
                this.activeFile = this.openTabs[Math.max(0, index - 1)] || null;
                if (this.activeFile) {
                    this.loadFileContent();
                } else {
                    document.getElementById('editor').value = '';
                }
            }

            this.renderTabs();
            this.updateStatusBar();
        }
    }

    onEditorInput() {
        if (!this.activeFile) return;

        const file = this.files.get(this.activeFile);
        file.content = document.getElementById('editor').value;

        if (file.saved) {
            file.saved = false;
            this.renderTabs();
            this.renderFileTree();
            document.getElementById('file-status').textContent = '● Unsaved';
        }

        this.highlightSyntax();
        this.updateLineNumbers();
    }

    highlightSyntax() {
        const file = this.files.get(this.activeFile);
        if (!file) return;

        const content = document.getElementById('editor').value;
        const highlighted = this.applySyntaxHighlighting(content, file.language);
        document.getElementById('highlight-layer').innerHTML = highlighted;
    }

    applySyntaxHighlighting(code, lang) {
        let html = this.escapeHtml(code);

        if (lang === 'javascript' || lang === 'js') {
            html = html.replace(/\b(const|let|var|function|return|if|else|for|while|class|import|export|from)\b/g, '<span class="token keyword">$1</span>');
            html = html.replace(/(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g, '<span class="token string">$1$2$1</span>');
            html = html.replace(/\/\/.*$/gm, '<span class="token comment">$&</span>');
            html = html.replace(/\b(\d+)\b/g, '<span class="token number">$1</span>');
            html = html.replace(/\b([a-zA-Z_]\w*)\s*(?=\()/g, '<span class="token function">$1</span>');
        } else if (lang === 'css') {
            html = html.replace(/([.#]?[\w-]+)\s*{/g, '<span class="token keyword">$1</span> {');
            html = html.replace(/([\w-]+)\s*:/g, '<span class="token keyword">$1</span>:');
            html = html.replace(/:\s*(#[0-9a-fA-F]{3,6}|\d+px|[^;]+);/g, ': <span class="token string">$1</span>;');
        } else if (lang === 'html') {
            html = html.replace(/(&lt;\/?)([\w-]+)/g, '$1<span class="token keyword">$2</span>');
            html = html.replace(/([\w-]+)=(["'])(.*?)\2/g, '<span class="token keyword">$1</span>=<span class="token string">$2$3$2</span>');
        }

        return html;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    updateLineNumbers() {
        const lines = document.getElementById('editor').value.split('\n').length;
        const lineNumbers = document.getElementById('line-numbers');
        let html = '';
        for (let i = 1; i <= lines; i++) {
            html += `<div>${i}</div>`;
        }
        lineNumbers.innerHTML = html;
    }

    syncScroll() {
        const editor = document.getElementById('editor');
        document.getElementById('line-numbers').scrollTop = editor.scrollTop;
        document.getElementById('highlight-layer').scrollTop = editor.scrollTop;
        document.getElementById('highlight-layer').scrollLeft = editor.scrollLeft;
    }

    updateCursorPos() {
        const editor = document.getElementById('editor');
        const text = editor.value.substr(0, editor.selectionStart);
        const lines = text.split('\n');
        const line = lines.length;
        const col = lines[lines.length - 1].length + 1;

        document.getElementById('cursor-pos').textContent = `Ln ${line}, Col ${col}`;

        const selected = editor.selectionEnd - editor.selectionStart;
        document.getElementById('selection-info').textContent = selected > 0? `(${selected} selected)` : '';
    }

    updateStatusBar() {
        if (!this.activeFile) {
            document.getElementById('language-mode').textContent = 'Plain Text';
            document.getElementById('file-status').textContent = '';
            return;
        }

        const file = this.files.get(this.activeFile);
        const langMap = {html: 'HTML', css: 'CSS', javascript: 'JavaScript', json: 'JSON'};
        document.getElementById('language-mode').textContent = langMap[file.language] || 'Plain Text';
        document.getElementById('file-status').textContent = file.saved? '' : '● Unsaved';
    }

    handleKeyDown(e) {
        if (e.key === 'Tab') {
            e.preventDefault();
            const editor = document.getElementById('editor');
            const start = editor.selectionStart;
            const end = editor.selectionEnd;
            editor.value = editor.value.substring(0, start) + ' ' + editor.value.substring(end);
            editor.selectionStart = editor.selectionEnd = start + 4;
            this.onEditorInput();
        }
    }

    saveFile() {
        if (!this.activeFile) return;

        const file = this.files.get(this.activeFile);
        file.saved = true;
        this.renderTabs();
        this.renderFileTree();

        const status = document.getElementById('file-status');
        status.textContent = '✓ Saved';
        setTimeout(() => status.textContent = '', 2000);
    }

    toggleTheme() {
        this.theme = this.theme === 'dark'? 'light' : 'dark';
        document.body.dataset.theme = this.theme;
        document.querySelector('.theme-icon').textContent = this.theme === 'dark'? '🌙' : '☀️';
    }

    runCode() {
        if (!this.activeFile) return;

        const file = this.files.get(this.activeFile);
        const output = document.getElementById('output-content');
        const panel = document.getElementById('output-panel');

        output.innerHTML = '';
        panel.classList.add('active');

        if (file.language === 'javascript') {
            try {
                const logs = [];
                const originalLog = console.log;
                const originalError = console.error;

                console.log = (...args) => logs.push({type: 'log', msg: args.join(' ')});
                console.error = (...args) => logs.push({type: 'error', msg: args.join(' ')});

                eval(file.content);

                console.log = originalLog;
                console.error = originalError;

                output.innerHTML = logs.map(l =>
                    `<div style="color:${l.type === 'error'? 'var(--error)' : 'var(--text-primary)'}">${this.escapeHtml(l.msg)}</div>`
                ).join('') || '<div style="color:var(--success)">✓ Executed successfully (no output)</div>';
            } catch (err) {
                output.innerHTML = `<div style="color:var(--error)">Error: ${err.message}</div>`;
            }
        } else if (file.language === 'html') {
            const blob = new Blob([file.content], {type: 'text/html'});
            const url = URL.createObjectURL(blob);
            output.innerHTML = `<iframe src="${url}" style="width:100%;height:100%;border:none;"></iframe>`;
        } else {
            output.innerHTML = `<div style="color:var(--text-secondary)">Preview not available for ${file.language} files</div>`;
        }
    }

    closeOutput() {
        document.getElementById('output-panel').classList.remove('active');
    }

    formatCode() {
        if (!this.activeFile) return;

        const editor = document.getElementById('editor');
        const file = this.files.get(this.activeFile);
        let formatted = editor.value;
    }
}