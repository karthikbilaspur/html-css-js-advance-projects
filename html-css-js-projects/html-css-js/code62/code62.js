// JavaScript for Code 62
const hourHand = document.getElementById('hour-hand');
const minuteHand = document.getElementById('minute-hand');
const secondHand = document.getElementById('second-hand');
const timeDisplay = document.getElementById('time-display');
const dateDisplay = document.getElementById('date-display');
const toggleSmoothBtn = document.getElementById('toggle-smooth');
const toggle24hBtn = document.getElementById('toggle-24h');

let smoothSeconds = true;
let is24Hour = false;
let clockInterval;

// Start clock
function startClock() {
    updateClock(); // Initial update
    clockInterval = setInterval(updateClock, smoothSeconds ? 50 : 1000);
}

function updateClock() {
    const now = new Date();
    
    // Get time components
    const milliseconds = now.getMilliseconds();
    const seconds = now.getSeconds() + (smoothSeconds ? milliseconds / 1000 : 0);
    const minutes = now.getMinutes() + seconds / 60;
    const hours = now.getHours() + minutes / 60;

    // Calculate rotations: 360deg / 12h = 30deg per hour
    // 360deg / 60min = 6deg per minute/second
    const hourRotation = (hours % 12) * 30;
    const minuteRotation = minutes * 6;
    const secondRotation = seconds * 6;

    // Apply transforms
    hourHand.style.transform = `rotate(${hourRotation}deg)`;
    minuteHand.style.transform = `rotate(${minuteRotation}deg)`;
    secondHand.style.transform = `rotate(${secondRotation}deg)`;

    // Update digital display
    const displayHours = is24Hour 
        ? String(now.getHours()).padStart(2, '0')
        : String(now.getHours() % 12 || 12).padStart(2, '0');
    
    const displayMinutes = String(now.getMinutes()).padStart(2, '0');
    const displaySeconds = String(now.getSeconds()).padStart(2, '0');
    const ampm = is24Hour ? '' : (now.getHours() >= 12 ? ' PM' : ' AM');
    
    timeDisplay.textContent = `${displayHours}:${displayMinutes}:${displaySeconds}${ampm}`;

    // Update date
    const dateOptions = { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric',
        year: 'numeric'
    };
    dateDisplay.textContent = now.toLocaleDateString('en-US', dateOptions);
}

// Toggle smooth seconds
toggleSmoothBtn.addEventListener('click', () => {
    smoothSeconds = !smoothSeconds;
    toggleSmoothBtn.textContent = `Smooth Seconds: ${smoothSeconds ? 'ON' : 'OFF'}`;
    
    // Toggle transition
    if (smoothSeconds) {
        secondHand.classList.add('smooth');
    } else {
        secondHand.classList.remove('smooth');
    }
    
    // Restart interval with new timing
    clearInterval(clockInterval);
    startClock();
});

// Toggle 24h format
toggle24hBtn.addEventListener('click', () => {
    is24Hour = !is24Hour;
    toggle24hBtn.textContent = `24H Format: ${is24Hour ? 'ON' : 'OFF'}`;
});

// Init
secondHand.classList.add('smooth');
startClock();

// Handle page visibility - pause when tab hidden to save resources
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        clearInterval(clockInterval);
    } else {
        startClock();
    }
});