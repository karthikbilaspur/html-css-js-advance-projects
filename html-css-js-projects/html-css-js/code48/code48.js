// JavaScript for Code 48
const locationBtn = document.getElementById('location-btn');
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const errorEl = document.getElementById('error');
const loadingEl = document.getElementById('loading');
const weatherCard = document.getElementById('weather-card');

// Weather code mapping for Open-Meteo
const weatherCodes = {
    0: { desc: 'Clear sky', icon: '☀️' },
    1: { desc: 'Mainly clear', icon: '🌤️' },
    2: { desc: 'Partly cloudy', icon: '⛅' },
    3: { desc: 'Overcast', icon: '☁️' },
    45: { desc: 'Foggy', icon: '🌫️' },
    48: { desc: 'Depositing rime fog', icon: '🌫️' },
    51: { desc: 'Light drizzle', icon: '🌦️' },
    53: { desc: 'Moderate drizzle', icon: '🌦️' },
    55: { desc: 'Dense drizzle', icon: '🌧️' },
    61: { desc: 'Slight rain', icon: '🌧️' },
    63: { desc: 'Moderate rain', icon: '🌧️' },
    65: { desc: 'Heavy rain', icon: '🌧️' },
    71: { desc: 'Slight snow', icon: '🌨️' },
    73: { desc: 'Moderate snow', icon: '🌨️' },
    75: { desc: 'Heavy snow', icon: '❄️' },
    77: { desc: 'Snow grains', icon: '🌨️' },
    80: { desc: 'Slight rain showers', icon: '🌦️' },
    81: { desc: 'Moderate rain showers', icon: '🌧️' },
    82: { desc: 'Violent rain showers', icon: '⛈️' },
    85: { desc: 'Slight snow showers', icon: '🌨️' },
    86: { desc: 'Heavy snow showers', icon: '❄️' },
    95: { desc: 'Thunderstorm', icon: '⛈️' },
    96: { desc: 'Thunderstorm with hail', icon: '⛈️' },
    99: { desc: 'Thunderstorm with heavy hail', icon: '⛈️' }
};

// Init with geolocation on load
window.addEventListener('DOMContentLoaded', () => {
    getUserLocation();
});

// Geolocation API with error handling
function getUserLocation() {
    hideError();
    showLoading();

    if (!navigator.geolocation) {
        showError('Geolocation is not supported by your browser');
        hideLoading();
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            fetchWeatherByCoords(latitude, longitude);
        },
        (error) => {
            hideLoading();
            handleGeoError(error);
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
}

function handleGeoError(error) {
    let message = 'Unable to get your location. ';
    switch(error.code) {
        case error.PERMISSION_DENIED:
            message += 'Location permission denied. Please enable it or search manually.';
            break;
        case error.POSITION_UNAVAILABLE:
            message += 'Location information unavailable.';
            break;
        case error.TIMEOUT:
            message += 'Location request timed out. Try again.';
            break;
        default:
            message += 'An unknown error occurred.';
    }
    showError(message);
}

// Fetch weather by coordinates
async function fetchWeatherByCoords(lat, lon) {
    try {
        showLoading();
        hideError();

        // Get city name from coords
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}&language=en`);
        if (!geoRes.ok) throw new Error('Failed to get location name');
        const geoData = await geoRes.json();
        const cityName = geoData.results?.[0]?.name || 'Unknown Location';

        // Get weather data
        const weatherRes = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,surface_pressure,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`
        );
        if (!weatherRes.ok) throw new Error('Weather API request failed');

        const data = await weatherRes.json();
        displayWeather(data, cityName, lat, lon);
    } catch (err) {
        showError(`Failed to fetch weather: ${err.message}`);
    } finally {
        hideLoading();
    }
}

// Search by city name
async function searchCity() {
    const city = cityInput.value.trim();
    if (!city) {
        showError('Please enter a city name');
        return;
    }

    try {
        showLoading();
        hideError();

        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en`);
        if (!geoRes.ok) throw new Error('City search failed');

        const geoData = await geoRes.json();
        if (!geoData.results || geoData.results.length === 0) {
            throw new Error(`City "${city}" not found`);
        }

        const { latitude, longitude, name, country } = geoData.results[0];
        await fetchWeatherByCoords(latitude, longitude);
    } catch (err) {
        showError(err.message);
        hideLoading();
    }
}

// Display weather data
function displayWeather(data, cityName, lat, lon) {
    const current = data.current;
    const daily = data.daily;
    const weather = weatherCodes[current.weather_code] || { desc: 'Unknown', icon: '❓' };

    document.getElementById('city-name').textContent = cityName;
    document.getElementById('coordinates').textContent = `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`;
    document.getElementById('temperature').textContent = Math.round(current.temperature_2m);
    document.getElementById('weather-icon').textContent = weather.icon;
    document.getElementById('weather-desc').textContent = weather.desc;
    document.getElementById('feels-like').textContent = `${Math.round(current.apparent_temperature)}°`;
    document.getElementById('humidity').textContent = `${current.relative_humidity_2m}%`;
    document.getElementById('wind-speed').textContent = `${Math.round(current.wind_speed_10m)} km/h`;
    document.getElementById('pressure').textContent = `${Math.round(current.surface_pressure)} hPa`;

    // 7-day forecast
    const forecastList = document.getElementById('forecast-list');
    forecastList.innerHTML = daily.time.slice(0, 7).map((date, i) => {
        const dayWeather = weatherCodes[daily.weather_code[i]] || { icon: '❓' };
        const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
        return `
            <div class="forecast-item">
                <span class="forecast-day">${i === 0? 'Today' : dayName}</span>
                <span class="forecast-icon">${dayWeather.icon}</span>
                <span class="forecast-temp">${Math.round(daily.temperature_2m_max[i])}° / ${Math.round(daily.temperature_2m_min[i])}°</span>
            </div>
        `;
    }).join('');

    weatherCard.classList.remove('hidden');
    hideLoading();
}

// UI helpers
function showError(msg) {
    errorEl.textContent = msg;
    errorEl.classList.remove('hidden');
    weatherCard.classList.add('hidden');
}

function hideError() {
    errorEl.classList.add('hidden');
}

function showLoading() {
    loadingEl.classList.remove('hidden');
    weatherCard.classList.add('hidden');
}

function hideLoading() {
    loadingEl.classList.add('hidden');
}

// Event listeners
locationBtn.addEventListener('click', getUserLocation);
searchBtn.addEventListener('click', searchCity);
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchCity();
});