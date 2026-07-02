// JavaScript for Code 57
const API_URL = 'https://api.shrtco.de/v2/shorten';

const urlInput = document.getElementById('url-input');
const shortenBtn = document.getElementById('shorten-btn');
const errorEl = document.getElementById('error');
const resultEl = document.getElementById('result');
const shortUrlEl = document.getElementById('short-url');
const copyBtn = document.getElementById('copy-btn');
const originalLink = document.getElementById('original-link');
const historyList = document.getElementById('history-list');
const clearHistoryBtn = document.getElementById('clear-history');
const toast = document.getElementById('toast');

const STORAGE_KEY = 'url_shortener_57_history';

// Load history on page load
window.addEventListener('DOMContentLoaded', () => {
    renderHistory();
});

// Shorten URL
shortenBtn.addEventListener('click', shortenUrl);
urlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') shortenUrl();
});

async function shortenUrl() {
    const longUrl = urlInput.value.trim();
    
    if (!longUrl) {
        showError('Please enter a URL');
        return;
    }

    if (!isValidUrl(longUrl)) {
        showError('Please enter a valid URL with http:// or https://');
        urlInput.classList.add('error');
        return;
    }

    urlInput.classList.remove('error');
    hideError();
    shortenBtn.disabled = true;
    shortenBtn.textContent = 'Shortening...';

    try {
        const res = await fetch(`${API_URL}?url=${encodeURIComponent(longUrl)}`);
        const data = await res.json();

        if (!data.ok) {
            throw new Error(data.error || 'Failed to shorten URL');
        }

        const shortLink = data.result.full_short_link;
        const originalUrl = data.result.original_link;

        showResult(shortLink, originalUrl);
        saveToHistory(shortLink, originalUrl);
        urlInput.value = '';

    } catch (err) {
        showError(err.message);
        console.error(err);
    } finally {
        shortenBtn.disabled = false;
        shortenBtn.textContent = 'Shorten';
    }
}

function isValidUrl(string) {
    try {
        const url = new URL(string);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
        return false;
    }
}

function showResult(shortUrl, originalUrl) {
    shortUrlEl.value = shortUrl;
    originalLink.href = originalUrl;
    originalLink.textContent = truncateUrl(originalUrl, 50);
    resultEl.classList.add('show');
}

function truncateUrl(url, maxLength) {
    return url.length > maxLength ? url.substring(0, maxLength) + '...' : url;
}

// Copy to clipboard
copyBtn.addEventListener('click', async () => {
    try {
        await navigator.clipboard.writeText(shortUrlEl.value);
        copyBtn.textContent = 'Copied!';
        copyBtn.classList.add('copied');
        showToast();
        
        setTimeout(() => {
            copyBtn.textContent = 'Copy';
            copyBtn.classList.remove('copied');
        }, 2000);
    } catch (err) {
        showError('Failed to copy');
    }
});

// History management
function saveToHistory(shortUrl, originalUrl) {
    const history = getHistory();
    
    // Remove duplicate if exists
    const filtered = history.filter(item => item.short !== shortUrl);
    
    // Add new item at start
    filtered.unshift({
        short: shortUrl,
        original: originalUrl,
        timestamp: Date.now()
    });
    
    // Keep only last 10
    const limited = filtered.slice(0, 10);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(limited));
    renderHistory();
}

function getHistory() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

function renderHistory() {
    const history = getHistory();
    
    if (history.length === 0) {
        historyList.innerHTML = '<div class="empty-history">No shortened links yet</div>';
        return;
    }

    historyList.innerHTML = history.map(item => `
        <div class="history-item">
            <div class="history-urls">
                <div class="history-short">${item.short}</div>
                <div class="history-original" title="${item.original}">${truncateUrl(item.original, 60)}</div>
            </div>
            <button class="history-copy" data-url="${item.short}">Copy</button>
        </div>
    `).join('');
}

// Copy from history
historyList.addEventListener('click', async (e) => {
    if (e.target.classList.contains('history-copy')) {
        const url = e.target.dataset.url;
        try {
            await navigator.clipboard.writeText(url);
            e.target.textContent = 'Copied!';
            showToast();
            setTimeout(() => {
                e.target.textContent = 'Copy';
            }, 2000);
        } catch (err) {
            showError('Failed to copy');
        }
    }
});

clearHistoryBtn.addEventListener('click', () => {
    if (confirm('Clear all history?')) {
        localStorage.removeItem(STORAGE_KEY);
        renderHistory();
    }
});

function showError(msg) {
    errorEl.textContent = msg;
}

function hideError() {
    errorEl.textContent = '';
}

function showToast() {
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}