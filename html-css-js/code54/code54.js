// JavaScript for Code 54
const ACCESS_KEY = 'YOUR_UNSPLASH_ACCESS_KEY'; // Get from https://unsplash.com/developers
const API_URL = 'https://api.unsplash.com';

const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const filterBtns = document.querySelectorAll('.filter-btn');
const masonryGrid = document.getElementById('masonry-grid');
const statusEl = document.getElementById('status');
const loader = document.getElementById('loader');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxAuthor = document.getElementById('lightbox-author');
const lightboxLink = document.getElementById('lightbox-link');
const closeLightbox = document.querySelector('.close-lightbox');

let currentQuery = 'random';
let page = 1;
let isLoading = false;
let hasMore = true;

// Load featured on page load
window.addEventListener('DOMContentLoaded', () => {
    fetchPhotos();
});

// Search
searchBtn.addEventListener('click', () => {
    const query = searchInput.value.trim();
    if (query) {
        resetSearch(query);
        fetchPhotos();
    }
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const query = searchInput.value.trim();
        if (query) {
            resetSearch(query);
            fetchPhotos();
        }
    }
});

// Filter buttons
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        resetSearch(btn.dataset.query);
        fetchPhotos();
    });
});

function resetSearch(query) {
    currentQuery = query;
    page = 1;
    hasMore = true;
    masonryGrid.innerHTML = '';
    statusEl.textContent = '';
}

async function fetchPhotos() {
    if (isLoading || !hasMore) return;
    
    isLoading = true;
    loader.classList.add('active');

    try {
        const endpoint = currentQuery === 'random' 
            ? `${API_URL}/photos/random?count=20&client_id=${ACCESS_KEY}`
            : `${API_URL}/search/photos?query=${encodeURIComponent(currentQuery)}&page=${page}&per_page=20&client_id=${ACCESS_KEY}`;

        const res = await fetch(endpoint);
        
        if (res.status === 403) {
            throw new Error('Invalid API key or rate limit exceeded');
        }
        if (!res.ok) throw new Error('Failed to fetch photos');

        const data = await res.json();
        const photos = currentQuery === 'random' ? data : data.results;

        if (photos.length === 0 && page === 1) {
            statusEl.textContent = `No results found for "${currentQuery}"`;
            hasMore = false;
        } else {
            displayPhotos(photos);
            if (photos.length < 20) hasMore = false;
            page++;
        }

    } catch (err) {
        statusEl.textContent = `Error: ${err.message}. Add your Unsplash API key.`;
        console.error(err);
    } finally {
        isLoading = false;
        loader.classList.remove('active');
    }
}

function displayPhotos(photos) {
    const fragment = document.createDocumentFragment();
    
    photos.forEach(photo => {
        const item = document.createElement('div');
        item.className = 'masonry-item';
        item.innerHTML = `
            <img 
                src="${photo.urls.small}" 
                alt="${photo.alt_description || 'Unsplash photo'}"
                loading="lazy"
            >
            <div class="masonry-overlay">
                <p>by ${photo.user.name}</p>
            </div>
        `;
        
        item.addEventListener('click', () => openLightbox(photo));
        fragment.appendChild(item);
    });
    
    masonryGrid.appendChild(fragment);
}

// Infinite scroll
window.addEventListener('scroll', () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 800) {
        fetchPhotos();
    }
});

// Lightbox
function openLightbox(photo) {
    lightboxImg.src = photo.urls.regular;
    lightboxImg.alt = photo.alt_description || 'Unsplash photo';
    lightboxAuthor.textContent = `Photo by ${photo.user.name}`;
    lightboxLink.href = photo.links.html;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

closeLightbox.addEventListener('click', closeLightboxHandler);
lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightboxHandler();
});

function closeLightboxHandler() {
    lightbox.classList.remove('active');
    document.body.style.overflow = 'auto';
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightboxHandler();
});