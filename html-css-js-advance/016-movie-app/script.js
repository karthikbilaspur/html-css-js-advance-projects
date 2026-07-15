// TMDB API Setup - Get free key at https://www.themoviedb.org/settings/api
const API_KEY = 'YOUR_API_KEY_HERE'; // Replace with your TMDB API key
const API_URL = `https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=${API_KEY}&page=`;
const SEARCH_API = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=`;
const IMG_PATH = 'https://image.tmdb.org/t/p/w500';

const main = document.getElementById('main');
const form = document.getElementById('form');
const search = document.getElementById('search');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const pageInfo = document.getElementById('page-info');

let currentPage = 1;
let currentSearch = '';

// Demo data if no API key - remove when using real API
const DEMO_MOVIES = [
  { id: 1, title: 'KCS: The Beginning', poster_path: null, vote_average: 9.5, overview: 'The story of how KarthikCodingSolutions started. A developer from Bangalore builds 50 projects to master JavaScript.' },
  { id: 2, title: 'JavaScript Returns', poster_path: null, vote_average: 8.8, overview: 'After vanilla JS, the hero discovers React. But can he resist the call of frameworks?' },
  { id: 3, title: 'The API Awakens', poster_path: null, vote_average: 9.2, overview: 'Bundle 4 begins. Our dev connects to external data for the first time. The backend awaits.' },
  { id: 4, title: 'Full Stack Wars', poster_path: null, vote_average: 8.5, overview: 'Node, Express, and MongoDB join forces. The MERN stack is complete.' }
];

getMovies(API_URL + currentPage);

async function getMovies(url) {
  try {
    const res = await fetch(url);
    const data = await res.json();
    showMovies(data.results || DEMO_MOVIES);
    updatePagination(data.page || currentPage, data.total_pages || 1);
  } catch (err) {
    console.log('Using demo data. Add TMDB API key for real movies.');
    showMovies(DEMO_MOVIES);
    updatePagination(1, 1);
  }
}

function showMovies(movies) {
  main.innerHTML = '';

  movies.forEach((movie) => {
    const { title, poster_path, vote_average, overview } = movie;

    const movieEl = document.createElement('div');
    movieEl.classList.add('movie');

    movieEl.innerHTML = `
      <img src="${poster_path ? IMG_PATH + poster_path : 'https://via.placeholder.com/500x750/1e293b/38bdf8?text=' + encodeURIComponent(title)}" alt="${title}">
      <div class="movie-info">
        <h3>${title}</h3>
        <span class="${getClassByRate(vote_average)}">${vote_average.toFixed(1)}</span>
      </div>
      <div class="overview">
        <h3>Overview</h3>
        ${overview || 'No overview available.'}
      </div>
    `;
    main.appendChild(movieEl);
  });
}

function getClassByRate(vote) {
  if (vote >= 8) return 'green';
  if (vote >= 5) return 'orange';
  return 'red';
}

function updatePagination(page, totalPages) {
  currentPage = page;
  pageInfo.textContent = `Page ${page}`;
  prevBtn.disabled = page === 1;
  nextBtn.disabled = page >= totalPages;
}

// Search
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const searchTerm = search.value.trim();

  if (searchTerm) {
    currentSearch = searchTerm;
    getMovies(SEARCH_API + searchTerm);
    search.value = '';
  } else {
    currentSearch = '';
    getMovies(API_URL + 1);
  }
});

// Pagination
prevBtn.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    const url = currentSearch ? SEARCH_API + currentSearch + '&page=' + currentPage : API_URL + currentPage;
    getMovies(url);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
});

nextBtn.addEventListener('click', () => {
  currentPage++;
  const url = currentSearch ? SEARCH_API + currentSearch + '&page=' + currentPage : API_URL + currentPage;
  getMovies(url);
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

console.log('Movie App loaded - KarthikCodingSolutions ⚡ Get TMDB API key for real data');