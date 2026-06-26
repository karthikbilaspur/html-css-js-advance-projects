// JavaScript for Code 19
const weightInput = document.getElementById('weight');
const heightInput = document.getElementById('height');
const calcBtn = document.getElementById('calcBtn');
const resultBox = document.getElementById('resultBox');
const bmiValue = document.getElementById('bmiValue');
const bmiCategory = document.getElementById('bmiCategory');

function calculateBMI() {
  const weight = parseFloat(weightInput.value);
  const heightCm = parseFloat(heightInput.value);

  if (!weight || !heightCm || weight <= 0 || heightCm <= 0) {
    alert('Please enter valid weight and height');
    return;
  }

  // Formula: BMI = weight(kg) / (height(m) ^ 2)
  const heightM = heightCm / 100;
  const bmi = weight / (heightM * heightM);
  const roundedBMI = bmi.toFixed(1);

  bmiValue.textContent = roundedBMI;

  // Remove all conditional classes first
  resultBox.classList.remove('underweight', 'normal', 'overweight', 'obese');

  // Conditional logic + CSS
  if (bmi < 18.5) {
    bmiCategory.textContent = 'Underweight';
    resultBox.classList.add('underweight');
  } else if (bmi >= 18.5 && bmi < 25) {
    bmiCategory.textContent = 'Normal weight';
    resultBox.classList.add('normal');
  } else if (bmi >= 25 && bmi < 30) {
    bmiCategory.textContent = 'Overweight';
    resultBox.classList.add('overweight');
  } else {
    bmiCategory.textContent = 'Obese';
    resultBox.classList.add('obese');
  }
}

calcBtn.addEventListener('click', calculateBMI);

// Also calculate on Enter key
[weightInput, heightInput].forEach(input => {
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') calculateBMI();
  });
});