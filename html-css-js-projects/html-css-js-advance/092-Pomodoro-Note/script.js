const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const PERIODS = ['9:00', '10:00', '11:00', '12:00', '2:00', '3:00', '4:00'];
const CELL_WIDTH = 130;
const CELL_HEIGHT = 70;
const HEADER_HEIGHT = 40;
const DAY_WIDTH = 60;

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const subjectInput = document.getElementById('subjectInput');
const durationInput = document.getElementById('durationInput');
const addClassBtn = document.getElementById('addClassBtn');
const autoBtn = document.getElementById('autoBtn');
const clearBtn = document.getElementById('clearBtn');
const classPool = document.getElementById('classPool');
const pomodoroLength = document.getElementById('pomodoroLength');

const timerDisplay = document.getElementById('timerDisplay');
const timerPhase = document.getElementById('timerPhase');
const currentSubjectEl = document.getElementById('currentSubject');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const sessionCountEl = document.getElementById('sessionCount');
const todayMinutesEl = document.getElementById('todayMinutes');
const todaySessionsEl = document.getElementById('todaySessions');
const totalTimeEl = document.getElementById('totalTime');
const streakEl = document.getElementById('streak');

let timetable = Array(DAYS.length).fill().map(() => Array(PERIODS.length).fill(null));
let classList = [];
let draggedClass = null;
let selectedClass = null;
let hoverCell = null;

// Pomodoro state
let timerRunning = false;
let timerInterval = null;
let timeLeft = 25 * 60;
let isWorkPhase = true;
let currentPomodoroLength = 25;
let sessions = JSON.parse(localStorage.getItem('pomodoro092') || '{}');

const COLORS = ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22'];

function resizeCanvas() {
  canvas.width = DAY_WIDTH + DAYS.length * CELL_WIDTH;
  canvas.height = HEADER_HEIGHT + PERIODS.length * CELL_HEIGHT;
}

class ClassEntry {
  constructor(subject, duration) {
    this.id = Date.now() + Math.random();
    this.subject = subject;
    this.duration = parseInt(duration);
    this.color = COLORS[classList.length % COLORS.length];
    this.sessions = sessions[this.id] || 0;
    this.totalMinutes = sessions[this.id + '_time'] || 0;
  }
}

function addClass() {
  const subject = subjectInput.value.trim();
  if (!subject) return;

  const newClass = new ClassEntry(subject, durationInput.value);
  classList.push(newClass);
  renderClassPool();
  subjectInput.value = '';
  subjectInput.focus();
}

function renderClassPool() {
  classPool.innerHTML = '';
  classList.forEach(cls => {
    const card = document.createElement('div');
    card.className = 'class-card';
    if (selectedClass && selectedClass.id === cls.id) card.classList.add('active');
    card.draggable = true;
    card.style.background = cls.color;
    card.innerHTML = `
      <div style="font-weight:bold">${cls.subject}</div>
      <div style="font-size:0.8rem;opacity:0.9">${cls.duration}h | ${cls.sessions} sessions</div>
    `;
    card.addEventListener('click', () => selectClass(cls));
    card.addEventListener('dragstart', () => {
      draggedClass = cls;
      card.classList.add('dragging');
    });
    card.addEventListener('dragend', () => {
      card.classList.remove('dragging');
    });
    classPool.appendChild(card);
  });
}

function selectClass(cls) {
  selectedClass = cls;
  currentSubjectEl.textContent = cls.subject;
  sessionCountEl.textContent = cls.sessions;
  todayMinutesEl.textContent = cls.totalMinutes;
  renderClassPool();
  resetTimer();
}

function hasConflict(day, period, cls) {
  for (let d = 0; d < cls.duration; d++) {
    if (period + d >= PERIODS.length) return true;
    if (timetable[day][period + d]) return true;
  }
  return false;
}

function autoFillWeek() {
  timetable = Array(DAYS.length).fill().map(() => Array(PERIODS.length).fill(null));
  const shuffled = [...classList].sort(() => Math.random() - 0.5);

  shuffled.forEach(cls => {
    for (let attempts = 0; attempts < 50; attempts++) {
      const d = Math.floor(Math.random() * DAYS.length);
      const p = Math.floor(Math.random() * (PERIODS.length - cls.duration + 1));
      if (!hasConflict(d, p, cls)) {
        for (let i = 0; i < cls.duration; i++) {
          timetable[d][p + i] = cls;
        }
        break;
      }
    }
  });
  draw();
}

// Pomodoro logic - game loop from Asteroids
function startTimer() {
  if (timerRunning ||!selectedClass) return;
  timerRunning = true;
  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();

    if (timeLeft <= 0) {
      timerRunning = false;
      clearInterval(timerInterval);

      if (isWorkPhase) {
        selectedClass.sessions++;
        selectedClass.totalMinutes += currentPomodoroLength;
        sessions[selectedClass.id] = selectedClass.sessions;
        sessions[selectedClass.id + '_time'] = selectedClass.totalMinutes;
        localStorage.setItem('pomodoro092', JSON.stringify(sessions));

        updateStats();
        renderClassPool();

        isWorkPhase = false;
        timeLeft = 5 * 60;
        timerPhase.textContent = 'Break Time!';
        timerDisplay.style.color = '#27ae60';
        alert('Pomodoro complete! Take a 5 min break.');
      } else {
        isWorkPhase = true;
        timeLeft = currentPomodoroLength * 60;
        timerPhase.textContent = 'Ready to Focus';
        timerDisplay.style.color = '#e74c3c';
      }
      updateTimerDisplay();
    }
  }, 1000);
}

