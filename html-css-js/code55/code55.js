// JavaScript for Code 55
console.log('Code 55 loaded');
const API_URL = 'https://api.lyrics.ovh/v1';
const SUGGEST_URL = 'https://api.lyrics.ovh/suggest';

const artistInput = document.getElementById('artist-input');
const songInput = document.getElementById('song-input');
const searchBtn = document.getElementById('search-btn');
const suggestBtn = document.getElementById('suggest-btn');
const statusEl = document.getElementById('status');
const resultsList = document.getElementById('results-list');
const lyricsDisplay = document.getElementById('lyrics-display');

let currentLyrics = [];

// Direct search by artist + song
searchBtn.addEventListener('click', searchLyrics);
songInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchLyrics();
});
artistInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && songInput.value) searchLyrics();
});

// Get suggestions based on artist or song
suggestBtn.addEventListener('click', getSuggestions);

async function searchLyrics() {
    const artist = artistInput.value.trim();
    const song = songInput.value.trim();

    if (!artist || !song) {
        showStatus('Please enter both artist and song name');
        return;
    }

    showStatus('Searching...');
    clearResults();

    try {
        const res = await fetch(`${API_URL}/${encodeURIComponent(artist)}/${encodeURIComponent(song)}`);
        const data = await res.json();

        if (data.lyrics) {
            displayLyrics(artist, song, data.lyrics);
            showStatus('Lyrics found');
            // Add to results list for reference
            resultsList.innerHTML = `
                <div class="result-item active">
                    <div class="result-artist">${artist}</div>
                    <div class="result-title">${song}</div>
                </div>
            `;
        } else {
            showStatus('No lyrics found. Try suggestions instead.');
        }
    } catch (err) {
        showStatus('Error fetching lyrics. API might be down.');
        console.error(err);
    }
}

async function getSuggestions() {
    const query = artistInput.value.trim() || songInput.value.trim();
    
    if (!query) {
        showStatus('Enter an artist or song to get suggestions');
        return;
    }

    showStatus('Getting suggestions...');
    clearResults();

    try {
        const res = await fetch(`${SUGGEST_URL}/${encodeURIComponent(query)}`);
        const data = await res.json();

        if (data.data && data.data.length > 0) {
            currentLyrics = data.data.slice(0, 15); // Limit to 15 results
            displaySuggestions(currentLyrics);
            showStatus(`Found ${data.data.length} suggestions`);
        } else {
            showStatus('No suggestions found');
        }
    } catch (err) {
        showStatus('Error fetching suggestions');
        console.error(err);
    }
}

function displaySuggestions(suggestions) {
    resultsList.innerHTML = suggestions.map((song, idx) => `
        <div class="result-item" data-idx="${idx}">
            <div class="result-artist">${song.artist.name}</div>
            <div class="result-title">${song.title}</div>
        </div>
    `).join('');
}

resultsList.addEventListener('click', async (e) => {
    const item = e.target.closest('.result-item');
    if (!item) return;

    // Remove active from all
    document.querySelectorAll('.result-item').forEach(el => el.classList.remove('active'));
    item.classList.add('active');

    const idx = item.dataset.idx;
    if (idx !== undefined) {
        const song = currentLyrics[idx];
        await fetchLyricsForSuggestion(song.artist.name, song.title);
    }
});

async function fetchLyricsForSuggestion(artist, song) {
    showStatus('Loading lyrics...');
    try {
        const res = await fetch(`${API_URL}/${encodeURIComponent(artist)}/${encodeURIComponent(song)}`);
        const data = await res.json();

        if (data.lyrics) {
            displayLyrics(artist, song, data.lyrics);
            showStatus('');
        } else {
            showStatus('No lyrics found for this song');
        }
    } catch (err) {
        showStatus('Error loading lyrics');
        console.error(err);
    }
}

function displayLyrics(artist, song, lyrics) {
    lyricsDisplay.innerHTML = `
        <div class="lyrics-header">
            <h2>${song}</h2>
            <div class="artist">${artist}</div>
        </div>
        <div class="lyrics-text">${lyrics}</div>
    `;
}

function showStatus(msg) {
    statusEl.textContent = msg;
}

function clearResults() {
    resultsList.innerHTML = '';
}

// Load example on page load
window.addEventListener('DOMContentLoaded', () => {
    artistInput.value = 'Coldplay';
    songInput.value = 'Yellow';
});