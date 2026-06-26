// JavaScript for Code 35
const color1 = document.getElementById('color1');
const color2 = document.getElementById('color2');
const hex1 = document.getElementById('hex1');
const hex2 = document.getElementById('hex2');
const angleSlider = document.getElementById('angleSlider');
const angleValue = document.getElementById('angleValue');
const gradientPreview = document.getElementById('gradientPreview');
const cssCode = document.getElementById('cssCode');
const copyBtn = document.getElementById('copyBtn');
const swapBtn = document.getElementById('swapBtn');
const dirBtns = document.querySelectorAll('.dir-btn');
const typeBtns = document.querySelectorAll('.type-btn');
const presetGrid = document.getElementById('presetGrid');

let gradientType = 'linear';
let angle = 90;

const presets = [
  { name: 'Ocean', colors: ['#2E3192', '#1BFFFF'], angle: 90 },
  { name: 'Sunset', colors: ['#FF512F', '#DD2476'], angle: 90 },
  { name: 'Purple', colors: ['#667eea', '#764ba2'], angle: 90 },
  { name: 'Green', colors: ['#11998e', '#38ef7d'], angle: 90 },
  { name: 'Pink', colors: ['#ee0979', '#ff6a00'], angle: 90 },
  { name: 'Blue', colors: ['#4facfe', '#00f2fe'], angle: 90 },
  { name: 'Fire', colors: ['#f093fb', '#f5576c'], angle: 90 },
  { name: 'Cool', colors: ['#4facfe', '#00f2fe'], angle: 135 }
];

function updateGradient() {
  const c1 = color1.value;
  const c2 = color2.value;
  const ang = angle;

  let gradient;
  if (gradientType === 'linear') {
    gradient = `linear-gradient(${ang}deg, ${c1}, ${c2})`;
  } else {
    gradient = `radial-gradient(circle, ${c1}, ${c2})`;
  }

  gradientPreview.style.background = gradient;
  cssCode.textContent = `background: ${gradient};`;

  // Update hex inputs
  hex1.value = c1;
  hex2.value = c2;
}

function validateHex(hex) {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
}

// Event listeners
color1.addEventListener('input', (e) => {
  hex1.value = e.target.value;
  updateGradient();
});

color2.addEventListener('input', (e) => {
  hex2.value = e.target.value;
  updateGradient();
});

hex1.addEventListener('change', (e) => {
  if (validateHex(e.target.value)) {
    color1.value = e.target.value;
    updateGradient();
  }
});

hex2.addEventListener('change', (e) => {
  if (validateHex(e.target.value)) {
    color2.value = e.target.value;
    updateGradient();
  }
});

angleSlider.addEventListener('input', (e) => {
  angle = e.target.value;
  angleValue.textContent = angle + '°';
  updateGradient();
});

swapBtn.addEventListener('click', () => {
  const temp = color1.value;
  color1.value = color2.value;
  color2.value = temp;
  updateGradient();
});

dirBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    angle = btn.dataset.angle;
    angleSlider.value = angle;
    angleValue.textContent = angle + '°';
    updateGradient();
  });
});

typeBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    typeBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    gradientType = btn.dataset.type;
    updateGradient();
  });
});

copyBtn.addEventListener('click', () => {
  navigator.clipboard.writeText(cssCode.textContent).then(() => {
    copyBtn.textContent = '✓ Copied';
    copyBtn.classList.add('copied');
    setTimeout(() => {
      copyBtn.textContent = '📋 Copy';
      copyBtn.classList.remove('copied');
    }, 2000);
  });
});

// Load presets
presets.forEach(preset => {
  const div = document.createElement('div');
  div.className = 'preset';
  div.style.background = `linear-gradient(90deg, ${preset.colors[0]}, ${preset.colors[1]})`;
  div.innerHTML = `<div class="preset-name">${preset.name}</div>`;
  div.onclick = () => {
    color1.value = preset.colors[0];
    color2.value = preset.colors[1];
    angle = preset.angle;
    angleSlider.value = angle;
    angleValue.textContent = angle + '°';
    updateGradient();
  };
  presetGrid.appendChild(div);
});

// Init
updateGradient();