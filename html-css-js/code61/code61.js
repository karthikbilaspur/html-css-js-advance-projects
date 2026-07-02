// JavaScript for Code 61
const monthYearEl = document.getElementById('month-year');
const calendarGrid = document.getElementById('calendar-grid');
const prevBtn = document.getElementById('prev-month');
const nextBtn = document.getElementById('next-month');
const modal = document.getElementById('event-modal');
const modalDate = document.getElementById('modal-date');
const eventTitle = document.getElementById('event-title');
const eventTime = document.getElementById('event-time');
const eventColor = document.getElementById('event-color');
const saveEventBtn = document.getElementById('save-event');
const eventsList = document.getElementById('events-list');
const closeModal = document.querySelector('.close');

const STORAGE_KEY = 'calendar_events_61';
let currentDate = new Date();
let events = {};
let selectedDate = null;

// Load events from localStorage
window.addEventListener('DOMContentLoaded', () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) events = JSON.parse(saved);
    renderCalendar();
});

prevBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});

nextBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    monthYearEl.textContent = currentDate.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
    });

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    calendarGrid.innerHTML = '';

    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i;
        const dayEl = createDayElement(day, true, year, month - 1);
        calendarGrid.appendChild(dayEl);
    }

    // Current month days
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
        const isToday = year === today.getFullYear() &&
                       month === today.getMonth() &&
                       day === today.getDate();
        const dayEl = createDayElement(day, false, year, month, isToday);
        calendarGrid.appendChild(dayEl);
    }

    // Next month days
    const totalCells = calendarGrid.children.length;
    const remaining = 42 - totalCells; // 6 rows * 7 days
    for (let day = 1; day <= remaining; day++) {
        const dayEl = createDayElement(day, true, year, month + 1);
        calendarGrid.appendChild(dayEl);
    }
}

function createDayElement(day, isOtherMonth, year, month, isToday = false) {
    const div = document.createElement('div');
    div.className = 'day';
    if (isOtherMonth) div.classList.add('other-month');
    if (isToday) div.classList.add('today');

    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    div.dataset.date = dateKey;

    const dayNumber = document.createElement('div');
    dayNumber.className = 'day-number';
    dayNumber.textContent = day;
    div.appendChild(dayNumber);

    // Show event dots
    if (events[dateKey] && events[dateKey].length > 0) {
        const dots = document.createElement('div');
        dots.className = 'event-dots';
        events[dateKey].slice(0, 3).forEach(event => {
            const dot = document.createElement('div');
            dot.className = 'event-dot';
            dot.style.background = event.color;
            dots.appendChild(dot);
        });
        div.appendChild(dots);
    }

    div.addEventListener('click', () => openModal(dateKey, year, month, day));
    return div;
}

function openModal(dateKey, year, month, day) {
    selectedDate = dateKey;
    const dateObj = new Date(year, month, day);
    modalDate.textContent = dateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });

    eventTitle.value = '';
    eventTime.value = '';
    eventColor.value = '#007aff';

    renderEventsList();
    modal.style.display = 'block';
}

function renderEventsList() {
    const dayEvents = events[selectedDate] || [];

    if (dayEvents.length === 0) {
        eventsList.innerHTML = '<div class="empty-events">No events yet</div>';
        return;
    }

    eventsList.innerHTML = dayEvents
       .sort((a, b) => a.time.localeCompare(b.time))
       .map(event => `
            <div class="event-item">
                <div class="event-color" style="background: ${event.color}"></div>
                <div class="event-details">
                    <div class="event-time">${event.time || 'All day'}</div>
                    <div class="event-title">${escapeHtml(event.title)}</div>
                </div>
                <button class="delete-event" data-id="${event.id}">&times;</button>
            </div>
        `).join('');
}

saveEventBtn.addEventListener('click', () => {
    const title = eventTitle.value.trim();
    if (!title) {
        alert('Please enter event title');
        return;
    }

    if (!events[selectedDate]) events[selectedDate] = [];

    events[selectedDate].push({
        id: Date.now(),
        title: title,
        time: eventTime.value || '00:00',
        color: eventColor.value
    });

    saveEvents();
    renderEventsList();
    renderCalendar();

    eventTitle.value = '';
    eventTime.value = '';
});

eventsList.addEventListener('click', (e) => {
    if (e.target.classList.contains('delete-event')) {
        const id = parseInt(e.target.dataset.id);
        events[selectedDate] = events[selectedDate].filter(ev => ev.id!== id);
        if (events[selectedDate].length === 0) delete events[selectedDate];
        saveEvents();
        renderEventsList();
        renderCalendar();
    }
});

closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
});

function saveEvents() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}