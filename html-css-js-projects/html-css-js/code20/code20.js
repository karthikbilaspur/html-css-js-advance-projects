// JavaScript for Code 20
const birthdateInput = document.getElementById('birthdate');
const calcBtn = document.getElementById('calcBtn');
const resultBox = document.getElementById('resultBox');
const yearsEl = document.getElementById('years');
const monthsEl = document.getElementById('months');
const daysEl = document.getElementById('days');
const totalDaysEl = document.getElementById('totalDays');

// Set max date to today
birthdateInput.max = new Date().toISOString().split('T')[0];

function calculateAge() {
  const birthdateValue = birthdateInput.value;

  if (!birthdateValue) {
    alert('Please select your date of birth');
    return;
  }

  const birthDate = new Date(birthdateValue);
  const today = new Date();

  if (birthDate > today) {
    alert('Birth date cannot be in the future');
    return;
  }

  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();
  let days = today.getDate() - birthDate.getDate();

  // Adjust for negative days
  if (days < 0) {
    months--;
    // Get days in previous month
    const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    days += lastMonth.getDate();
  }

  // Adjust for negative months
  if (months < 0) {
    years--;
    months += 12;
  }

  // Calculate total days difference
  const timeDiff = today.getTime() - birthDate.getTime();
  const totalDays = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

  // Display results
  yearsEl.textContent = years;
  monthsEl.textContent = months;
  daysEl.textContent = days;
  totalDaysEl.textContent = totalDays.toLocaleString();

  resultBox.classList.add('show');
}

calcBtn.addEventListener('click', calculateAge);

// Calculate on Enter key
birthdateInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') calculateAge();
});