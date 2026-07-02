// JavaScript for Code 76
const target = document.getElementById('target');
const playBtn = document.getElementById('play-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');
const scrubber = document.getElementById('scrubber');
const currentTimeEl = document.getElementById('current-time');
const totalTimeEl = document.getElementById('total-time');
const speedSelect = document.getElementById('speed');
const animButtons = document.querySelectorAll('[data-anim]');

// State
let isPlaying = false;
let startTime = null;
let pausedAt = 0;
let duration = 2000; // 2 seconds
let animationName = 'bounce';
let speed = 1;
let rafId = null;

// Apply animation via CSS but control with JS
function applyAnimation() {
    target.style.animation = 'none';
    // Force reflow
    void target.offsetWidth;
    target.style.animation = `${animationName} ${duration / 1000}s linear infinite`;
    target.style.animationPlayState = 'paused';
}

// requestAnimationFrame timeline controller
function updateTimeline(timestamp) {
    if (!startTime) startTime = timestamp;
    if (!isPlaying) return;

    const elapsed = (timestamp - startTime) * speed + pausedAt;
    const progress = (elapsed % duration) / duration;

    // Update scrubber
    scrubber.value = progress * 100;
    updateTimeDisplay(elapsed);

    // Set animation progress using negative delay trick
    const delay = -elapsed / 1000;
    target.style.animationDelay = `${delay}s`;

    // Update inspector
    updateInspector(progress);

    rafId = requestAnimationFrame(updateTimeline);
}

function play() {
    if (isPlaying) return;
    isPlaying = true;
    startTime = null;

    playBtn.disabled = true;
    pauseBtn.disabled = false;

    target.style.animationPlayState = 'running';
    rafId = requestAnimationFrame(updateTimeline);
}

function pause() {
    if (!isPlaying) return;
    isPlaying = false;

    // Store current position
    const computed = getComputedStyle(target);
    const matrix = new DOMMatrix(computed.transform);
    pausedAt += (performance.now() - startTime) * speed;

    playBtn.disabled = false;
    pauseBtn.disabled = true;

    target.style.animationPlayState = 'paused';
    cancelAnimationFrame(rafId);
}

function reset() {
    isPlaying = false;
    pausedAt = 0;
    startTime = null;

    playBtn.disabled = false;
    pauseBtn.disabled = true;

    cancelAnimationFrame(rafId);
    scrubber.value = 0;
    updateTimeDisplay(0);
    target.style.animationDelay = '0s';
    target.style.animationPlayState = 'paused';
    updateInspector(0);
}

function scrub(e) {
    const progress = e.target.value / 100;
    const time = progress * duration;

    pausedAt = time;
    startTime = null;

    updateTimeDisplay(time);

    // Jump to position
    target.style.animationDelay = `${-time / 1000}s`;
    updateInspector(progress);

    if (!isPlaying) {
        target.style.animationPlayState = 'paused';
    }
}

function updateTimeDisplay(elapsed) {
    const current = (elapsed / 1000) % (duration / 1000);
    currentTimeEl.textContent = current.toFixed(2) + 's';
    totalTimeEl.textContent = (duration / 1000).toFixed(2) + 's';
}

function updateInspector(progress) {
    const computed = getComputedStyle(target);

    document.getElementById('val-transform').textContent =
        computed.transform === 'none'? 'none' : computed.transform.substring(0, 30) + '...';
    document.getElementById('val-opacity').textContent =
        parseFloat(computed.opacity).toFixed(2);
    document.getElementById('val-bg').textContent =
        computed.backgroundColor;
    document.getElementById('val-progress').textContent =
        (progress * 100).toFixed(1) + '%';
}

// Event listeners
playBtn.addEventListener('click', play);
pauseBtn.addEventListener('click', pause);
resetBtn.addEventListener('click', reset);
scrubber.addEventListener('input', scrub);

speedSelect.addEventListener('change', (e) => {
    speed = parseFloat(e.target.value);
});

// Animation presets
animButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        animButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        animationName = btn.dataset.anim;
        reset();
        applyAnimation();
    });
});

// Init
applyAnimation();
updateInspector(0);
animButtons[0].classList.add('active');

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        isPlaying? pause() : play();
    }
    if (e.key === 'r') reset();
});