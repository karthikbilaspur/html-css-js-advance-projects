// JavaScript for Code 50
// Replace with your OMDB API key
const API_KEY = 'YOUR_OMDB_API_KEY';
const API_URL = 'https://www.omdbapi.com/';

const searchInput = document.getElementById('search-input');
const searchStatus = document.getElementById('search-status');
const resultsGrid = document.getElementById('results-grid');
const errorMsg = document.getElementById('error-message');
const loader = document.getElementById('loader');
const modal = document.getElementById('modal');
const modalBody = document.getElementById('modal-body');
const closeModal = document.getElementById('close-modal');

let debounceTimer;
const DEBOUNCE_DELAY = 500; // ms

// Debounced search
searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    
    clearTimeout(debounceTimer);
    
    if (query.length < 3) {
        resultsGrid.innerHTML = '';
        errorMsg.textContent = query.length > 0 ? 'Type at least 3 characters' : '';
        searchStatus.textContent = '';
        return;
    }

    searchStatus.textContent = 'Typing...';
    
    debounceTimer = setTimeout(() => {
        searchMovies(query);
    }, DEBOUNCE_DELAY);
});

async function searchMovies(query) {
    searchStatus.textContent = 'Searching...';
    loader.classList.remove('hidden');
    errorMsg.textContent = '';
    resultsGrid.innerHTML = '';

    try {
        const res = await fetch(`${API_URL}?apikey=${API_KEY}&s=${encodeURIComponent(query)}&type=movie`);
        const data = await res.json();

        loader.classList.add('hidden');
        searchStatus.textContent = '';

        if (data.Response === 'True') {
            displayResults(data.Search);
            errorMsg.textContent = `Found ${data.totalResults} results`;
        } else {
            errorMsg.textContent = data.Error || 'No movies found';
        }
    } catch (err) {
        loader.classList.add('hidden');
        searchStatus.textContent = '';
        errorMsg.textContent = 'Failed to fetch. Check your API key or connection.';
        console.error(err);
    }
}

function displayResults(movies) {
    resultsGrid.innerHTML = movies.map(movie => `
        <div class="movie-card" data-id="${movie.imdbID}">
            <img 
                src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450/2a2a2a/666?text=No+Poster'}" 
                alt="${movie.Title}"
                class="movie-poster"
                loading="lazy"
            >
            <div class="movie-info">
                <div class="movie-title">${movie.Title}</div>
                <div class="movie-meta">
                    <span>${movie.Year}</span>
                    <span>${movie.Type}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// Click movie card to show details
resultsGrid.addEventListener('click', async (e) => {
    const card = e.target.closest('.movie-card');
    if (!card) return;

    const imdbID = card.dataset.id;
    await showMovieDetails(imdbID);
});

async function showMovieDetails(imdbID) {
    modalBody.innerHTML = '<div class="loader"><div class="spinner"></div></div>';
    modal.classList.remove('hidden');

    try {
        const res = await fetch(`${API_URL}?apikey=${API_KEY}&i=${imdbID}&plot=full`);
        const movie = await res.json();

        if (movie.Response === 'True') {
            modalBody.innerHTML = `
                <img 
                    src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450/2a2a2a/666?text=No+Poster'}" 
                    alt="${movie.Title}"
                    class="modal-poster"
                >
                <div class="modal-details">
                    <h2>${movie.Title}</h2>
                    <div class="modal-meta">
                        <span class="rating">⭐ ${movie.imdbRating}</span>
                        <span>${movie.Year}</span>
                        <span>${movie.Runtime}</span>
                        <span>${movie.Rated}</span>
                    </div>
                    <p class="plot">${movie.Plot}</p>
                    <div class="detail-row"><strong>Genre:</strong> ${movie.Genre}</div>
                    <div class="detail-row"><strong>Director:</strong> ${movie.Director}</div>
                    <div class="detail-row"><strong>Actors:</strong> ${movie.Actors}</div>
                    <div class="detail-row"><strong>Released:</strong> ${movie.Released}</div>
                    <div class="detail-row"><strong>Box Office:</strong> ${movie.BoxOffice || 'N/A'}</div>
                </div>
            `;
        }
    } catch (err) {
        modalBody.innerHTML = '<p>Failed to load movie details</p>';
    }
}

// Close modal
closeModal.addEventListener('click', () => {
    modal.classList.add('hidden');
});

modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.add('hidden');
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        modal.classList.add('hidden');
    }
});

// Initial search
searchInput.focus();