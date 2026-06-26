// JavaScript for Code 26
const currentTimeEl = document.getElementById('currentTime');
const currentDateEl = document.getElementById('currentDate');
const alarmHour = document.getElementById('alarmHour');
const alarmMinute = document.getElementById('alarmMinute');
const ampm = document.getElementById('ampm');
const alarmSound = document.getElementById('alarmSound');
const setAlarmBtn = document.getElementById('setAlarmBtn');
const alarmList = document.getElementById('alarmList');
const alarmAlert = document.getElementById('alarmAlert');
const alertTime = document.getElementById('alertTime');
const snoozeBtn = document.getElementById('snoozeBtn');
const stopBtn = document.getElementById('stopBtn');

let alarms = [];
let audio = null;
let alarmInterval = null;
let currentAlarmId = null;

// Audio object for different sounds
const sounds = {
  beep: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT',
  digital: 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=',
  chime: 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA='
};

// Update current time display
function updateClock() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  currentTimeEl.textContent = `${hours}:${minutes}:${seconds}`;

  const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
  currentDateEl.textContent = now.toLocaleDateString('en-US', options);

  // Time check: compare current time with alarms
  checkAlarms(now);
}

// Time check function
function checkAlarms(now) {
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentSecond = now.getSeconds();

  alarms.forEach(alarm => {
    if (alarm.active && 
        alarm.hour === currentHour && 
        alarm.minute === currentMinute && 
        currentSecond === 0) {
      triggerAlarm(alarm);
    }
  });
}

function triggerAlarm(alarm) {
  currentAlarmId = alarm.id;
  alertTime.textContent = `${String(alarm.hour % 12 || 12).padStart(2, '0')}:${String(alarm.minute).padStart(2, '0')} ${alarm.hour >= 12 ? 'PM' : 'AM'}`;
  alarmAlert.classList.add('show');
  
  // Audio object: play alarm sound
  audio = new Audio(sounds[alarm.sound] || sounds.beep);
  audio.loop = true;
  audio.play().catch(e => console.log('Audio play failed:', e));
  
  // Mark alarm as triggered
  alarm.active = false;
  renderAlarms();
}

function setAlarm() {
  let hour = parseInt(alarmHour.value);
  const minute = parseInt(alarmMinute.value);
  const period = ampm.value;

  // Convert to 24-hour format
  if (period === 'PM' && hour !== 12) hour += 12;
  if (period === 'AM' && hour === 12) hour = 0;

  const alarm = {
    id: Date.now(),
    hour: hour,
    minute: minute,
    period: period,
    sound: alarmSound.value,
    active: true
  };

  alarms.push(alarm);
  renderAlarms();
  
  // Reset inputs
  alarmHour.value = 7;
  alarmMinute.value = 30;
  ampm.value = 'AM';
}

function renderAlarms() {
  alarmList.innerHTML = '';
  alarms.filter(a => a.active).forEach(alarm => {
    const displayHour = alarm.hour % 12 || 12;
    const alarmEl = document.createElement('div');
    alarmEl.className = 'alarm-item active';
    alarmEl.innerHTML = `
      <span class="alarm-time">${String(displayHour).padStart(2, '0')}:${String(alarm.minute).padStart(2, '0')} ${alarm.period}</span>
      <button class="delete-btn" onclick="deleteAlarm(${alarm.id})">Delete</button>
    `;
    alarmList.appendChild(alarmEl);
  });
}

function deleteAlarm(id) {
  alarms = alarms.filter(a => a.id !== id);
  renderAlarms();
}

function snoozeAlarm() {
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }
  alarmAlert.classList.remove('show');
  
  // Add 5 minutes to current alarm
  const now = new Date();
  now.setMinutes(now.getMinutes() + 5);
  const snoozeAlarm = {
    id: Date.now(),
    hour: now.getHours(),
    minute: now.getMinutes(),
    period: now.getHours() >= 12 ? 'PM' : 'AM',
    sound: 'beep',
    active: true
  };
  alarms.push(snoozeAlarm);
  renderAlarms();
}

function stopAlarm() {
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }
  alarmAlert.classList.remove('show');
  alarms = alarms.filter(a => a.id !== currentAlarmId);
  renderAlarms();
}

// Event listeners
setAlarmBtn.addEventListener('click', setAlarm);
snoozeBtn.addEventListener('click', snoozeAlarm);
stopBtn.addEventListener('click', stopAlarm);

// Update clock every second
setInterval(updateClock, 1000);
updateClock();

// Request notification permission
if ('Notification' in window && Notification.permission === 'default') {
  Notification.requestPermission();
}