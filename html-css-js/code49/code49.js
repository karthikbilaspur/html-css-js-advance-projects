// JavaScript for Code 49
const usernameInput = document.getElementById('username-input');
const searchBtn = document.getElementById('search-btn');
const errorMsg = document.getElementById('error-msg');
const userProfile = document.getElementById('user-profile');
const reposSection = document.getElementById('repos-section');
const reposList = document.getElementById('repos-list');
const loading = document.getElementById('loading');
const sortSelect = document.getElementById('sort-select');

const avatar = document.getElementById('avatar');
const nameEl = document.getElementById('name');
const usernameEl = document.getElementById('username');
const bioEl = document.getElementById('bio');
const reposCount = document.getElementById('repos-count');
const followers = document.getElementById('followers');
const following = document.getElementById('following');
const profileLink = document.getElementById('profile-link');

const GITHUB_API = 'https://api.github.com';
let currentRepos = [];

// Search on button click or Enter
searchBtn.addEventListener('click', handleSearch);
usernameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
});

sortSelect.addEventListener('change', () => {
    renderRepos(currentRepos);
});

async function handleSearch() {
    const username = usernameInput.value.trim();
    if (!username) {
        showError('Please enter a username');
        return;
    }

    hideError();
    showLoading();
    hideResults();

    try {
        // Fetch user + repos in parallel
        const [userRes, reposRes] = await Promise.all([
            fetch(`${GITHUB_API}/users/${username}`),
            fetch(`${GITHUB_API}/users/${username}/repos?per_page=100`)
        ]);

        if (!userRes.ok) {
            if (userRes.status === 404) throw new Error('User not found');
            if (userRes.status === 403) throw new Error('API rate limit exceeded. Try again later');
            throw new Error('Failed to fetch user data');
        }

        const userData = await userRes.json();
        const reposData = await reposRes.json();

        currentRepos = reposData;
        displayUser(userData);
        renderRepos(reposData);
        hideLoading();
        showResults();

    } catch (err) {
        hideLoading();
        showError(err.message);
    }
}

function displayUser(user) {
    avatar.src = user.avatar_url;
    nameEl.textContent = user.name || user.login;
    usernameEl.textContent = `@${user.login}`;
    bioEl.textContent = user.bio || 'No bio available';
    reposCount.textContent = user.public_repos;
    followers.textContent = user.followers.toLocaleString();
    following.textContent = user.following.toLocaleString();
    profileLink.href = user.html_url;
}

function renderRepos(repos) {
    const sortBy = sortSelect.value;

    let sorted = [...repos];
    if (sortBy === 'stars') {
        sorted.sort((a, b) => b.stargazers_count - a.stargazers_count);
    } else if (sortBy === 'name') {
        sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else {
        sorted.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
    }

    if (sorted.length === 0) {
        reposList.innerHTML = '<p style="color: #8b949e; grid-column: 1/-1;">No public repositories found</p>';
        return;
    }

    reposList.innerHTML = sorted.slice(0, 30).map(repo => `
        <div class="repo-card">
            <a href="${repo.html_url}" target="_blank" class="repo-name">${repo.name}</a>
            <p class="repo-desc">${repo.description || 'No description'}</p>
            <div class="repo-meta">
                ${repo.language? `
                    <span class="repo-lang">
                        <span class="lang-dot" style="background: ${getLangColor(repo.language)}"></span>
                        ${repo.language}
                    </span>
                ` : ''}
                <span>★ ${repo.stargazers_count}</span>
                <span>⑂ ${repo.forks_count}</span>
            </div>
        </div>
    `).join('');
}

// Simple language colors
function getLangColor(lang) {
    const colors = {
        JavaScript: '#f1e05a',
        TypeScript: '#3178c6',
        Python: '#3572A5',
        Java: '#b07219',
        HTML: '#e34c26',
        CSS: '#563d7c',
        Go: '#00ADD8',
        Rust: '#dea584',
        C: '#555555',
        'C++': '#f34b7d'
    };
    return colors[lang] || '#8b949e';
}

function showLoading() {
    loading.classList.remove('hidden');
}

function hideLoading() {
    loading.classList.add('hidden');
}

function showResults() {
    userProfile.classList.remove('hidden');
    reposSection.classList.remove('hidden');
}

function hideResults() {
    userProfile.classList.add('hidden');
    reposSection.classList.add('hidden');
}

function showError(msg) {
    errorMsg.textContent = msg;
    errorMsg.classList.remove('hidden');
}

function hideError() {
    errorMsg.classList.add('hidden');
}

// Load demo user on page load
window.addEventListener('DOMContentLoaded', () => {
    usernameInput.value = 'torvalds';
    handleSearch();
});