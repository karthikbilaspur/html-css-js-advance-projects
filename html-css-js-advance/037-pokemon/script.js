const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const randomBtn = document.getElementById('randomBtn');
const typeFilter = document.getElementById('typeFilter');
const pokemonGrid = document.getElementById('pokemonGrid');
const loader = document.getElementById('loader');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const pageInfo = document.getElementById('pageInfo');
const modal = document.getElementById('modal');
const modalBody = document.getElementById('modalBody');
const closeBtn = document.getElementById('closeBtn');

const POKE_API = 'https://pokeapi.co/api/v2';
let currentOffset = 0;
const LIMIT = 20;
let currentPage = 1;
let abortController = null;
let lastFocusedElement = null;

const typeColors = {
    fire: '#f08030', water: '#6890f0', grass: '#78c850', electric: '#f8d030',
    psychic: '#f85888', ice: '#98d8d8', dragon: '#7038f8', dark: '#705848',
    fairy: '#ee99ac', normal: '#a8a878', fighting: '#c03028', poison: '#a040a0',
    ground: '#e0c068', flying: '#a890f0', bug: '#a8b820', rock: '#b8a038',
    ghost: '#705898', steel: '#b8b8d0'
};

const fallbackImg = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="120"%3E%3Crect fill="%23ddd" width="120" height="120"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="14"%3ENo Image%3C/text%3E%3C/svg%3E';

// Fetch Pokemon list
async function fetchPokemonList(offset = 0) {
    // Cancel previous request
    if (abortController) abortController.abort();
    abortController = new AbortController();

    showLoader();
    disableControls(true);

    try {
        const res = await fetch(`${POKE_API}/pokemon?limit=${LIMIT}&offset=${offset}`, {
            signal: abortController.signal
        });
        const data = await res.json();

        const pokemonPromises = data.results.map(p =>
            fetch(p.url, { signal: abortController.signal }).then(r => r.json())
        );
        const pokemonData = await Promise.all(pokemonPromises);

        displayPokemon(pokemonData);
        updatePagination(offset, data.count);
    } catch (error) {
        if (error.name === 'AbortError') return;
        console.error('Error:', error);
        pokemonGrid.innerHTML = '<p style="color: white; text-align: center; grid-column: 1/-1;">Failed to load Pokémon. Please try again.</p>';
    } finally {
        hideLoader();
        disableControls(false);
    }
}

// Display Pokemon cards
function displayPokemon(pokemonList) {
    pokemonGrid.innerHTML = '';

    pokemonList.forEach((pokemon, index) => {
        const card = createPokemonCard(pokemon, index);
        pokemonGrid.appendChild(card);
    });
}

// Create Pokemon card
function createPokemonCard(pokemon, index) {
    const card = document.createElement('div');
    card.classList.add('pokemon-card');
    card.setAttribute('role', 'listitem');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `${pokemon.name}, Pokémon #${pokemon.id}`);

    const types = pokemon.types.map(t => t.type.name);
    const img = pokemon.sprites.other['official-artwork'].front_default ||
                pokemon.sprites.front_default ||
                fallbackImg;

    card.innerHTML = `
        <div class="pokemon-id">#${String(pokemon.id).padStart(3, '0')}</div>
        <img src="${img}" alt="${pokemon.name}" class="pokemon-img" loading="lazy"
             onerror="this.src='${fallbackImg}'">
        <h3 class="pokemon-name">${pokemon.name}</h3>
        <div class="pokemon-types">
            ${types.map(type => `
                <span class="type-badge" style="background-color: ${typeColors[type] || '#777'}">${type}</span>
            `).join('')}
        </div>
    `;

    const openModal = () => showPokemonDetail(pokemon);
    card.addEventListener('click', openModal);
    card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openModal();
        }
    });

    return card;
}

// Show detailed view
function showPokemonDetail(pokemon) {
    lastFocusedElement = document.activeElement;
    const types = pokemon.types.map(t => t.type.name);
    const img = pokemon.sprites.other['official-artwork'].front_default ||
                pokemon.sprites.front_default ||
                fallbackImg;

    modalBody.innerHTML = `
        <div class="modal-header">
            <img src="${img}" alt="${pokemon.name}" onerror="this.src='${fallbackImg}'">
            <h2 id="modalTitle">${pokemon.name}</h2>
            <div class="pokemon-types">
                ${types.map(type => `
                    <span class="type-badge" style="background-color: ${typeColors[type] || '#777'}">${type}</span>
                `).join('')}
            </div>
            <p style="margin-top: 15px; color: #666;">
                Height: ${pokemon.height / 10}m | Weight: ${pokemon.weight / 10}kg
            </p>
        </div>
        <div class="modal-stats">
            <h3 style="margin-bottom: 15px;">Base Stats</h3>
            ${pokemon.stats.map(stat => `
                <div class="stat-row">
                    <span class="stat-name">${stat.stat.name.replace('-', ' ')}</span>
                    <div class="stat-bar-container">
                        <div class="stat-bar" style="width: ${Math.min(stat.base_stat / 2.55, 100)}%"></div>
                    </div>
                    <span class="stat-value">${stat.base_stat}</span>
                </div>
            `).join('')}
        </div>
    `;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
    trapFocus(modal);
}

