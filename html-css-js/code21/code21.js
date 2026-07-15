// JavaScript for Code 21
const billInput = document.getElementById('billAmount');
const peopleInput = document.getElementById('people');
const customTipInput = document.getElementById('customTip');
const tipButtons = document.querySelectorAll('.tip-btn');
const tipPerPersonEl = document.getElementById('tipPerPerson');
const totalPerPersonEl = document.getElementById('totalPerPerson');
const resetBtn = document.getElementById('resetBtn');

let tipPercent = 15; // Default 15% active

// Format to Indian Rupees
const formatCurrency = (amount) => {
  return `₹${amount.toFixed(2)}`;
};

// Main calculation function
function calculate() {
  const bill = parseFloat(billInput.value) || 0;
  const people = parseInt(peopleInput.value) || 1;
  const tip = tipPercent / 100;

  // Handle invalid people count
  if (people < 1) {
    peopleInput.classList.add('input-error');
    tipPerPersonEl.textContent = '₹0.00';
    totalPerPersonEl.textContent = '₹0.00';
    resetBtn.disabled = true;
    return;
  } else {
    peopleInput.classList.remove('input-error');
  }

  const tipAmount = bill * tip;
  const totalAmount = bill + tipAmount;
  
  const tipPerPerson = tipAmount / people;
  const totalPerPerson = totalAmount / people;

  tipPerPersonEl.textContent = formatCurrency(tipPerPerson);
  totalPerPersonEl.textContent = formatCurrency(totalPerPerson);
  
  // Enable reset if there's any input
  resetBtn.disabled = bill === 0 && !customTipInput.value && people === 1 && tipPercent === 15;
}

// Tip button click handler
tipButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    tipButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    customTipInput.value = '';
    tipPercent = parseFloat(btn.dataset.tip);
    calculate();
  });
});

// Custom tip input handler
customTipInput.addEventListener('input', () => {
  const customVal = parseFloat(customTipInput.value);
  if (customVal >= 0) {
    tipButtons.forEach(b => b.classList.remove('active'));
    tipPercent = customVal || 0;
    calculate();
  }
});

// Input listeners
billInput.addEventListener('input', calculate);
peopleInput.addEventListener('input', calculate);

// Reset button
resetBtn.addEventListener('click', () => {
  billInput.value = '';
  peopleInput.value = '1';
  customTipInput.value = '';
  tipPercent = 15;
  tipButtons.forEach(b => b.classList.remove('active'));
  document.querySelector('[data-tip="15"]').classList.add('active');
  peopleInput.classList.remove('input-error');
  calculate();
});

// Initial calculation on load
calculate();