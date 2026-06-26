// JavaScript for Code 38// Object lookup table for all conversions
const units = {
  length: {
    meter: { name: 'Meter', factor: 1, symbol: 'm' },
    kilometer: { name: 'Kilometer', factor: 1000, symbol: 'km' },
    centimeter: { name: 'Centimeter', factor: 0.01, symbol: 'cm' },
    millimeter: { name: 'Millimeter', factor: 0.001, symbol: 'mm' },
    mile: { name: 'Mile', factor: 1609.34, symbol: 'mi' },
    yard: { name: 'Yard', factor: 0.9144, symbol: 'yd' },
    foot: { name: 'Foot', factor: 0.3048, symbol: 'ft' },
    inch: { name: 'Inch', factor: 0.0254, symbol: 'in' }
  },
  weight: {
    kilogram: { name: 'Kilogram', factor: 1, symbol: 'kg' },
    gram: { name: 'Gram', factor: 0.001, symbol: 'g' },
    milligram: { name: 'Milligram', factor: 0.000001, symbol: 'mg' },
    pound: { name: 'Pound', factor: 0.453592, symbol: 'lb' },
    ounce: { name: 'Ounce', factor: 0.0283495, symbol: 'oz' },
    ton: { name: 'Metric Ton', factor: 1000, symbol: 't' }
  },
  temperature: {
    celsius: { name: 'Celsius', symbol: '°C' },
    fahrenheit: { name: 'Fahrenheit', symbol: '°F' },
    kelvin: { name: 'Kelvin', symbol: 'K' }
  },
  volume: {
    liter: { name: 'Liter', factor: 1, symbol: 'L' },
    milliliter: { name: 'Milliliter', factor: 0.001, symbol: 'mL' },
    gallon: { name: 'US Gallon', factor: 3.78541, symbol: 'gal' },
    quart: { name: 'US Quart', factor: 0.946353, symbol: 'qt' },
    pint: { name: 'US Pint', factor: 0.473176, symbol: 'pt' },
    cup: { name: 'US Cup', factor: 0.236588, symbol: 'cup' }
  },
  speed: {
    mps: { name: 'Meters/sec', factor: 1, symbol: 'm/s' },
    kph: { name: 'Kilometers/hr', factor: 0.277778, symbol: 'km/h' },
    mph: { name: 'Miles/hr', factor: 0.44704, symbol: 'mph' },
    knot: { name: 'Knot', factor: 0.514444, symbol: 'kn' }
  },
  area: {
    sqmeter: { name: 'Square Meter', factor: 1, symbol: 'm²' },
    sqkilometer: { name: 'Square KM', factor: 1000000, symbol: 'km²' },
    sqfoot: { name: 'Square Foot', factor: 0.092903, symbol: 'ft²' },
    acre: { name: 'Acre', factor: 4046.86, symbol: 'ac' },
    hectare: { name: 'Hectare', factor: 10000, symbol: 'ha' }
  }
};

const fromValue = document.getElementById('fromValue');
const toValue = document.getElementById('toValue');
const fromUnit = document.getElementById('fromUnit');
const toUnit = document.getElementById('toUnit');
const swapBtn = document.getElementById('swapBtn');
const formulaText = document.getElementById('formulaText');
const tabBtns = document.querySelectorAll('.tab-btn');
const quickGrid = document.getElementById('quickGrid');
const historyList = document.getElementById('historyList');
const clearHistoryBtn = document.getElementById('clearHistory');

let currentCategory = 'length';
let history = JSON.parse(localStorage.getItem('conversionHistory')) || [];

function populateSelects() {
  const categoryUnits = units[currentCategory];
  fromUnit.innerHTML = '';
  toUnit.innerHTML = '';

  Object.keys(categoryUnits).forEach(key => {
    const option1 = new Option(categoryUnits[key].name, key);
    const option2 = new Option(categoryUnits[key].name, key);
    fromUnit.add(option1);
    toUnit.add(option2);
  });

  // Set defaults
  fromUnit.selectedIndex = 0;
  toUnit.selectedIndex = 1;
  updateQuickConversions();
}

function convert() {
  const val = parseFloat(fromValue.value);
  if (isNaN(val)) {
    toValue.value = '';
    return;
  }

  const from = fromUnit.value;
  const to = toUnit.value;

  let result;
  if (currentCategory === 'temperature') {
    result = convertTemperature(val, from, to);
  } else {
    const fromFactor = units[currentCategory][from].factor;
    const toFactor = units[currentCategory][to].factor;
    result = (val * fromFactor) / toFactor;
  }

  toValue.value = result.toFixed(6).replace(/\.?0+$/, '');
  updateFormula(val, result, from, to);
  addToHistory(val, from, result, to);
}

function convertTemperature(val, from, to) {
  let celsius;
  // Convert to Celsius first
  if (from === 'celsius') celsius = val;
  else if (from === 'fahrenheit') celsius = (val - 32) * 5/9;
  else if (from === 'kelvin') celsius = val - 273.15;

  // Convert from Celsius to target
  if (to === 'celsius') return celsius;
  else if (to === 'fahrenheit') return celsius * 9/5 + 32;
  else if (to === 'kelvin') return celsius + 273.15;
}

function updateFormula(fromVal, toVal, from, to) {
  const fromName = units[currentCategory][from].name;
  const toName = units[currentCategory][to].name;
  const fromSymbol = units[currentCategory][from].symbol;
  const toSymbol = units[currentCategory][to].symbol;

  formulaText.textContent = `${fromVal} ${fromSymbol} = ${toVal.toFixed(4)} ${toSymbol}`;
}

function updateQuickConversions() {
  const categoryUnits = units[currentCategory];
  const keys = Object.keys(categoryUnits).slice(0, 4);
  quickGrid.innerHTML = keys.map((key, idx) => {
    if (idx === 0) return '';
    return `<div class="quick-item" onclick="quickConvert('${keys[0]}', '${key}')">
      1 ${categoryUnits[keys[0]].symbol} → ${categoryUnits[key].symbol}
    </div>`;
  }).join('');
}

function quickConvert(from, to) {
  fromUnit.value = from;
  toUnit.value = to;
  fromValue.value = 1;
  convert();
}

function swapUnits() {
  const tempUnit = fromUnit.value;
  const tempVal = fromValue.value;
  fromUnit.value = toUnit.value;
  toUnit.value = tempUnit;
  fromValue.value = toValue.value;
  convert();
}

function addToHistory(fromVal, from, toVal, to) {
  const fromSymbol = units[currentCategory][from].symbol;
  const toSymbol = units[currentCategory][to].symbol;
  const entry = `${fromVal} ${fromSymbol} → ${toVal.toFixed(4)} ${toSymbol}`;

  history.unshift(entry);
  if (history.length > 5) history.pop();

  localStorage.setItem('conversionHistory', JSON.stringify(history));
  renderHistory();
}

function renderHistory() {
  historyList.innerHTML = history.map(item => `<div class="history-item">${item}</div>`).join('');
}

// Event listeners
tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    tabBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentCategory = btn.dataset.category;
    populateSelects();
    convert();
  });
});

fromValue.addEventListener('input', convert);
fromUnit.addEventListener('change', convert);
toUnit.addEventListener('change', convert);
swapBtn.addEventListener('click', swapUnits);
clearHistoryBtn.addEventListener('click', () => {
  history = [];
  localStorage.removeItem('conversionHistory');
  renderHistory();
});

// Make quickConvert global
window.quickConvert = quickConvert;

// Init
populateSelects();
renderHistory();
convert();;