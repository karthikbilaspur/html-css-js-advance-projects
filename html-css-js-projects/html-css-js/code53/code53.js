// JavaScript for Code 53
const API_URL = 'https://restcountries.com/v3.1';

const searchInput = document.getElementById('search-input');
const regionFilter = document.getElementById('region-filter');
const countriesGrid = document.getElementById('countries-grid');
const statusEl = document.getElementById('status');
const modal = document.getElementById('modal');
const modalBody = document.getElementById('modal-body');
const closeBtn = document.querySelector('.close');

let allCountries = [];
let debounceTimer;

// Fetch all countries on load
window.addEventListener('DOMContentLoaded', async () => {
    statusEl.textContent = 'Loading countries...';
    try {
        const res = await fetch(`${API_URL}/all?fields=name,flags,population,region,capital,cca3`);
        allCountries = await res.json();
        displayCountries(allCountries);
        statusEl.textContent = `Showing ${allCountries.length} countries`;
    } catch (err) {
        statusEl.textContent = 'Failed to load countries. Refresh the page.';
        console.error(err);
    }
});

// Search with debounce
searchInput.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        filterCountries();
    }, 400);
});

// Region filter
regionFilter.addEventListener('change', filterCountries);

function filterCountries() {
    const query = searchInput.value.toLowerCase();
    const region = regionFilter.value;

    let filtered = allCountries;

    if (region) {
        filtered = filtered.filter(c => c.region === region);
    }

    if (query) {
        filtered = filtered.filter(c =>
            c.name.common.toLowerCase().includes(query) ||
            c.name.official.toLowerCase().includes(query)
        );
    }

    displayCountries(filtered);
    statusEl.textContent = `Showing ${filtered.length} countries`;
}

function displayCountries(countries) {
    if (countries.length === 0) {
        countriesGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #666;">No countries found</p>';
        return;
    }

    countriesGrid.innerHTML = countries.map(country => `
        <div class="country-card" data-cca3="${country.cca3}">
            <img src="${country.flags.svg}" alt="${country.name.common} flag" class="flag" loading="lazy">
            <div class="card-body">
                <h3>${country.name.common}</h3>
                <div class="card-info">
                    <p><strong>Population:</strong> ${country.population.toLocaleString()}</p>
                    <p><strong>Region:</strong> ${country.region}</p>
                    <p><strong>Capital:</strong> ${country.capital?.[0] || 'N/A'}</p>
                </div>
            </div>
        </div>
    `).join('');
}

// Show country details in modal
countriesGrid.addEventListener('click', async (e) => {
    const card = e.target.closest('.country-card');
    if (!card) return;

    const cca3 = card.dataset.cca3;
    await showCountryDetails(cca3);
});

async function showCountryDetails(cca3) {
    try {
        const res = await fetch(`${API_URL}/alpha/${cca3}`);
        const data = await res.json();
        const country = data[0];

        const nativeName = country.name.nativeName?
            Object.values(country.name.nativeName)[0].common : country.name.common;

        const currencies = country.currencies?
            Object.values(country.currencies).map(c => `${c.name} (${c.symbol})`).join(', ') : 'N/A';

        const languages = country.languages?
            Object.values(country.languages).join(', ') : 'N/A';

        // Get border countries
        let bordersHtml = 'None';
        if (country.borders && country.borders.length > 0) {
            const borderRes = await fetch(`${API_URL}/alpha?codes=${country.borders.join(',')}&fields=name`);
            const borderData = await borderRes.json();
            bordersHtml = borderData.map(b =>
                `<span class="border-tag">${b.name.common}</span>`
            ).join('');
        }

        modalBody.innerHTML = `
            <img src="${country.flags.svg}" alt="${country.name.common} flag">
            <div class="modal-details">
                <h2>${country.name.common}</h2>
                <div class="detail-grid">
                    <div class="detail-item">
                        <p>Native Name</p>
                        <h4>${nativeName}</h4>
                    </div>
                    <div class="detail-item">
                        <p>Population</p>
                        <h4>${country.population.toLocaleString()}</h4>
                    </div>
                    <div class="detail-item">
                        <p>Region</p>
                        <h4>${country.region}</h4>
                    </div>
                    <div class="detail-item">
                        <p>Sub Region</p>
                        <h4>${country.subregion || 'N/A'}</h4>
                    </div>
                    <div class="detail-item">
                        <p>Capital</p>
                        <h4>${country.capital?.[0] || 'N/A'}</h4>
                    </div>
                    <div class="detail-item">
                        <p>Top Level Domain</p>
                        <h4>${country.tld?.[0] || 'N/A'}</h4>
                    </div>
                    <div class="detail-item">
                        <p>Currencies</p>
                        <h4>${currencies}</h4>
                    </div>
                    <div class="detail-item">
                        <p>Languages</p>
                        <h4>${languages}</h4>
                    </div>
                </div>
                <div class="border-countries">
                    <h4>Border Countries:</h4>
                    <div class="border-tags">${bordersHtml}</div>
                </div>
            </div>
        `;

        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    } catch (err) {
        console.error('Error fetching details:', err);
    }
}

// Close modal
closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
});

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
});