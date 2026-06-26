const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const PERIODS = ['9:00', '10:00', '11:00', '12:00', '2:00', '3:00', '4:00'];
const CELL_WIDTH = 120;
const CELL_HEIGHT = 60;
const HEADER_HEIGHT = 40;
const DAY_WIDTH = 60;

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const subjectInput = document.getElementById('subjectInput');
const teacherInput = document.getElementById('teacherInput');
const roomInput = document.getElementById('roomInput');
const durationInput = document.getElementById('durationInput');
const addClassBtn = document.getElementById('addClassBtn');
const autoBtn = document.getElementById('autoBtn');
const clearBtn = document.getElementById('clearBtn');
const exportBtn = document.getElementById('exportBtn');
const saveBtn = document.getElementById('saveBtn');
const classPool = document.getElementById('classPool');

const classCountEl = document.getElementById('classCount');
const conflictCountEl = document.getElementById('conflictCount');
const statusEl = document.getElementById('status');

// 2D array from 2048 - timetable grid [day][period]
let timetable = Array(DAYS.length).fill().map(() => Array(PERIODS.length).fill(null));
let classList = [];
let draggedClass = null;
let draggedFromPool = false;
let hoverCell = null;

const COLORS = ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22', '#34495e'];

function resizeCanvas() {
  canvas.width = DAY_WIDTH + DAYS.length * CELL_WIDTH;
  canvas.height = HEADER_HEIGHT + PERIODS.length * CELL_HEIGHT;
}

class ClassEntry {
  constructor(subject, teacher, room, duration) {
    this.id = Date.now() + Math.random();
    this.subject = subject;
    this.teacher = teacher;
    this.room = room;
    this.duration = parseInt(duration);
    this.color = COLORS[classList.length % COLORS.length];
  }
}

function addClass() {
  const subject = subjectInput.value.trim();
  const teacher = teacherInput.value.trim();
  const room = roomInput.value.trim();
  const duration = durationInput.value;

  if (!subject ||!teacher ||!room) {
    alert('Fill all fields');
    return;
  }

  const newClass = new ClassEntry(subject, teacher, room, duration);
  classList.push(newClass);
  renderClassPool();
  updateStats();

  subjectInput.value = '';
  teacherInput.value = '';
  roomInput.value = '';
  subjectInput.focus();
}

function renderClassPool() {
  classPool.innerHTML = '';
  classList.forEach(cls => {
    const card = document.createElement('div');
    card.className = 'class-card';
    card.draggable = true;
    card.style.background = cls.color;
    card.innerHTML = `
      <div class="subject">${cls.subject}</div>
      <div class="details">${cls.teacher} | ${cls.room} | ${cls.duration}h</div>
    `;
    card.addEventListener('dragstart', (e) => {
      draggedClass = cls;
      draggedFromPool = true;
      card.classList.add('dragging');
    });
    card.addEventListener('dragend', () => {
      card.classList.remove('dragging');
    });
    classPool.appendChild(card);
  });
}

// CONCEPT: Check for conflicts - same teacher or room at same time
function hasConflict(day, period, cls) {
  for (let d = 0; d < cls.duration; d++) {
    const p = period + d;
    if (p >= PERIODS.length) return true;

    const existing = timetable[day][p];
    if (existing) {
      if (existing.teacher === cls.teacher) return true;
      if (existing.room === cls.room) return true;
    }
  }
  return false;
}

function countConflicts() {
  let conflicts = 0;
  for (let d = 0; d < DAYS.length; d++) {
    for (let p = 0; p < PERIODS.length; p++) {
      if (timetable[d][p] && hasConflict(d, p, timetable[d][p])) {
        conflicts++;
      }
    }
  }
  return conflicts;
}

