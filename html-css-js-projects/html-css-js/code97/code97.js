// JavaScript for Code 97
class MiniVSCode {
    constructor() {
        this.files = {
            'index.html': {content: '<!DOCTYPE html>\n<html>\n<head>\n <title>App</title>\n</head>\n<body>\n <h1>Hello World</h1>\n</body>\n</html>', lang: 'html', saved: true},
            'style.css': {content: 'body {\n margin: 0;\n padding: 20px;\n font-family: sans-serif;\n}\n\nh1 {\n color: #007acc;\n}', lang: 'css', saved: true},
            'app.js': {content: 'console.log("Hello from Code97");\n\nfunction greet(name) {\n return `Hello, ${name}!`;\n}\n\nconsole.log(greet("World"));', lang: 'javascript', saved: true},
            'config.json': {content: '{\n "name": "my-app",\n "version": "1.0.0",\n "theme": "dark"\n}', lang: 'json', saved: true}
        };

        this.openTabs = [];
        this.activeTab = null;
        this.theme = 'dark';

        this.init();
    }

    init() {
        this.bindEvents();
        this.openFile('index.html');
        this.updateLineNumbers();
    }

    bindEvents() {
        // File tree
        document.querySelectorAll('.file-item').forEach(item => {
            item.addEventListener('click', () => {
                const filename = item.dataset.file;
                this.openFile(filename);
            });
        });

        // Folder toggle
        document.querySelectorAll('.folder-header').forEach(header => {
            header.addEventListener('click', () => {
                header.parentElement.classList.toggle('collapsed');
            });
        });

        // Editor events
        const editor = document.getElementById('editor');
        editor.addEventListener('input', () => {
            this.onEditorChange();
            this.updateLineNumbers();
        });
        editor.addEventListener('scroll', () => this.syncScroll());
        editor.addEventListener('keyup', () => this.updateCursorPos());
        editor.addEventListener('click', () => this.updateCursorPos());

        // Tab key
        editor.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                e.preventDefault();
                const start = editor.selectionStart;
                const end = editor.selectionEnd;
                editor.value = editor.value.substring(0, start) + ' ' + editor.value.substring(end);
                editor.selectionStart = editor.selectionEnd = start + 4;
                this.onEditorChange();
            }
        });

        // Buttons
        document.getElementById('theme-toggle').addEventListener('click', () => this.toggleTheme());
        document.getElementById('save-btn').addEventListener('click', () => this.saveFile());
        document.getElementById('run-btn').addEventListener('click', () => this.runCode());
        document.getElementById('close-output').addEventListener('click', () => this.closeOutput());
        document.getElementById('new-file').addEventListener('click', () => this.newFile());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                if (e.key === 's') {
                    e.preventDefault();
                    this.saveFile();
                }
            }
        });
    }

    openFile(filename) {
        if (!this.files[filename]) return;

        if (!this.openTabs.includes(filename)) {
            this.openTabs.push(filename);
            this.renderTabs();
        }

        this.activeTab = filename;
        this.loadFileContent(filename);
        this.updateActiveTab();
        this.updateStatusBar();
    }

    loadFileContent(filename) {
        const editor = document.getElementById('editor');
        const file = this.files[filename];
        editor.value = file.content;
        editor.disabled = false;
        this.updateLineNumbers();
        this.updateCursorPos();
    }

    renderTabs() {
        const tabsContainer = document.getElementById('tabs');
        tabsContainer.innerHTML = '';

        this.openTabs.forEach(filename => {
            const file = this.files[filename];
            const tab = document.createElement('div');
            tab.className = 'tab';
            if (filename === this.activeTab) tab.classList.add('active');

            tab.innerHTML = `
                <span>${filename}</span>
                ${!file.saved? '<div class="tab-unsaved"></div>' : ''}
                <div class="tab-close">✕</div>
            `;

            tab.addEventListener('click', (e) => {
                if (!e.target.classList.contains('tab-close')) {
                    this.openFile(filename);
                }
            });

            tab.querySelector('.tab-close').addEventListener('click', (e) => {
                e.stopPropagation();
                this.closeTab(filename);
            });

            tabsContainer.appendChild(tab);
        });
    }

    closeTab(filename) {
        const index = this.openTabs.indexOf(filename);
        if (index > -1) {
            this.openTabs.splice(index, 1);

            if (this.activeTab === filename) {
                this.activeTab = this.openTabs[Math.max(0, index - 1)] || null;
                if (this.activeTab) {
                    this.loadFileContent(this.activeTab);
                } else {
                    document.getElementById('editor').value = '';
                    document.getElementById('editor').disabled = true;
                }
            }

            this.renderTabs();
            this.updateStatusBar();
        }
    }

    updateActiveTab() {
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelectorAll('.file-item').forEach(item => {
            item.classList.remove('active');
        });

        const activeTab = Array.from(document.querySelectorAll('.tab')).find(
            tab => tab.textContent.includes(this.activeTab)
        );
        if (activeTab) activeTab.classList.add('active');

        const activeFile = document.querySelector(`[data-file="${this.activeTab}"]`);
        if (activeFile) activeFile.classList.add('active');
    }

    onEditorChange() {
        if (!this.activeTab) return;

        const file = this.files[this.activeTab];
        file.content = document.getElementById('editor').value;

        if (file.saved) {
            file.saved = false;
            this.renderTabs();
            document.getElementById('file-status').textContent = '● Unsaved';
        }
    }

    saveFile() {
        if (!this.activeTab) return;

        this.files[this.activeTab].saved = true;
        this.renderTabs();
        document.getElementById('file-status').textContent = '';

        // Flash save indicator
        const status = document.getElementById('file-status');
        status.textContent = '✓ Saved';
        setTimeout(() => status.textContent = '', 2000);
    }

    updateLineNumbers() {
        const editor = document.getElementById('editor');
        const lines = editor.value.split('\n').length;
        const lineNumbers = document.getElementById('line-numbers');

        let html = '';
        for (let i = 1; i <= lines; i++) {
            html += `<div>${i}</div>`;
        }
        lineNumbers.innerHTML = html;
    }

    syncScroll() {
        const editor = document.getElementById('editor');
        const lineNumbers = document.getElementById('line-numbers');
        lineNumbers.scrollTop = editor.scrollTop;
    }

    updateCursorPos() {
        const editor = document.getElementById('editor');
        const text = editor.value.substr(0, editor.selectionStart);
        const lines = text.split('\n');
        const line = lines.length;
        const col = lines[lines.length - 1].length + 1;
        document.getElementById('cursor-pos').textContent = `Ln ${line}, Col ${col}`;
    }

    updateStatusBar() {
        if (!this.activeTab) {
            document.getElementById('language').textContent = 'Plain Text';
            document.getElementById('file-info').textContent = 'UTF-8';
            return;
        }

        const file = this.files[this.activeTab];
        const langMap = {
            html: 'HTML',
            css: 'CSS',
            javascript: 'JavaScript',
            json: 'JSON'
        };

        document.getElementById('language').textContent = langMap[file.lang] || 'Plain Text';
    }

    toggleTheme() {
        this.theme = this.theme === 'dark'? 'light' : 'dark';
        document.body.dataset.theme = this.theme;
        document.querySelector('.theme-icon').textContent = this.theme === 'dark'? '🌙' : '☀️';
    }

    runCode() {
        if (!this.activeTab) return;

        const file = this.files[this.activeTab];
        const output = document.getElementById('output-content');
        const panel = document.getElementById('output-panel');

        output.textContent = '';
        panel.classList.add('active');

        if (file.lang === 'javascript') {
            try {
                const logs = [];
                const originalLog = console.log;
                console.log = (...args) => logs.push(args.join(' '));

                eval(file.content);

                console.log = originalLog;
                output.textContent = logs.join('\n') || 'Code executed successfully (no output)';
            } catch (err) {
                output.textContent = `Error: ${err.message}`;
                output.style.color = '#f56565';
            }
        } else if (file.lang === 'html') {
            const blob = new Blob([file.content], {type: 'text/html'});
            const url = URL.createObjectURL(blob);
            output.innerHTML = `<iframe src="${url}" style="width:100%;height:300px;border:none;"></iframe>`;
        } else {
            output.textContent = `Preview not available for ${file.lang} files`;
        }
    }

    closeOutput() {
        document.getElementById('output-panel').classList.remove('active');
    }

    newFile() {
        const filename = prompt('Enter filename (e.g., script.js):');
        if (filename &&!this.files[filename]) {
            const ext = filename.split('.').pop();
            const langMap = {js: 'javascript', html: 'html', css: 'css', json: 'json'};

            this.files[filename] = {
                content: '',
                lang: langMap[ext] || 'text',
                saved: true
            };

            // Add to file tree
            const fileTree = document.getElementById('folder-src');
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.dataset.file = filename;
            fileItem.dataset.lang = langMap[ext] || 'text';
            fileItem.innerHTML = `<span>📄</span> ${filename}`;
            fileItem.addEventListener('click', () => this.openFile(filename));
            fileTree.appendChild(fileItem);

            this.openFile(filename);
        }
    }
}

new MiniVSCode();