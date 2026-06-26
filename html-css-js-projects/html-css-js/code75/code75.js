// JavaScript for Code 75
const codeInput = document.getElementById('code-input');
const codeOutput = document.getElementById('code-output');
const languageSelect = document.getElementById('language-select');
const themeSelect = document.getElementById('theme-select');
const lineNumbersToggle = document.getElementById('line-numbers');
const copyBtn = document.getElementById('copy-btn');
const clearBtn = document.getElementById('clear-btn');
const charCount = document.getElementById('char-count');

let debounceTimer;

// Prism theme URLs
const themes = {
    tomorrow: 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css',
    okaidia: 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-okaidia.min.css',
    twilight: 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-twilight.min.css',
    coy: 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-coy.min.css',
    dark: 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-dark.min.css',
    funky: 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-funky.min.css'
};

function highlightCode() {
    const code = codeInput.value;
    const language = languageSelect.value;

    // Update class for Prism
    codeOutput.className = `language-${language}`;
    codeOutput.textContent = code;

    // Trigger Prism highlighting
    Prism.highlightElement(codeOutput);

    // Update char count
    charCount.textContent = `${code.length} chars`;

    // Toggle line numbers
    const pre = codeOutput.parentElement;
    if (lineNumbersToggle.checked) {
        pre.classList.add('line-numbers');
    } else {
        pre.classList.remove('line-numbers');
    }
}

// Debounced highlighting for performance
codeInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(highlightCode, 150);
});

// Language change
languageSelect.addEventListener('change', highlightCode);

// Theme change
themeSelect.addEventListener('change', (e) => {
    const theme = e.target.value;
    const link = document.querySelector('link[href*="prism-"]');
    link.href = themes[theme];
});

// Line numbers toggle
lineNumbersToggle.addEventListener('change', highlightCode);

// Copy code
copyBtn.addEventListener('click', async () => {
    try {
        await navigator.clipboard.writeText(codeInput.value);
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        copyBtn.style.background = '#34c759';
        setTimeout(() => {
            copyBtn.textContent = originalText;
            copyBtn.style.background = '';
        }, 2000);
    } catch (err) {
        alert('Failed to copy code');
    }
});

// Clear
clearBtn.addEventListener('click', () => {
    if (confirm('Clear all code?')) {
        codeInput.value = '';
        highlightCode();
        codeInput.focus();
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        highlightCode();
    }
});

// Tab support in textarea
codeInput.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
        e.preventDefault();
        const start = e.target.selectionStart;
        const end = e.target.selectionEnd;
        const value = e.target.value;

        e.target.value = value.substring(0, start) + ' ' + value.substring(end);
        e.target.selectionStart = e.target.selectionEnd = start + 2;
        highlightCode();
    }
});

// Sample code by language
const samples = {
    javascript: `function fibonacci(n) {\n if (n <= 1) return n;\n return fibonacci(n - 1) + fibonacci(n - 2);\n}\n\nconsole.log(fibonacci(10));`,
    python: `def fibonacci(n):\n if n <= 1:\n return n\n return fibonacci(n - 1) + fibonacci(n - 2)\n\nprint(fibonacci(10))`,
    html: `<!DOCTYPE html>\n<html>\n<head>\n <title>Page</title>\n</head>\n<body>\n <h1>Hello World</h1>\n</body>\n</html>`,
    css: `.container {\n display: flex;\n justify-content: center;\n align-items: center;\n min-height: 100vh;\n}`,
    json: `{\n "name": "code-highlighter",\n "version": "1.0.0",\n "dependencies": {\n "prism": "^1.29.0"\n }\n}`
};

languageSelect.addEventListener('change', () => {
    const lang = languageSelect.value;
    if (samples[lang] && codeInput.value.trim() === '') {
        codeInput.value = samples[lang];
        highlightCode();
    }
});

// Init
highlightCode();