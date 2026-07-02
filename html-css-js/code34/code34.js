// JavaScript for Code 34
const colorInput = document.getElementById('colorInput');
const colorPreview = document.getElementById('colorPreview');
const hexInput = document.getElementById('hexInput');
const rgbInput = document.getElementById('rgbInput');
const hslInput = document.getElementById('hslInput');
const rSlider = document.getElementById('rSlider');
const gSlider = document.getElementById('gSlider');
const bSlider = document.getElementById('bSlider');
const rValue = document.getElementById('rValue');
const gValue = document.getElementById('gValue');
const bValue = document.getElementById('bValue');
const paletteGrid = document.getElementById('paletteGrid');
const savedColors = document.getElementById('savedColors');
const saveBtn = document.getElementById('saveBtn');

const presetPalette = [
  '#e74c3c', '#e67e22', '#f39c12', '#f1c40f', '#2ecc71', '#27ae60',
  '#1abc9c', '#16a085', '#3498db', '#2980b9', '#9b59b6', '#8e44ad',
  '#34495e', '#2c3e50', '#ecf0f1', '#bdc3c7', '#95a5a6', '#7f8c8d'
];

let currentColor = { r: 102, g: 126, b: 234 };
let savedColorList = JSON.parse(localStorage.getItem('savedColors')) || [];

// HEX ↔ RGB conversion
function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1? '0' + hex : hex;
  }).join('');
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// RGB to HSL conversion
function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

function updateColor(r, g, b) {
  currentColor = { r, g, b };
  const hex = rgbToHex(r, g, b);
  const hsl = rgbToHsl(r, g, b);

  colorPreview.style.background = hex;
  colorInput.value = hex;
  hexInput.value = hex;
  rgbInput.value = `rgb(${r}, ${g}, ${b})`;
  hslInput.value = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;

  rSlider.value = r;
  gSlider.value = g;
  bSlider.value = b;
  rValue.textContent = r;
  gValue.textContent = g;
  bValue.textContent = b;
}

// Event listeners
colorInput.addEventListener('input', (e) => {
  const rgb = hexToRgb(e.target.value);
  if (rgb) updateColor(rgb.r, rgb.g, rgb.b);
});

hexInput.addEventListener('change', (e) => {
  const rgb = hexToRgb(e.target.value);
  if (rgb) updateColor(rgb.r, rgb.g, rgb.b);
});

rgbInput.addEventListener('change', (e) => {
  const match = e.target.value.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (match) updateColor(+match[1], +match[2], +match[3]);
});

[rSlider, gSlider, bSlider].forEach((slider, idx) => {
  slider.addEventListener('input', () => {
    const r = parseInt(rSlider.value);
    const g = parseInt(gSlider.value);
    const b = parseInt(bSlider.value);
    updateColor(r, g, b);
  });
});

// Copy buttons
document.querySelectorAll('.copy-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const targetId = btn.dataset.target;
    const input = document.getElementById(targetId);
    navigator.clipboard.writeText(input.value).then(() => {
      btn.textContent = '✓';
      btn.classList.add('copied');
      setTimeout(() => {
        btn.textContent = '📋';
        btn.classList.remove('copied');
      }, 1500);
    });
  });
});

// Palette
presetPalette.forEach(color => {
  const div = document.createElement('div');
  div.className = 'palette-color';
  div.style.background = color;
  div.onclick = () => {
    const rgb = hexToRgb(color);
    updateColor(rgb.r, rgb.g, rgb.b);
  };
  paletteGrid.appendChild(div);
});

// Save colors
function renderSavedColors() {
  savedColors.innerHTML = savedColorList.map((color, idx) => `
    <div class="saved-color" style="background: ${color}" onclick="loadSavedColor('${color}')">
      <button class="delete-btn" onclick="deleteSavedColor(${idx}, event)">×</button>
    </div>
  `).join('');
}

function loadSavedColor(hex) {
  const rgb = hexToRgb(hex);
  if (rgb) updateColor(rgb.r, rgb.g, rgb.b);
}

function deleteSavedColor(idx, event) {
  event.stopPropagation();
  savedColorList.splice(idx, 1);
  localStorage.setItem('savedColors', JSON.stringify(savedColorList));
  renderSavedColors();
}

saveBtn.addEventListener('click', () => {
  const hex = rgbToHex(currentColor.r, currentColor.g, currentColor.b);
  if (!savedColorList.includes(hex)) {
    savedColorList.push(hex);
    localStorage.setItem('savedColors', JSON.stringify(savedColorList));
    renderSavedColors();
  }
});

// Make functions global for onclick
window.loadSavedColor = loadSavedColor;
window.deleteSavedColor = deleteSavedColor;

// Init
updateColor(currentColor.r, currentColor.g, currentColor.b);
renderSavedColors();