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

const typeColors = {
    fire: '#f08030',
    water: '#6890f0',
    grass: '#78c850',
    electric: '#f8d030',
    psychic: '#f85888',
    ice: '#98d8d8',
    dragon: '#7038f8',
    dark: '#705848',
    fairy: '#ee99ac',
    normal: '#a8a878',
    fighting: '#c03028',
    poison: '#a040a0',
    ground: '#e0c068',
    flying: '#a890f0',
    bug: '#a8b820',
    rock: '#b8a038',
    ghost: '#705898',
    steel: '#b8b8d0'
};

// Fetch Pokemon list
async function fetchPokemonList(offset = 0) {
    showLoader();
    try {
        const res = await fetch(`${POKE_API}/pokemon?limit=${LIMIT}&offset=${offset}`);
        const data = await res.json();

        const pokemonPromises = data.results.map(p => fetch(p.url).then(r => r.json()));
        const pokemonData = await Promise.all(pokemonPromises);

        displayPokemon(pokemonData);
        updatePagination(offset, data.count);
    } catch (error) {
        console.error('Error:', error);
        pokemonGrid.innerHTML = '<p style="color: white; text-align: center;">Failed to load Pokémon</p>';
    } finally {
        hideLoader();
    }
}

// Display Pokemon cards
function displayPokemon(pokemonList) {
    pokemonGrid.innerHTML = '';

    pokemonList.forEach(pokemon => {
        const card = createPokemonCard(pokemon);
        pokemonGrid.appendChild(card);
    });
}

// Create Pokemon card
function createPokemonCard(pokemon) {
    const card = document.createElement('div');
    card.classList.add('pokemon-card');

    const types = pokemon.types.map(t => t.type.name);
    const mainType = types[0];

    card.innerHTML = `
        <div class="pokemon-id">#${String(pokemon.id).padStart(3, '0')}</div>
        <img src="${pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default}"
             alt="${pokemon.name}" class="pokemon-img">
        <h3 class="pokemon-name">${pokemon.name}</h3>
        <div class="pokemon-types">
            ${types.map(type => `
                <span class="type-badge" style="background-color: ${typeColors[type]}">${type}</span>
            `).join('')}
        </div>
    `;

    card.addEventListener('click', () => showPokemonDetail(pokemon));
    return card;
}

// Show detailed view
function showPokemonDetail(pokemon) {
    const types = pokemon.types.map(t => t.type.name);

    modalBody.innerHTML = `
        <div class="modal-header">
            <img src="${pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default}"
                 alt="${pokemon.name}">
            <h2>${pokemon.name}</h2>
            <div class="pokemon-types">
                ${types.map(type => `
                    <span class="type-badge" style="background-color: ${typeColors[type]}">${type}</span>
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
                    <span class="stat-name">${stat.stat.name}</span>
                    <div class="stat-bar-container">
                        <div class="stat-bar" style="width: ${stat.base_stat / 2.55}%"></div>
                    </div>
                    <span class="stat-value">${stat.base_stat}</span>
                </div>
            `).join('')}
        </div>
    `;

    modal.classList.add('active');
}

// Search Pokemon
async function searchPokemon() {
    const query = searchInput.value.trim().toLowerCase();
    if (!query) return;

    showLoader();
    try {
        const res = await fetch(`${POKE_API}/pokemon/${query}`);
        if (!res.ok) throw new Error('Not found');

        const pokemon = await res.json();
        displayPokemon([pokemon]);
        prevBtn.disabled = true;
        nextBtn.disabled = true;
        pageInfo.textContent = 'Search Result';
    } catch (error) {
        pokemonGrid.innerHTML = '<p style="color: white; text-align: center;">Pokémon not found</p>';
    } finally {
        hideLoader();
    }
}

// Random Pokemon
async function randomPokemon() {
    const randomId = Math.floor(Math.random() * 1010) + 1;
    searchInput.value = randomId;
    searchPokemon();
}

// Filter by type
async function filterByType() {
    const type = typeFilter.value;
    if (!type) {
        fetchPokemonList(currentOffset);
        return;
    }

    showLoader();
    try {
        const res = await fetch(`${POKE_API}/type/${type}`);
        const data = await res.json();

        const pokemonPromises = data.pokemon.slice(0, 20).map(p =>
            fetch(p.pokemon.url).then(r => r.json())
        );
        const pokemonData = await Promise.all(pokemonPromises);

        displayPokemon(pokemonData);
        prevBtn.disabled = true;
        nextBtn.disabled = true;
        pageInfo.textContent = `${type.charAt(0).toUpperCase() + type.slice(1)} Type`;
    } catch (error) {
        console.error('Error:', error);
    } finally {
        hideLoader();
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

closeBtn.addEventListener('click', () => {
    modal.classList.remove('active');
});

modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
});

// Init
fetchPokemonList();