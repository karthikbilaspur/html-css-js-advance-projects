const timerForm = document.getElementById('timerForm');
const timersGrid = document.getElementById('timersGrid');
const emptyState = document.getElementById('emptyState');
const confettiCanvas = document.getElementById('confettiCanvas');
const themeBtns = document.querySelectorAll('.theme-btn');

let timers = JSON.parse(localStorage.getItem('countdownTimers')) || [];
let confettiParticles = [];
let animationFrame;

// Canvas setup
const ctx = confettiCanvas.getContext('2d');
confettiCanvas.width = window.innerWidth;
confettiCanvas.height = window.innerHeight;

// Init
loadTheme();
renderTimers();
setInterval(updateAllTimers, 1000);

// Theme switcher
themeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const theme = btn.dataset.theme;
        document.body.className = theme === 'dark'? '' : theme;
        themeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        localStorage.setItem('theme', theme);
    });
});

function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.body.className = savedTheme === 'dark'? '' : savedTheme;
    themeBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === savedTheme);
    });
}

// Form submit
timerForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const title = document.getElementById('timerTitle').value.trim();
    const date = document.getElementById('timerDate').value;
    const time = document.getElementById('timerTime').value;

    const targetDate = new Date(`${date}T${time}`);

    if (targetDate <= new Date()) {
        alert('Please select a future date and time');
        return;
    }

    const timer = {
        id: Date.now(),
        title: title,
        targetDate: targetDate.getTime(),
        createdAt: Date.now()
    };

    timers.push(timer);
    saveTimers();
    renderTimers();
    timerForm.reset();
});

// Set min date to today
document.getElementById('timerDate').min = new Date().toISOString().split('T')[0];

function saveTimers() {
    localStorage.setItem('countdownTimers', JSON.stringify(timers));
}

function deleteTimer(id) {
    timers = timers.filter(t => t.id!== id);
    saveTimers();
    renderTimers();
}

function renderTimers() {
    if (timers.length === 0) {
        emptyState.classList.add('show');
        timersGrid.innerHTML = '';
        timersGrid.appendChild(emptyState);
        return;
    }

    emptyState.classList.remove('show');
    timersGrid.innerHTML = timers.map(timer => createTimerHTML(timer)).join('');
}

function createTimerHTML(timer) {
    const timeLeft = getTimeLeft(timer.targetDate);
    const isCompleted = timeLeft.total <= 0;

    if (isCompleted) {
        return `
            <div class="timer-card completed" data-id="${timer.id}">
                <div class="timer-header">
                    <div class="timer-title">${escapeHtml(timer.title)}</div>
                    <button class="timer-delete" onclick="deleteTimer(${timer.id})">×</button>
                </div>
                <div class="timer-completed">
                    <div class="timer-completed-icon">🎉</div>
                    <div class="timer-completed-text">Time's Up!</div>
                </div>
                <div class="timer-footer">
                    Completed ${formatDate(timer.targetDate)}
                </div>
            </div>
        `;
    }

    return `
        <div class="timer-card" data-id="${timer.id}">
            <div class="timer-header">
                <div class="timer-title">${escapeHtml(timer.title)}</div>
                <button class="timer-delete" onclick="deleteTimer(${timer.id})">×</button>
            </div>
            <div class="timer-display">
                <div class="time-unit">
                    <div class="time-value" id="days-${timer.id}">${timeLeft.days}</div>
                    <div class="time-label">Days</div>
                </div>
                <div class="time-unit">
                    <div class="time-value" id="hours-${timer.id}">${timeLeft.hours}</div>
                    <div class="time-label">Hours</div>
                </div>
                <div class="time-unit">
                    <div class="time-value" id="minutes-${timer.id}">${timeLeft.minutes}</div>
                    <div class="time-label">Minutes</div>
                </div>
                <div class="time-unit">
                    <div class="time-value" id="seconds-${timer.id}">${timeLeft.seconds}</div>
                    <div class="time-label">Seconds</div>
                </div>
            </div>
            <div class="timer-footer">
                ${formatDate(timer.targetDate)}
            </div>
        </div>
    `;
}

function updateAllTimers() {
    timers.forEach(timer => {
        const timeLeft = getTimeLeft(timer.targetDate);

        if (timeLeft.total <= 0 &&!timer.completed) {
            timer.completed = true;
            triggerConfetti();
            renderTimers();
            return;
        }

        const daysEl = document.getElementById(`days-${timer.id}`);
        const hoursEl = document.getElementById(`hours-${timer.id}`);
        const minutesEl = document.getElementById(`minutes-${timer.id}`);
        const secondsEl = document.getElementById(`seconds-${timer.id}`);

        if (daysEl) daysEl.textContent = timeLeft.days;
        if (hoursEl) hoursEl.textContent = timeLeft.hours;
        if (minutesEl) minutesEl.textContent = timeLeft.minutes;
        if (secondsEl) secondsEl.textContent = timeLeft.seconds;
    });
}

function getTimeLeft(target) {
    const total = target - Date.now();
    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const days = Math.floor(total / (1000 * 60 * 60 * 24));

    return {
        total: Math.max(0, total),
        days: Math.max(0, days),
        hours: String(Math.max(0, hours)).padStart(2, '0'),
        minutes: String(Math.max(0, minutes)).padStart(2, '0'),
        seconds: String(Math.max(0, seconds)).padStart(2, '0')
    };
}

function formatDate(timestamp) {
    return new Date(timestamp).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Confetti Animation
function triggerConfetti() {
    confettiParticles = [];
    const colors = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

    for (let i = 0; i < 150; i++) {
        confettiParticles.push({
            x: Math.random() * confettiCanvas.width,
            y: Math.random() * confettiCanvas.height - confettiCanvas.height,
            w: Math.random() * 10 + 5,
            h: Math.random() * 10 + 5,
            vx: Math.random() * 6 - 3,
            vy: Math.random() * 3 + 2,
            color: colors[Math.floor(Math.random() * colors.length)],
            angle: Math.random() * 360,
            spin: Math.random() * 10 - 5
        });
    }

    animateConfetti();
}

function animateConfetti() {
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

    confettiParticles.forEach((p, index) => {
        p.x += p.vx;
        p.y += p.vy;
        p.angle += p.spin;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle * Math.PI / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();

        if (p.y > confettiCanvas.height) {
            confettiParticles.splice(index, 1);
        }
    });

    if (confettiParticles.length > 0) {
        animationFrame = requestAnimationFrame(animateConfetti);
    }
}

// Resize canvas
window.addEventListener('resize', () => {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
});

// Make deleteTimer global
window.deleteTimer = deleteTimer;