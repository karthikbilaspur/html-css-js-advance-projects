// JavaScript for Code 52
const API_KEY = 'YOUR_NEWSAPI_KEY_HERE'; // Get free key from https://newsapi.org
const BASE_URL = 'https://newsapi.org/v2/top-headlines';

const newsGridEl = document.getElementById('news-grid');
const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error');
const filterBtns = document.querySelectorAll('.filter-btn');
const searchInput = document.getElementById('search-input');
const countrySelect = document.getElementById('country-select');

let currentCategory = 'general';
let currentCountry = 'in';
let searchTimeout;

// Init
window.addEventListener('DOMContentLoaded', () => {
    fetchNews();
});

// Category filter clicks
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentCategory = btn.dataset.category;
        fetchNews();
    });
});

// Country change
countrySelect.addEventListener('change', (e) => {
    currentCountry = e.target.value;
    fetchNews();
});

// Search with debounce
searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        fetchNews(e.target.value);
    }, 500);
});

async function fetchNews(query = '') {
    showLoading();
    hideError();

    try {
        let url = `${BASE_URL}?country=${currentCountry}&category=${currentCategory}&apiKey=${API_KEY}`;
        
        // NewsAPI: use 'everything' endpoint for search, 'top-headlines' for category
        if (query) {
            url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&language=en&apiKey=${API_KEY}`;
        }

        const response = await fetch(url);
        const data = await response.json();

        if (data.status !== 'ok') {
            throw new Error(data.message || 'Failed to fetch news');
        }

        renderNews(data.articles);
    } catch (err) {
        showError(err.message);
        console.error(err);
    } finally {
        hideLoading();
    }
}

function renderNews(articles) {
    if (!articles || articles.length === 0) {
        newsGridEl.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #666;">No articles found</p>';
        return;
    }

    newsGridEl.innerHTML = articles.map(article => {
        const date = new Date(article.publishedAt).toLocaleDateString('en-IN', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const image = article.urlToImage || 'https://via.placeholder.com/400x200?text=No+Image';
        
        return `
            <article class="news-card">
                <img src="${image}" alt="" class="news-image" onerror="this.src='https://via.placeholder.com/400x200?text=No+Image'">
                <div class="news-content">
                    <div class="news-source">${article.source.name}</div>
                    <h3 class="news-title">
                        <a href="${article.url}" target="_blank" rel="noopener">${article.title}</a>
                    </h3>
                    <p class="news-desc">${article.description || 'No description available'}</p>
                    <div class="news-meta">
                        <span>${date}</span>
                        <span>${article.author || 'Unknown'}</span>
                    </div>
                </div>
            </article>
        `;
    }).join('');
}

function showLoading() {
    loadingEl.style.display = 'block';
    newsGridEl.innerHTML = '';
}

function hideLoading() {
    loadingEl.style.display = 'none';
}

function showError(msg) {
    errorEl.textContent = `Error: ${msg}. Make sure you've added your NewsAPI key.`;
    errorEl.style.display = 'block';
}

function hideError() {
    errorEl.style.display = 'none';
}