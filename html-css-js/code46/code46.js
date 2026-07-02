// JavaScript for Code 46
const amountEl = document.getElementById('amount');
const fromCurrencyEl = document.getElementById('from-currency');
const toCurrencyEl = document.getElementById('to-currency');
const swapBtn = document.getElementById('swap-btn');
const convertBtn = document.getElementById('convert-btn');
const resultAmountEl = document.getElementById('result-amount');
const rateInfoEl = document.getElementById('rate-info');
const lastUpdatedEl = document.getElementById('last-updated');

// Using exchangerate-api free tier. Get your free key at https://exchangerate-api.com
const API_KEY = 'YOUR_API_KEY_HERE'; // Replace with your key
const API_BASE = `https://v6.exchangerate-api.com/v6/${API_KEY}`;

const STORAGE_KEY = 'currency_converter_46_prefs';
let rates = {};
let currencies = [];

// Init
window.addEventListener('DOMContentLoaded', async () => {
    await loadCurrencies();
    loadPreferences();
    await fetchRates();
    convert();
});

// Load all supported currencies
async function loadCurrencies() {
    try {
        // exchangerate-api /codes endpoint gives all currencies
        const res = await fetch(`${API_BASE}/codes`);
        const data = await res.json();
        
        if (data.result === 'success') {
            currencies = data.supported_codes; // Array of [code, name]
            
            currencies.forEach(([code, name]) => {
                const option1 = new Option(`${code} - ${name}`, code);
                const option2 = new Option(`${code} - ${name}`, code);
                fromCurrencyEl.add(option1);
                toCurrencyEl.add(option2);
            });
        } else {
            throw new Error('Failed to load currencies');
        }
    } catch (err) {
        console.error(err);
        showError('Failed to load currencies. Check API key.');
    }
}

// Fetch rates based on 'from' currency
async function fetchRates() {
    const base = fromCurrencyEl.value || 'USD';
    try {
        convertBtn.disabled = true;
        lastUpdatedEl.textContent = 'Fetching rates...';
        
        const res = await fetch(`${API_BASE}/latest/${base}`);
        const data = await res.json();
        
        if (data.result === 'success') {
            rates = data.conversion_rates;
            const updateTime = new Date(data.time_last_update_utc);
            lastUpdatedEl.textContent = `Rates updated: ${updateTime.toLocaleString()}`;
            lastUpdatedEl.classList.remove('error');
        } else {
            throw new Error(data['error-type'] || 'API error');
        }
    } catch (err) {
        console.error(err);
        showError('Failed to fetch rates. Check your connection/API key.');
    } finally {
        convertBtn.disabled = false;
    }
}

function convert() {
    const amount = parseFloat(amountEl.value);
    const from = fromCurrencyEl.value;
    const to = toCurrencyEl.value;
    
    if (!amount || !rates[to]) {
        resultAmountEl.textContent = '-';
        rateInfoEl.textContent = '-';
        return;
    }
    
    const rate = rates[to];
    const converted = (amount * rate).toFixed(2);
    
    resultAmountEl.textContent = `${formatNumber(converted)} ${to}`;
    rateInfoEl.textContent = `1 ${from} = ${rate.toFixed(4)} ${to}`;
    
    savePreferences();
}

function formatNumber(num) {
    return new Intl.NumberFormat('en-US', {
        maximumFractionDigits: 2
    }).format(num);
}

function swapCurrencies() {
    const temp = fromCurrencyEl.value;
    fromCurrencyEl.value = toCurrencyEl.value;
    toCurrencyEl.value = temp;
    fetchRates().then(convert);
}

function showError(msg) {
    lastUpdatedEl.textContent = msg;
    lastUpdatedEl.classList.add('error');
    resultAmountEl.textContent = 'Error';
    rateInfoEl.textContent = '-';
}

// Save/load last used currencies
function savePreferences() {
    const prefs = {
        from: fromCurrencyEl.value,
        to: toCurrencyEl.value,
        amount: amountEl.value
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

function loadPreferences() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        const prefs = JSON.parse(saved);
        fromCurrencyEl.value = prefs.from || 'USD';
        toCurrencyEl.value = prefs.to || 'INR';
        amountEl.value = prefs.amount || '1';
    } else {
        fromCurrencyEl.value = 'USD';
        toCurrencyEl.value = 'INR';
    }
}

// Event listeners
convertBtn.addEventListener('click', convert);
swapBtn.addEventListener('click', swapCurrencies);
amountEl.addEventListener('input', convert);
fromCurrencyEl.addEventListener('change', () => fetchRates().then(convert));
toCurrencyEl.addEventListener('change', convert);

// Convert on Enter key
amountEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') convert();
});