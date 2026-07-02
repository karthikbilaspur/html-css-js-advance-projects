// JavaScript for Code 47
const API_KEY = 'YOUR_OPENWEATHER_API_KEY'; // Get one at openweathermap.org
const API_URL = 'https://api.openweathermap.org/data/2.5/weather';

const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const locationBtn = document.getElementById('location-btn');
const loader = document.getElementById('loader');
const errorMsg = document.getElementById('error-msg');
const weatherCard = document.getElementById('weather-card');

const cityNameEl = document.getElementById('city-name');
const dateTimeEl = document.getElementById('date-time');
const weatherIconEl = document.getElementById('weather-icon');
const tempEl = document.getElementById('temperature');
const descEl = document.getElementById('description');
const feelsLikeEl = document.getElementById('feels-like');
const humidityEl = document.getElementById('humidity');
const windEl = document.getElementById('wind');
const pressureEl = document.getElementById('pressure');

// Fetch weather by city name
async function getWeatherByCity(city) {
    showLoader();
    hideError();

    try {
        const response = await fetch(
            `${API_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`
        );

        if (!response.ok) {
            throw new Error(response.status === 404? 'City not found' : 'Failed to fetch weather');
        }

        const data = await response.json();
        displayWeather(data);

    } catch (error) {
        showError(error.message);
    } finally {
        hideLoader();
    }
}

// Fetch weather by coordinates
async function getWeatherByCoords(lat, lon) {
    showLoader();
    hideError();

    try {
        const response = await fetch(
            `${API_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );

        if (!response.ok) {
            throw new Error('Failed to fetch weather');
        }

        const data = await response.json();
        displayWeather(data);

    } catch (error) {
        showError(error.message);
    } finally {
        hideLoader();
    }
}

// Display weather data
function displayWeather(data) {
    cityNameEl.textContent = `${data.name}, ${data.sys.country}`;
    tempEl.textContent = Math.round(data.main.temp);
    descEl.textContent = data.weather[0].description;
    feelsLikeEl.textContent = `${Math.round(data.main.feels_like)}°C`;
    humidityEl.textContent = `${data.main.humidity}%`;
    windEl.textContent = `${data.wind.speed} m/s`;
    pressureEl.textContent = `${data.main.pressure} hPa`;

    weatherIconEl.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    weatherIconEl.alt = data.weather[0].description;

    const now = new Date();
    dateTimeEl.textContent = now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    weatherCard.classList.remove('hidden');
}

// Geolocation
function getUserLocation() {
    if (!navigator.geolocation) {
        showError('Geolocation not supported by your browser');
        return;
    }

    showLoader();
    navigator.geolocation.getCurrentPosition(
        (position) => {
            getWeatherByCoords(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
            hideLoader();
            showError('Unable to get location. Please search manually.');
        }
    );
}

// UI helpers
function showLoader() {
    loader.classList.remove('hidden');
    weatherCard.classList.add('hidden');
}

function hideLoader() {
    loader.classList.add('hidden');
}

function showError(message) {
    errorMsg.textContent = message;
    errorMsg.classList.remove('hidden');
    weatherCard.classList.add('hidden');
}

function hideError() {
    errorMsg.classList.add('hidden');
}

// Event listeners
searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) getWeatherByCity(city);
});

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = cityInput.value.trim();
        if (city) getWeatherByCity(city);
    }
});

locationBtn.addEventListener('click', getUserLocation);

// Load default city on startup
window.addEventListener('DOMContentLoaded', () => {
    getWeatherByCity('Bangalore');
});