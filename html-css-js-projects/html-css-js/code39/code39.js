// JavaScript for Code 39
const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const dateInput = document.getElementById('dateInput');
const yearInput = document.getElementById('yearInput');
const monthInput = document.getElementById('monthInput');
const dayInput = document.getElementById('dayInput');
const findBtn = document.getElementById('findBtn');
const resultBox = document.getElementById('resultBox');
const resultDay = document.getElementById('resultDay');
const resultFullDate = document.getElementById('resultFullDate');
const resultDetails = document.getElementById('resultDetails');
const todayDay = document.getElementById('todayDay');
const todayDate = document.getElementById('todayDate');
const daysInput = document.getElementById('daysInput');
const calcFutureBtn = document.getElementById('calcFutureBtn');
const calcPastBtn = document.getElementById('calcPastBtn');
const calcResult = document.getElementById('calcResult');
const factText = document.getElementById('factText');

// Show today's day using new Date() and getDay()
function showToday() {
  const today = new Date();
  const dayIndex = today.getDay(); // 0 = Sunday, 1 = Monday, etc
  const dayName = daysOfWeek[dayIndex];
  const dateStr = `${months[today.getMonth()]} ${today.getDate()}, ${today.getFullYear()}`;

  todayDay.textContent = dayName;
  todayDate.textContent = dateStr;
}

function findDayOfWeek() {
  let date;

  // Priority: date picker > manual inputs
  if (dateInput.value) {
    date = new Date(dateInput.value + 'T00:00:00'); // Avoid timezone issues
  } else if (yearInput.value && monthInput.value && dayInput.value) {
    const year = parseInt(yearInput.value);
    const month = parseInt(monthInput.value) - 1; // JS months are 0-indexed
    const day = parseInt(dayInput.value);
    date = new Date(year, month, day);

    // Validate date
    if (date.getFullYear()!== year || date.getMonth()!== month || date.getDate()!== day) {
      alert('Invalid date! Please check your input.');
      return;
    }
  } else {
    alert('Please select a date or enter year, month, and day');
    return;
  }

  // getDay() returns 0-6 where 0=Sunday
  const dayIndex = date.getDay();
  const dayName = daysOfWeek[dayIndex];
  const fullDate = `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;

  resultDay.textContent = dayName;
  resultFullDate.textContent = fullDate;

  // Calculate days from today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffTime = date - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let detailText = '';
  if (diffDays === 0) detailText = 'This is today!';
  else if (diffDays > 0) detailText = `This is ${diffDays} day${diffDays!== 1? 's' : ''} from today`;
  else detailText = `This was ${Math.abs(diffDays)} day${Math.abs(diffDays)!== 1? 's' : ''} ago`;

  resultDetails.textContent = detailText;
  resultBox.classList.add('show');

  showFact(date);
}

function calculateDays(offset) {
  const days = parseInt(daysInput.value);
  if (isNaN(days) || days < 0) {
    alert('Please enter a valid number of days');
    return;
  }

  const today = new Date();
  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + (days * offset));

  const dayName = daysOfWeek[targetDate.getDay()];
  const fullDate = `${months[targetDate.getMonth()]} ${targetDate.getDate()}, ${targetDate.getFullYear()}`;
  const direction = offset > 0? 'from today' : 'ago';

  calcResult.innerHTML = `<strong>${days} days ${direction}</strong> will be <strong>${dayName}</strong><br>${fullDate}`;
  calcResult.classList.add('show');
}

function showFact(date) {
  const facts = [
    `This date falls in week ${Math.ceil(date.getDate() / 7)} of ${months[date.getMonth()]}`,
    `There are ${new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()} days in this month`,
    `This is day ${Math.ceil((date - new Date(date.getFullYear(), 0, 1)) / 86400000)} of the year`,
    `${date.getFullYear()} ${date.getFullYear() % 4 === 0 && (date.getFullYear() % 100!== 0 || date.getFullYear() % 400 === 0)? 'is' : 'is not'} a leap year`
  ];
  factText.textContent = facts[Math.floor(Math.random() * facts.length)];
}

// Event listeners
findBtn.addEventListener('click', findDayOfWeek);
calcFutureBtn.addEventListener('click', () => calculateDays(1));
calcPastBtn.addEventListener('click', () => calculateDays(-1));

dateInput.addEventListener('change', () => {
  // Clear manual inputs when date picker is used
  yearInput.value = '';
  monthInput.value = '';
  dayInput.value = '';
});

// Enter key support
[yearInput, monthInput, dayInput].forEach(input => {
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') findDayOfWeek();
  });
});

// Init
showToday();