// Search Pokemon
async function searchPokemon() {
    let query = searchInput.value.trim().toLowerCase();
    if (!query) return;

    // Handle "Mr. Mime", "Type: Null", etc
    query = query.replace(/\s+/g, '-').replace(/\./g, '');

    if (abortController) abortController.abort();
    abortController = new AbortController();

    showLoader();
    disableControls(true);

    try {
        const res = await fetch(`${POKE_API}/pokemon/${query}`, {
            signal: abortController.signal
        });
        if (!res.ok) throw new Error('Not found');

        const pokemon = await res.json();
        displayPokemon([pokemon]);
        prevBtn.disabled = true;
        nextBtn.disabled = true;
        pageInfo.textContent = 'Search Result';
    } catch (error) {
        if (error.name === 'AbortError') return;
        pokemonGrid.innerHTML = '<p style="color: white; text-align: center; grid-column: 1/-1;">Pokémon not found. Try a name or ID (1-1010).</p>';
        prevBtn.disabled = true;
        nextBtn.disabled = true;
        pageInfo.textContent = 'No results';
    } finally {
        hideLoader();
        disableControls(false);
    }
}

// Random Pokemon
async function randomPokemon() {
    const randomId = Math.floor(Math.random() * 1010) + 1;
    searchInput.value = randomId;
    await searchPokemon();
}

// Filter by type
async function filterByType() {
    const type = typeFilter.value;
    if (!type) {
        currentOffset = 0;
        fetchPokemonList(currentOffset);
        return;
    }

    if (abortController) abortController.abort();
    abortController = new AbortController();

    showLoader();
    disableControls(true);

    try {
        const res = await fetch(`${POKE_API}/type/${type}`, {
            signal: abortController.signal
        });
        const data = await res.json();

        // Get first 20 of this type
        const pokemonPromises = data.pokemon.slice(0, 20).map(p =>
            fetch(p.pokemon.url, { signal: abortController.signal }).then(r => r.json())
        );
        const pokemonData = await Promise.all(pokemonPromises);

        displayPokemon(pokemonData);
        prevBtn.disabled = true;
        nextBtn.disabled = true;
        pageInfo.textContent = `${type.charAt(0).toUpperCase() + type.slice(1)} Type (${data.pokemon.length})`;
    } catch (error) {
        if (error.name === 'AbortError') return;
        console.error('Error:', error);
        pokemonGrid.innerHTML = '<p style="color: white; text-align: center; grid-column: 1/-1;">Failed to load type.</p>';
    } finally {
        hideLoader();
        disableControls(false);
    }
}

function updatePagination(offset, total) {
    currentPage = Math.floor(offset / LIMIT) + 1;
    const totalPages = Math.ceil(total / LIMIT);
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    prevBtn.disabled = offset === 0;
    nextBtn.disabled = offset + LIMIT >= total;
}

function showLoader() {
    loader.classList.add('active');
    pokemonGrid.innerHTML = '';
}

function hideLoader() {
    loader.classList.remove('active');
}

function disableControls(disabled) {
    searchBtn.disabled = disabled;
    randomBtn.disabled = disabled;
    typeFilter.disabled = disabled;
    prevBtn.disabled = disabled || currentOffset === 0;
    nextBtn.disabled = disabled;
}

// Focus trap for modal
function trapFocus(element) {
    const focusableElements = element.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    element.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            if (e.shiftKey && document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            } else if (!e.shiftKey && document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    });
}

function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    if (lastFocusedElement) lastFocusedElement.focus();
}

// Event listeners
searchBtn.addEventListener('click', searchPokemon);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchPokemon();
});

randomBtn.addEventListener('click', randomPokemon);
typeFilter.addEventListener('change', filterByType);

prevBtn.addEventListener('click', () => {
    currentOffset -= LIMIT;
    fetchPokemonList(currentOffset);
});

nextBtn.addEventListener('click', () => {
    currentOffset += LIMIT;
    fetchPokemonList(currentOffset);
});

closeBtn.addEventListener('click', closeModal);

modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
    }
});

// Init
fetchPokemonList();