// JavaScript for Code 23
const loanAmount = document.getElementById('loanAmount');
const interestRate = document.getElementById('interestRate');
const loanTenure = document.getElementById('loanTenure');

const loanAmountValue = document.getElementById('loanAmountValue');
const interestRateValue = document.getElementById('interestRateValue');
const loanTenureValue = document.getElementById('loanTenureValue');

const emiAmount = document.getElementById('emiAmount');
const totalInterest = document.getElementById('totalInterest');
const totalAmount = document.getElementById('totalAmount');

function formatNumber(num) {
  return Math.round(num).toLocaleString('en-IN');
}

function calculateEMI() {
  const P = parseFloat(loanAmount.value);
  const annualRate = parseFloat(interestRate.value);
  const years = parseFloat(loanTenure.value);

  // Update display values
  loanAmountValue.textContent = formatNumber(P);
  interestRateValue.textContent = annualRate.toFixed(1);
  loanTenureValue.textContent = years;

  // EMI Formula: EMI = P × r × (1 + r)^n / ((1 + r)^n - 1)
  // Where P = Principal, r = monthly rate, n = months
  const r = annualRate / 12 / 100; // monthly interest rate
  const n = years * 12; // tenure in months

  // Math.pow calculates (1 + r)^n
  const powerTerm = Math.pow(1 + r, n);
  const emi = (P * r * powerTerm) / (powerTerm - 1);

  const total = emi * n;
  const interest = total - P;

  // Display results
  emiAmount.textContent = formatNumber(emi);
  totalInterest.textContent = formatNumber(interest);
  totalAmount.textContent = formatNumber(total);
}

// Calculate on input change for all ranges
[loanAmount, interestRate, loanTenure].forEach(input => {
  input.addEventListener('input', calculateEMI);
});

// Initial calculation
calculateEMI();