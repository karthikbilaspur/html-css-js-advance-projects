// Single Slider
const singleSlider = document.getElementById('singleSlider');
const singleBubble = document.getElementById('singleBubble');

function setBubble(slider, bubble) {
    const val = slider.value;
    const min = slider.min || 0;
    const max = slider.max || 100;
    const percent = ((val - min) / (max - min)) * 100;

    bubble.textContent = val;
    bubble.style.left = `${percent}%`;

    // Update track color
    const color = `linear-gradient(90deg, rgba(255,255,255,0.9) ${percent}%, rgba(255,255,255,0.2) ${percent}%)`;
    slider.style.background = color;
}

singleSlider.addEventListener('input', () => {
    setBubble(singleSlider, singleBubble);
});

setBubble(singleSlider, singleBubble);

// Dual Range Slider
const minRange = document.getElementById('minRange');
const maxRange = document.getElementById('maxRange');
const minBubble = document.getElementById('minBubble');
const maxBubble = document.getElementById('maxBubble');
const rangeFill = document.getElementById('rangeFill');
const rangeDisplay = document.getElementById('rangeDisplay');

function updateDualSlider() {
    let minVal = parseInt(minRange.value);
    let maxVal = parseInt(maxRange.value);

    // Prevent crossing
    if (minVal > maxVal - 50) {
        minVal = maxVal - 50;
        minRange.value = minVal;
    }
    if (maxVal < minVal + 50) {
        maxVal = minVal + 50;
        maxRange.value = maxVal;
    }

    const minPercent = (minVal / 1000) * 100;
    const maxPercent = (maxVal / 1000) * 100;

    // Update bubbles
    minBubble.textContent = `$${minVal}`;
    minBubble.style.left = `${minPercent}%`;
    maxBubble.textContent = `$${maxVal}`;
    maxBubble.style.left = `${maxPercent}%`;

    // Update fill
    rangeFill.style.left = `${minPercent}%`;
    rangeFill.style.width = `${maxPercent - minPercent}%`;

    // Update display
    rangeDisplay.textContent = `$${minVal} - $${maxVal}`;
}

minRange.addEventListener('input', updateDualSlider);
maxRange.addEventListener('input', updateDualSlider);
updateDualSlider();

// Stepped Slider
const stepSlider = document.getElementById('stepSlider');
const stepBubble = document.getElementById('stepBubble');

function updateStepSlider() {
    const val = stepSlider.value;
    const percent = ((val - 1) / 4) * 100;

    stepBubble.textContent = `${val} ⭐`;
    stepBubble.style.left = `${percent}%`;

    const color = `linear-gradient(90deg, rgba(255,255,255,0.9) ${percent}%, rgba(255,255,255,0.2) ${percent}%)`;
    stepSlider.style.background = color;
}

stepSlider.addEventListener('input', updateStepSlider);
updateStepSlider();

// Vertical Slider
const verticalSlider = document.getElementById('verticalSlider');
const verticalBubble = document.getElementById('verticalBubble');

function updateVerticalSlider() {
    const val = verticalSlider.value;
    const percent = 100 - val; // Invert because it's rotated

    verticalBubble.textContent = `${val}%`;
    verticalBubble.style.top = `${percent}%`;
}

verticalSlider.addEventListener('input', updateVerticalSlider);
updateVerticalSlider();