function pauseTimer() {
  timerRunning = false;
  clearInterval(timerInterval);
}

function resetTimer() {
  pauseTimer();
  isWorkPhase = true;
  currentPomodoroLength = parseInt(pomodoroLength.value);
  timeLeft = currentPomodoroLength * 60;
  timerPhase.textContent = 'Ready to Focus';
  timerDisplay.style.color = '#e74c3c';
  updateTimerDisplay();
}

function updateTimerDisplay() {
  const mins = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const secs = (timeLeft % 60).toString().padStart(2, '0');
  timerDisplay.textContent = `${mins}:${secs}`;
}

function updateStats() {
  let totalSessions = 0;
  let totalMinutes = 0;
  classList.forEach(cls => {
    totalSessions += cls.sessions;
    totalMinutes += cls.totalMinutes;
  });
  todaySessionsEl.textContent = totalSessions;
  totalTimeEl.textContent = totalMinutes;

  const today = new Date().toDateString();
  const lastDate = localStorage.getItem('lastStudyDate');
  let streak = parseInt(localStorage.getItem('streak') || '0');

  if (lastDate!== today && totalSessions > 0) {
    streak++;
    localStorage.setItem('streak', streak);
    localStorage.setItem('lastStudyDate', today);
  }
  streakEl.textContent = streak;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Headers
  ctx.fillStyle = '#34495e';
  ctx.fillRect(0, 0, canvas.width, HEADER_HEIGHT);
  ctx.fillRect(0, 0, DAY_WIDTH, canvas.height);

  ctx.fillStyle = 'white';
  ctx.font = 'bold 14px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  DAYS.forEach((day, i) => {
    ctx.fillText(day, DAY_WIDTH + i * CELL_WIDTH + CELL_WIDTH / 2, HEADER_HEIGHT / 2);
  });

  PERIODS.forEach((period, i) => {
    ctx.fillText(period, DAY_WIDTH / 2, HEADER_HEIGHT + i * CELL_HEIGHT + CELL_HEIGHT / 2);
  });

  // Grid
  for (let d = 0; d < DAYS.length; d++) {
    for (let p = 0; p < PERIODS.length; p++) {
      const x = DAY_WIDTH + d * CELL_WIDTH;
      const y = HEADER_HEIGHT + p * CELL_HEIGHT;
      const cls = timetable[d][p];

      ctx.fillStyle = cls? cls.color : '#ecf0f1';
      if (hoverCell && hoverCell.day === d && hoverCell.period === p) {
        ctx.globalAlpha = 0.7;
      }
      ctx.fillRect(x, y, CELL_WIDTH, CELL_HEIGHT);
      ctx.globalAlpha = 1;

      ctx.strokeStyle = '#bdc3c7';
      ctx.strokeRect(x, y, CELL_WIDTH, CELL_HEIGHT);

      if (cls && (p === 0 || timetable[d][p - 1]!== cls)) {
        ctx.fillStyle = 'white';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(cls.subject, x + CELL_WIDTH / 2, y + 20);

        ctx.font = '10px Arial';
        ctx.fillText(`${cls.sessions} sessions`, x + CELL_WIDTH / 2, y + 40);
      }
    }
  }
}

// Drag-drop
canvas.addEventListener('dragover', (e) => {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const day = Math.floor((x - DAY_WIDTH) / CELL_WIDTH);
  const period = Math.floor((y - HEADER_HEIGHT) / CELL_HEIGHT);

  if (day >= 0 && day < DAYS.length && period >= 0 && period < PERIODS.length) {
    hoverCell = { day, period };
  } else {
    hoverCell = null;
  }
  draw();
});

canvas.addEventListener('drop', (e) => {
  e.preventDefault();
  if (!draggedClass ||!hoverCell) return;

  const { day, period } = hoverCell;
  if (!hasConflict(day, period, draggedClass)) {
    for (let i = 0; i < draggedClass.duration; i++) {
      if (period + i < PERIODS.length) {
        timetable[day][period + i] = draggedClass;
      }
    }
  }

  draggedClass = null;
  hoverCell = null;
  draw();
});

canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const day = Math.floor((x - DAY_WIDTH) / CELL_WIDTH);
  const period = Math.floor((y - HEADER_HEIGHT) / CELL_HEIGHT);

  if (day >= 0 && day < DAYS.length && period >= 0 && period < PERIODS.length) {
    const cls = timetable[day][period];
    if (cls) {
      selectClass(cls);
    }
  }
});

addClassBtn.addEventListener('click', addClass);
autoBtn.addEventListener('click', autoFillWeek);
clearBtn.addEventListener('click', () => {
  timetable = Array(DAYS.length).fill().map(() => Array(PERIODS.length).fill(null));
  classList = [];
  renderClassPool();
  draw();
});

startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);
pomodoroLength.addEventListener('change', resetTimer);

subjectInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') addClass();
});

resizeCanvas();
window.addEventListener('resize', () => { resizeCanvas(); draw(); });
updateStats();
resetTimer();
draw();