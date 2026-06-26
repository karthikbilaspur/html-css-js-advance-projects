// JavaScript for Code 22
const tempInput = document.getElementById('tempInput');
const fromUnit = document.getElementById('fromUnit');
const toUnit = document.getElementById('toUnit');
const resultValue = document.getElementById('resultValue');
const resultUnit = document.getElementById('resultUnit');
const formulaText = document.getElementById('formulaText');
const swapBtn = document.getElementById('swapBtn');

const unitSymbols = {
  celsius: '°C',
  fahrenheit: '°F',
  kelvin: 'K'
};

const formulas = {
  'celsius-fahrenheit': '°F = (°C × 9/5) + 32',
  'celsius-kelvin': 'K = °C + 273.15',
  'fahrenheit-celsius': '°C = (°F - 32) × 5/9',
  'fahrenheit-kelvin': 'K = (°F - 32) × 5/9 + 273.15',
  'kelvin-celsius': '°C = K - 273.15',
  'kelvin-fahrenheit': '°F = (K - 273.15) × 9/5 + 32',
  'celsius-celsius': 'No conversion needed',
  'fahrenheit-fahrenheit': 'No conversion needed',
  'kelvin-kelvin': 'No conversion needed'
};

function convertTemperature() {
  const temp = parseFloat(tempInput.value);

  if (isNaN(temp)) {
    resultValue.textContent = '--';
    return;
  }

  const from = fromUnit.value;
  const to = toUnit.value;
  let result;

  // Convert to Celsius first as base unit
  let celsius;
  if (from === 'celsius') {
    celsius = temp;
  } else if (from === 'fahrenheit') {
    celsius = (temp - 32) * 5/9;
  } else if (from === 'kelvin') {
    celsius = temp - 273.15;
  }

  // Convert from Celsius to target unit
  if (to === 'celsius') {
    result = celsius;
  } else if (to === 'fahrenheit') {
    result = (celsius * 9/5) + 32;
  } else if (to === 'kelvin') {
    result = celsius + 273.15;
  }

  resultValue.textContent = result.toFixed(2);
  resultUnit.textContent = unitSymbols[to];

  // Update formula display
  const formulaKey = `${from}-${to}`;
  formulaText.textContent = formulas[formulaKey];
}

// Dropdown change event listeners
fromUnit.addEventListener('change', convertTemperature);
toUnit.addEventListener('change', convertTemperature);
tempInput.addEventListener('input', convertTemperature);

// Swap button
swapBtn.addEventListener('click', () => {
  const tempFrom = fromUnit.value;
  fromUnit.value = toUnit.value;
  toUnit.value = tempFrom;
  convertTemperature();
});

// Initial conversion
convertTemperature();