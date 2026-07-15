const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const locationBtn = document.getElementById('locationBtn');
const loader = document.getElementById('loader');
const dashboard = document.getElementById('dashboard');
const errorMessage = document.getElementById('errorMessage');
const retryBtn = document.getElementById('retryBtn');

let tempChart;

// Weather code to icon + description mapping
const weatherCodes = {
    0: { icon: '☀', desc: 'Clear sky' },
    1: { icon: '🌤', desc: 'Mainly clear' },
    2: { icon: '⛅', desc: 'Partly cloudy' },
    3: { icon: '☁', desc: 'Overcast' },
    45: { icon: '🌫', desc: 'Foggy' },
    48: { icon: '🌫', desc: 'Depositing rime fog' },
    51: { icon: '🌦', desc: 'Light drizzle' },
    53: { icon: '🌦', desc: 'Moderate drizzle' },
    55: { icon: '🌧', desc: 'Dense drizzle' },
    61: { icon: '🌧', desc: 'Slight rain' },
    63: { icon: '🌧', desc: 'Moderate rain' },
    65: { icon: '🌧', desc: 'Heavy rain' },
    71: { icon: '🌨', desc: 'Slight snow' },
    73: { icon: '🌨', desc: 'Moderate snow' },
    75: { icon: '❄', desc: 'Heavy snow' },
    77: { icon: '🌨', desc: 'Snow grains' },
    80: { icon: '🌦', desc: 'Slight rain showers' },
    81: { icon: '🌧', desc: 'Moderate rain showers' },
    82: { icon: '⛈', desc: 'Violent rain showers' },
    85: { icon: '🌨', desc: 'Slight snow showers' },
    86: { icon: '❄', desc: 'Heavy snow showers' },
    95: { icon: '⛈', desc: 'Thunderstorm' },
    96: { icon: '⛈', desc: 'Thunderstorm with hail' },
    99: { icon: '⛈', desc: 'Thunderstorm with heavy hail' }
};

// Init with default city
getWeatherByCity('London');

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

locationBtn.addEventListener('click', () => {
    if (navigator.geolocation) {
        showLoader();
        navigator.geolocation.getCurrentPosition(
            (position) => {
                getWeatherByCoords(position.coords.latitude, position.coords.longitude);
            },
            () => {
                showError('Location access denied');
            }
        );
    } else {
        showError('Geolocation not supported');
    }
});

retryBtn.addEventListener('click', () => {
    getWeatherByCity('London');
});

async function getWeatherByCity(city) {
    showLoader();
    try {
        // Step 1: Geocode city to coordinates
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`);
        const geoData = await geoRes.json();

        if (!geoData.results || geoData.results.length === 0) {
            throw new Error('City not found');
        }

        const { latitude, longitude, name, country } = geoData.results[0];
        await fetchWeatherData(latitude, longitude, `${name}, ${country}`);
    } catch (error) {
        showError(error.message);
    }
}

async function getWeatherByCoords(lat, lon) {
    try {
        const geoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}`);
        const geoData = await geoRes.json();
        const locationName = geoData.city || geoData.locality || 'Your Location';
        await fetchWeatherData(lat, lon, locationName);
    } catch (error) {
        await fetchWeatherData(lat, lon, 'Your Location');
    }
}

async function fetchWeatherData(lat, lon, locationName) {
    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,uv_index_max&timezone=auto`;

        const response = await fetch(url);
        const data = await response.json();

        displayWeather(data, locationName);
        hideLoader();
    } catch (error) {
        showError('Failed to fetch weather data');
    }
}

function displayWeather(data, locationName) {
    const current = data.current;
    const daily = data.daily;
    const hourly = data.hourly;

    // Set location and date
    document.getElementById('locationName').textContent = locationName;
    document.getElementById('currentDate').textContent = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Weather info
    const weatherInfo = weatherCodes[current.weather_code] || { icon: '🌡', desc: 'Unknown' };
    document.getElementById('description').textContent = weatherInfo.desc;
    document.getElementById('weatherIcon').textContent = weatherInfo.icon;

    // Temperature
    document.getElementById('temperature').textContent = Math.round(current.temperature_2m);
    document.getElementById('feelsLike').textContent = Math.round(current.apparent_temperature);

    // Stats
    document.getElementById('humidity').textContent = `${current.relative_humidity_2m}%`;
    document.getElementById('windSpeed').textContent = `${Math.round(current.wind_speed_10m)} km/h`;
    document.getElementById('precipitation').textContent = `${current.precipitation} mm`;
    document.getElementById('uvIndex').textContent = Math.round(daily.uv_index_max[0]);

    // Day/Night theme
    const hour = new Date().getHours();
    document.body.className = (hour >= 6 && hour < 18)? 'day' : 'night';

    // Render chart
    renderChart(hourly);

    // Render 5-day forecast
    renderForecast(daily);

    dashboard.classList.add('active');
    errorMessage.classList.remove('active');
}

function renderChart(hourly) {
    const ctx = document.getElementById('tempChart').getContext('2d');
    const hours = hourly.time.slice(0, 24).map(t => new Date(t).getHours() + ':00');
    const temps = hourly.temperature_2m.slice(0, 24);

    if (tempChart) tempChart.destroy();

    tempChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: hours,
            datasets: [{
                label: 'Temperature °C',
                data: temps,
                borderColor: '#38bdf8',
                backgroundColor: 'rgba(56, 189, 248, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#38bdf8',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#1e293b',
                    titleColor: '#f1f5f9',
                    bodyColor: '#cbd5e1',
                    borderColor: '#334155',
                    borderWidth: 1
                }
            },
            scales: {
                y: {
                    ticks: { color: '#94a3b8' },
                    grid: { color: '#334155' }
                },
                x: {
                    ticks: { color: '#94a3b8', maxRotation: 0 },
                    grid: { display: false }
                }
            }
        }
    });
}

function renderForecast(daily) {
    const forecastGrid = document.getElementById('forecastGrid');
    forecastGrid.innerHTML = '';

    for (let i = 1; i <= 5; i++) {
        const date = new Date(daily.time[i]);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const weatherInfo = weatherCodes[daily.weather_code[i]] || { icon: '🌡' };

        const card = document.createElement('div');
        card.className = 'forecast-card';
        card.innerHTML = `
            <div class="forecast-day">${dayName}</div>
            <div class="forecast-icon">${weatherInfo.icon}</div>
            <div class="forecast-temp">${Math.round(daily.temperature_2m_max[i])}°</div>
            <div class="forecast-min">${Math.round(daily.temperature_2m_min[i])}°</div>
        `;
        forecastGrid.appendChild(card);
    }
}

function showLoader() {
    loader.classList.add('active');
    dashboard.classList.remove('active');
    errorMessage.classList.remove('active');
}

function hideLoader() {
    loader.classList.remove('active');
}

function showError(message) {
    loader.classList.remove('active');
    dashboard.classList.remove('active');
    errorMessage.classList.add('active');
    document.getElementById('errorText').textContent = message;
}