// CONCEPT: Backtracking from Sudoku - auto-arrange classes
function autoGenerate() {
  statusEl.textContent = 'Generating...';
  timetable = Array(DAYS.length).fill().map(() => Array(PERIODS.length).fill(null));

  const shuffled = [...classList].sort(() => Math.random() - 0.5);

  function backtrack(index) {
    if (index >= shuffled.length) return true;

    const cls = shuffled[index];

    for (let d = 0; d < DAYS.length; d++) {
      for (let p = 0; p <= PERIODS.length - cls.duration; p++) {
        if (!hasConflict(d, p, cls)) {
          // Place class
          for (let i = 0; i < cls.duration; i++) {
            timetable[d][p + i] = cls;
          }

          if (backtrack(index + 1)) return true;

          // Backtrack
          for (let i = 0; i < cls.duration; i++) {
            timetable[d][p + i] = null;
          }
        }
      }
    }
    return false;
  }

  const success = backtrack(0);
  statusEl.textContent = success? 'Generated!' : 'Partial';
  updateStats();
  draw();
}

function clearTimetable() {
  timetable = Array(DAYS.length).fill().map(() => Array(PERIODS.length).fill(null));
  classList = [];
  renderClassPool();
  updateStats();
  draw();
}

function updateStats() {
  classCountEl.textContent = classList.length;
  conflictCountEl.textContent = countConflicts();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw headers
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

  // Draw grid and classes
  for (let d = 0; d < DAYS.length; d++) {
    for (let p = 0; p < PERIODS.length; p++) {
      const x = DAY_WIDTH + d * CELL_WIDTH;
      const y = HEADER_HEIGHT + p * CELL_HEIGHT;

      const cls = timetable[d][p];
      const isConflict = cls && hasConflict(d, p, cls);
      const isHover = hoverCell && hoverCell.day === d && hoverCell.period === p;

      // Cell background
      ctx.fillStyle = cls? (isConflict? '#e74c3c' : cls.color) : '#ecf0f1';
      ctx.globalAlpha = isHover? 0.7 : 1;
      ctx.fillRect(x, y, CELL_WIDTH, CELL_HEIGHT);
      ctx.globalAlpha = 1;

      // Border
      ctx.strokeStyle = '#bdc3c7';
      ctx.strokeRect(x, y, CELL_WIDTH, CELL_HEIGHT);

      // Draw class info
      if (cls && (p === 0 || timetable[d][p - 1]!== cls)) {
        ctx.fillStyle = 'white';
        ctx.font = 'bold 11px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(cls.subject, x + CELL_WIDTH / 2, y + 15);
        ctx.font = '9px Arial';
        ctx.fillText(cls.teacher, x + CELL_WIDTH / 2, y + 30);
        ctx.fillText(cls.room, x + CELL_WIDTH / 2, y + 42);
      }
    }
  }
}

// Drag-drop from Checkers
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
  updateStats();
  draw();
});

canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const day = Math.floor((x - DAY_WIDTH) / CELL_WIDTH);
  const period = Math.floor((y - HEADER_HEIGHT) / CELL_HEIGHT);

  if (day >= 0 && day < DAYS.length && period >= 0 && period < PERIODS.length) {
    if (timetable[day][period]) {
      // Remove class
      const cls = timetable[day][period];
      for (let d = 0; d < DAYS.length; d++) {
        for (let p = 0; p < PERIODS.length; p++) {
          if (timetable[d][p] === cls) timetable[d][p] = null;
        }
      }
      updateStats();
      draw();
    }
  }
});

addClassBtn.addEventListener('click', addClass);
autoBtn.addEventListener('click', autoGenerate);
clearBtn.addEventListener('click', clearTimetable);

exportBtn.addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = 'timetable-091.png';
  link.href = canvas.toDataURL();
  link.click();
});

saveBtn.addEventListener('click', () => {
  const data = {
    classes: classList,
    timetable: timetable.map(row => row.map(cell => cell? cell.id : null))
  };
  localStorage.setItem('timetable091', JSON.stringify(data));
  statusEl.textContent = 'Saved!';
  setTimeout(() => statusEl.textContent = 'Ready', 2000);
});

// Load saved data
const saved = localStorage.getItem('timetable091');
if (saved) {
  const data = JSON.parse(saved);
  classList = data.classes.map(c => Object.assign(new ClassEntry(), c));
  renderClassPool();
  updateStats();
}

resizeCanvas();
window.addEventListener('resize', () => { resizeCanvas(); draw(); });
draw();