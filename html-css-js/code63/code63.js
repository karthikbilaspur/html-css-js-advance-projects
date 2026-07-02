// JavaScript for Code 63
const canvas = document.getElementById('analog-canvas');
const ctx = canvas.getContext('2d');
const digitalTime = document.getElementById('digital-time');
const digitalDate = document.getElementById('digital-date');
const ampmEl = document.getElementById('ampm');
const timezoneSelect = document.getElementById('timezone-select');
const toggle24hBtn = document.getElementById('toggle-24h');
const toggleSecondsBtn = document.getElementById('toggle-seconds');

let is24Hour = false;
let showSeconds = true;
let timezone = 'local';

// Clock center and radius
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;
const radius = 120;

// Controls
toggle24hBtn.addEventListener('click', () => {
    is24Hour =!is24Hour;
    toggle24hBtn.textContent = is24Hour ? 'Switch to 12h' : 'Switch to 24h';
    updateClocks();
});

toggleSecondsBtn.addEventListener('click', () => {
    showSeconds =!showSeconds;
    toggleSecondsBtn.textContent = showSeconds ? 'Hide Seconds' : 'Show Seconds';
    updateClocks();
});

timezoneSelect.addEventListener('change', (e) => {
    timezone = e.target.value;
    updateClocks();
});

function getTime() {
    const now = new Date();

    if (timezone === 'local') {
        return now;
    }

    // Convert to timezone
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const options = { timeZone: timezone === 'UTC' ? 'UTC' : timezone };
    return new Date(utc + (new Date().toLocaleString('en-US', options).getTime() || 0));
}

function updateClocks() {
    const now = getTime();
    drawAnalogClock(now);
    updateDigitalClock(now);
}

function drawAnalogClock(now) {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw outer circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 10, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw hour markers
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    for (let i = 0; i < 12; i++) {
        const angle = (i * Math.PI) / 6;
        const x1 = centerX + Math.cos(angle - Math.PI/2) * (radius - 10);
        const y1 = centerY + Math.sin(angle - Math.PI/2) * (radius - 10);
        const x2 = centerX + Math.cos(angle - Math.PI/2) * radius;
        const y2 = centerY + Math.sin(angle - Math.PI/2) * radius;
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }

    // Draw minute markers
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    for (let i = 0; i < 60; i++) {
        if (i % 5!== 0) {
            const angle = (i * Math.PI) / 30;
            const x1 = centerX + Math.cos(angle - Math.PI/2) * (radius - 5);
            const y1 = centerY + Math.sin(angle - Math.PI/2) * (radius - 5);
            const x2 = centerX + Math.cos(angle - Math.PI/2) * radius;
            const y2 = centerY + Math.sin(angle - Math.PI/2) * radius;
            
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }
    }

    const hours = now.getHours() % 12;
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    // Hour hand
    const hourAngle = ((hours + minutes / 60) * Math.PI) / 6 - Math.PI/2;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(
        centerX + Math.cos(hourAngle) * (radius * 0.5),
        centerY + Math.sin(hourAngle) * (radius * 0.5)
    );
    ctx.strokeStyle = 'rgba(255, 255, 255, 1)';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Minute hand
    const minuteAngle = ((minutes + seconds / 60) * Math.PI) / 30 - Math.PI/2;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(
        centerX + Math.cos(minuteAngle) * (radius * 0.75),
        centerY + Math.sin(minuteAngle) * (radius * 0.75)
    );
    ctx.strokeStyle = 'rgba(255, 255, 255, 1)';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Second hand
    if (showSeconds) {
        const secondAngle = (seconds * Math.PI) / 30 - Math.PI/2;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(
            centerX + Math.cos(secondAngle) * (radius * 0.85),
            centerY + Math.sin(secondAngle) * (radius * 0.85)
        );
        ctx.strokeStyle = '#ff3b30';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    // Center dot
    ctx.beginPath();
    ctx.arc(centerX, centerY, 8, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(255, 255, 255, 1)';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(centerX, centerY, 4, 0, 2 * Math.PI);
    ctx.fillStyle = '#ff3b30';
    ctx.fill();
}

function updateDigitalClock(now) {
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    let ampm = '';
    if (!is24Hour) {
        ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        ampmEl.textContent = ampm;
        ampmEl.style.display = 'block';
    } else {
        ampmEl.style.display = 'none';
    }

    const hoursStr = String(hours).padStart(2, '0');
    const timeStr = showSeconds 
        ? `${hoursStr}:${minutes}:${seconds}`
        : `${hoursStr}:${minutes}`;

    digitalTime.textContent = timeStr;

    const dateStr = now.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
    });
    digitalDate.textContent = dateStr;
}

// Update every second
setInterval(updateClocks, 1000);
updateClocks(); // Initial call