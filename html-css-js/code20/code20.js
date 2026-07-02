const birthdateInput = document.getElementById("birthdate");
const calcBtn = document.getElementById("calcBtn");
const resetBtn = document.getElementById("resetBtn");
const resultBox = document.getElementById("resultBox");

const yearsEl = document.getElementById("years");
const monthsEl = document.getElementById("months");
const daysEl = document.getElementById("days");

const totalDaysEl = document.getElementById("totalDays");
const totalWeeksEl = document.getElementById("totalWeeks");
const totalMonthsEl = document.getElementById("totalMonths");
const totalHoursEl = document.getElementById("totalHours");
const totalMinutesEl = document.getElementById("totalMinutes");
const nextBirthdayEl = document.getElementById("nextBirthday");

birthdateInput.max = new Date().toISOString().split("T")[0];

calcBtn.addEventListener("click", calculateAge);
resetBtn.addEventListener("click", resetCalculator);

birthdateInput.addEventListener("change", () => {
    if (birthdateInput.value) {
        calculateAge();
    }
});

function resetCalculator() {
    birthdateInput.value = "";
    resultBox.classList.remove("show");
}

function calculateAge() {
    if (!birthdateInput.value) {
        alert("Please select your birth date.");
        return;
    }

    const [year, month, day] = birthdateInput.value.split('-').map(Number);
    const birthDate = new Date(year, month - 1, day);

    if (isNaN(birthDate.getTime())) {
        alert("Invalid date selected.");
        return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (birthDate > today) {
        alert("Birth date cannot be in the future.");
        return;
    }

    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();

    if (days < 0) {
        months--;
        const daysInPrevMonth = new Date(today.getFullYear(), today.getMonth(), 0).getDate();
        days += daysInPrevMonth;
    }

    if (months < 0) {
        years--;
        months += 12;
    }

    const diffTime = today - birthDate;
    const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.floor(totalDays / 7);
    const totalMonths = years * 12 + months;
    const totalHours = totalDays * 24;
    const totalMinutes = totalHours * 60;

    let nextBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());

    if (nextBirthday < today) {
        nextBirthday.setFullYear(today.getFullYear() + 1);
    }

    let daysLeft;
    if (nextBirthday.toDateString() === today.toDateString()) {
        daysLeft = "Today 🎉";
    } else {
        const msLeft = nextBirthday - today;
        daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24)) + " days";
    }

    yearsEl.textContent = years;
    monthsEl.textContent = months;
    daysEl.textContent = days;

    totalDaysEl.textContent = totalDays.toLocaleString();
    totalWeeksEl.textContent = totalWeeks.toLocaleString();
    totalMonthsEl.textContent = totalMonths.toLocaleString();
    totalHoursEl.textContent = totalHours.toLocaleString();
    totalMinutesEl.textContent = totalMinutes.toLocaleString();
    nextBirthdayEl.textContent = daysLeft;

    resultBox.classList.add("show");
}