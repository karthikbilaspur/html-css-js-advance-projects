const numbersInput = document.getElementById('numbers');
const calculateBtn = document.getElementById('calculate');
const clearBtn = document.getElementById('clear');
const exampleBtn = document.getElementById('example');

const meanEl = document.getElementById('mean');
const medianEl = document.getElementById('median');
const modeEl = document.getElementById('mode');

const countEl = document.getElementById('count');
const sumEl = document.getElementById('sum');
const minEl = document.getElementById('min');
const maxEl = document.getElementById('max');
const rangeEl = document.getElementById('range');
const sortedEl = document.getElementById('sorted');

function parseNumbers(input) {
    // Split by comma, space, or newline and filter out empty strings
    return input
       .split(/[,\s\n]+/)
       .map(num => num.trim())
       .filter(num => num!== '')
       .map(num => parseFloat(num))
       .filter(num =>!isNaN(num));
}

function calculateMean(arr) {
    if (arr.length === 0) return 0;
    const sum = arr.reduce((a, b) => a + b, 0);
    return sum / arr.length;
}

function calculateMedian(arr) {
    if (arr.length === 0) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);

    if (sorted.length % 2 === 0) {
        return (sorted[mid - 1] + sorted[mid]) / 2;
    } else {
        return sorted[mid];
    }
}

function calculateMode(arr) {
    if (arr.length === 0) return 'None';

    const frequency = {};
    let maxFreq = 0;

    arr.forEach(num => {
        frequency[num] = (frequency[num] || 0) + 1;
        if (frequency[num] > maxFreq) {
            maxFreq = frequency[num];
        }
    });

    if (maxFreq === 1) return 'No mode';

    const modes = Object.keys(frequency)
       .filter(key => frequency[key] === maxFreq)
       .map(Number);

    return modes.length === 1? modes[0] : modes.join(', ');
}

function calculateStats(arr) {
    if (arr.length === 0) return;

    const sorted = [...arr].sort((a, b) => a - b);
    const sum = arr.reduce((a, b) => a + b, 0);
    const min = Math.min(...arr);
    const max = Math.max(...arr);

    countEl.textContent = arr.length;
    sumEl.textContent = sum.toFixed(2);
    minEl.textContent = min;
    maxEl.textContent = max;
    rangeEl.textContent = (max - min).toFixed(2);
    sortedEl.textContent = sorted.join(', ');
}

function formatNumber(num) {
    if (typeof num === 'string') return num;
    return Number.isInteger(num)? num : num.toFixed(2);
}

function handleCalculate() {
    const numbers = parseNumbers(numbersInput.value);

    if (numbers.length === 0) {
        alert('Please enter valid numbers');
        return;
    }

    const mean = calculateMean(numbers);
    const median = calculateMedian(numbers);
    const mode = calculateMode(numbers);

    meanEl.textContent = formatNumber(mean);
    medianEl.textContent = formatNumber(median);
    modeEl.textContent = mode;

    calculateStats(numbers);
}

function handleClear() {
    numbersInput.value = '';
    meanEl.textContent = '-';
    medianEl.textContent = '-';
    modeEl.textContent = '-';
    countEl.textContent = '0';
    sumEl.textContent = '0';
    minEl.textContent = '-';
    maxEl.textContent = '-';
    rangeEl.textContent = '-';
    sortedEl.textContent = '-';
}

function handleExample() {
    numbersInput.value = '5, 10, 15, 10, 20, 25, 10, 30';
    handleCalculate();
}

// Event listeners
calculateBtn.addEventListener('click', handleCalculate);
clearBtn.addEventListener('click', handleClear);
exampleBtn.addEventListener('click', handleExample);

// Calculate on Enter key in textarea with Ctrl/Cmd
numbersInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        handleCalculate();
    }
});