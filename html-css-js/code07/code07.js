// JavaScript for Code 7
function updateClock() {
    const now = new Date();
    
    // Get hours, minutes, and seconds
    // padStart(2, '0') ensures the string is 2 chars long, filling with '0' if needed
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    const timeString = `${hours}:${minutes}:${seconds}`;
    
    document.getElementById('clock').textContent = timeString;
}

// Update the clock every 1000 milliseconds (1 second)
setInterval(updateClock, 1000);

// Initialize immediately so there is no 1-second delay on load
updateClock();