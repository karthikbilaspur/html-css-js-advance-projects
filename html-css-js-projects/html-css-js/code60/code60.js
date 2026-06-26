// JavaScript for Code 60
const monthYearEl = document.getElementById('month-year');
const calendarGrid = document.getElementById('calendar-grid');
const prevBtn = document.getElementById('prev-month');
const nextBtn = document.getElementById('next-month');
const selectedDateEl = document.getElementById('selected-date');
const eventsList = document.getElementById('events-list');
const addEventBtn = document.getElementById('add-event-btn');
const eventModal = document.getElementById('event-modal');
const eventTitle = document.getElementById('event-title');
const eventTime = document.getElementById('event-time');
const saveEventBtn = document.getElementById('save-event');
const closeModal = document.querySelector('.close');

const STORAGE_KEY = 'calendar_events_60';
let currentDate = new Date();
let selectedDate = null;
let events = {};

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

// Load events from localStorage
window.addEventListener('DOMContentLoaded', () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) events = JSON.parse(saved);
    renderCalendar();
});

// Prev/Next month
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

    monthYearEl.textContent = `${MONTHS[month]} ${year}`;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const today = new Date();
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

    calendarGrid.innerHTML = '';

    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i;
        const dayEl = createDayElement(day, true, false);
        calendarGrid.appendChild(dayEl);
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
        const isToday = isCurrentMonth && today.getDate() === day;
        const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const hasEvents = events[dateKey] && events[dateKey].length > 0;
        const isSelected = selectedDate === dateKey;

        const dayEl = createDayElement(day, false, isToday, hasEvents, isSelected, dateKey);
        calendarGrid.appendChild(dayEl);
    }

    // Next month days
    const totalCells = firstDay + daysInMonth;
    const remainingCells = totalCells % 7 === 0? 0 : 7 - (totalCells % 7);
    for (let day = 1; day <= remainingCells; day++) {
        const dayEl = createDayElement(day, true, false);
        calendarGrid.appendChild(dayEl);
    }
}

function createDayElement(day, isOtherMonth, isToday, hasEvents, isSelected, dateKey) {
    const div = document.createElement('div');
    div.className = 'day';
    if (isOtherMonth) div.classList.add('other-month');
    if (isToday) div.classList.add('today');
    if (hasEvents) div.classList.add('has-events');
    if (isSelected) div.classList.add('selected');
    if (!isOtherMonth) div.classList.add('empty');

    div.textContent = day;

    if (!isOtherMonth) {
        div.dataset.date = dateKey;
        div.addEventListener('click', () => selectDate(dateKey));
    }

    return div;
}

function selectDate(dateKey) {
    selectedDate = dateKey;
    const [year, month, day] = dateKey.split('-');
    selectedDateEl.textContent = `${MONTHS[parseInt(month) - 1]} ${parseInt(day)}, ${year}`;
    addEventBtn.classList.remove('hidden');
    renderEvents(dateKey);
    renderCalendar(); // Re-render to show selected state
}

function renderEvents(dateKey) {
    const dayEvents = events[dateKey] || [];

    if (dayEvents.length === 0) {
        eventsList.innerHTML = '<div class="empty-events">No events for this day</div>';
        return;
    }

    eventsList.innerHTML = dayEvents.map((event, idx) => `
        <div class="event-item">
            <div class="event-info">
                <div class="event-title">${escapeHtml(event.title)}</div>
                <div class="event-time">${event.time || 'All day'}</div>
            </div>
            <button class="delete-event" data-date="${dateKey}" data-idx="${idx}">&times;</button>
        </div>
    `).join('');
}

// Add Event
addEventBtn.addEventListener('click', () => {
    if (!selectedDate) return;
    eventModal.classList.add('show');
    eventTitle.focus();
});

closeModal.addEventListener('click', () => {
    eventModal.classList.remove('show');
});

eventModal.addEventListener('click', (e) => {
    if (e.target === eventModal) eventModal.classList.remove('show');
});

saveEventBtn.addEventListener('click', () => {
    const title = eventTitle.value.trim();
    if (!title ||!selectedDate) return;

    if (!events[selectedDate]) events[selectedDate] = [];

    events[selectedDate].push({
        id: Date.now(),
        title: title,
        time: eventTime.value
    });

    saveEvents();
    renderEvents(selectedDate);
    renderCalendar();

    eventModal.classList.remove('show');
    eventTitle.value = '';
    eventTime.value = '';
});

// Delete Event
eventsList.addEventListener('click', (e) => {
    if (e.target.classList.contains('delete-event')) {
        const dateKey = e.target.dataset.date;
        const idx = parseInt(e.target.dataset.idx);

        events[dateKey].splice(idx, 1);
        if (events[dateKey].length === 0) delete events[dateKey];

        saveEvents();
        renderEvents(dateKey);
        renderCalendar();
    }
});

function saveEvents() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}