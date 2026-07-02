// JavaScript for Code 37
const previewElement = document.getElementById('previewElement');
const previewBox = document.getElementById('previewBox');
const cssCode = document.getElementById('cssCode');
const copyBtn = document.getElementById('copyBtn');

// Mode toggle
const modeBtns = document.querySelectorAll('.mode-btn');
const allCorners = document.getElementById('allCorners');
const individualCorners = document.getElementById('individualCorners');

// All corners control
const allSlider = document.getElementById('allSlider');
const allValue = document.getElementById('allValue');

// Individual controls
const corners = ['tlh', 'tlv', 'trh', 'trv', 'brh', 'brv', 'blh', 'blv'];
const sliders = {};
const values = {};

corners.forEach(id => {
  sliders[id] = document.getElementById(id);
  values[id] = document.getElementById(id + 'Value');
});

// Shape buttons
const shapeBtns = document.querySelectorAll('.shape-btn');

// Handles
const handles = document.querySelectorAll('.handle');

let mode = 'all';
let radii = {
  tlh: 20, tlv: 20,
  trh: 20, trv: 20,
  brh: 20, brv: 20,
  blh: 20, blv: 20
};

const presets = [
  { name: 'Rounded', values: [20, 20, 20, 20, 20, 20, 20, 20] },
  { name: 'Circle', values: [50, 50, 50, 50, 50, 50, 50, 50] },
  { name: 'Leaf', values: [100, 100, 0, 0, 100, 100, 0, 0] },
  { name: 'Blob', values: [60, 40, 30, 70, 60, 30, 70, 40] },
  { name: 'Egg', values: [50, 50, 50, 50, 20, 20, 20, 20] },
  { name: 'Drop', values: [50, 50, 0, 50, 50, 50, 0] }
];

function updateRadius() {
  let css;
  if (mode === 'all') {
    const val = allSlider.value;
    css = `${val}px`;
    previewElement.style.borderRadius = css;
  } else {
    // Individual: TL TR BR BL with horizontal/vertical values
    const tl = `${radii.tlh}px ${radii.tlv}px`;
    const tr = `${radii.trh}px ${radii.trv}px`;
    const br = `${radii.brh}px ${radii.brv}px`;
    const bl = `${radii.blh}px ${radii.blv}px`;

    // If h and v are same for each corner, simplify
    if (radii.tlh === radii.tlv && radii.trh === radii.trv &&
        radii.brh === radii.brv && radii.blh === radii.blv) {
      css = `${radii.tlh}px ${radii.trh}px ${radii.brh}px ${radii.blh}px`;
    } else {
      css = `${tl} ${tr} ${br} ${bl}`;
    }
    previewElement.style.borderRadius = `${radii.tlh}% ${radii.trh}% ${radii.brh}% ${radii.blh}% / ${radii.tlv}% ${radii.trv}% ${radii.brv}% ${radii.blv}%`;
  }

  cssCode.textContent = `border-radius: ${css};`;
}

function setAllCorners(val) {
  allValue.textContent = val + 'px';
  Object.keys(radii).forEach(key => {
    radii[key] = parseInt(val);
    if (sliders[key]) {
      sliders[key].value = val;
      values[key].textContent = val + 'px';
    }
  });
  updateRadius();
}

// Mode toggle
modeBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    modeBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    mode = btn.dataset.mode;

    if (mode === 'all') {
      allCorners.style.display = 'block';
      individualCorners.style.display = 'none';
    } else {
      allCorners.style.display = 'none';
      individualCorners.style.display = 'grid';
    }
    updateRadius();
  });
});

// All slider
allSlider.addEventListener('input', (e) => {
  setAllCorners(e.target.value);
});

// Individual sliders
corners.forEach(id => {
  sliders[id].addEventListener('input', (e) => {
    radii[id] = parseInt(e.target.value);
    values[id].textContent = e.target.value + 'px';
    updateRadius();
  });
});

// Shape buttons
shapeBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    shapeBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const shape = btn.dataset.shape;
    if (shape === 'circle') {
      previewElement.style.width = '200px';
      previewElement.style.height = '200px';
    } else if (shape === 'rect') {
      previewElement.style.width = '300px';
      previewElement.style.height = '150px';
    } else {
      previewElement.style.width = '250px';
      previewElement.style.height = '250px';
    }
  });
});

// Copy button
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
const presetGrid = document.getElementById('presetGrid');
presets.forEach(preset => {
  const div = document.createElement('div');
  div.className = 'preset';
  const [tlh, tlv, trh, trv, brh, brv, blh, blv] = preset.values;
  div.style.borderRadius = `${tlh}% ${trh}% ${brh}% ${blh}% / ${tlv}% ${trv}% ${brv}% ${blv}%`;
  div.textContent = preset.name;
  div.onclick = () => {
    modeBtns[1].click(); // Switch to individual mode
    corners.forEach((key, idx) => {
      radii[key] = preset.values[idx];
      sliders[key].value = preset.values[idx];
      values[key].textContent = preset.values[idx] + 'px';
    });
    updateRadius();
  };
  presetGrid.appendChild(div);
});

// 8-point drag handles
let isDragging = false;
let currentHandle = null;

handles.forEach(handle => {
  handle.addEventListener('mousedown', (e) => {
    isDragging = true;
    currentHandle = e.target;
    document.body.style.userSelect = 'none';
  });
});

document.addEventListener('mousemove', (e) => {
  if (!isDragging ||!currentHandle) return;

  const rect = previewBox.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const width = rect.width;
  const height = rect.height;

  const corner = currentHandle.dataset.corner;
  const axis = currentHandle.dataset.axis;

  let percent;
  if (axis === 'h') {
    percent = Math.max(0, Math.min(100, (x / width) * 100));
  } else {
    percent = Math.max(0, Math.min(100, (y / height) * 100));
  }

  const key = corner + axis;
  radii[key] = Math.round(percent);
  sliders[key].value = percent;
  values[key].textContent = Math.round(percent) + 'px';

  modeBtns[1].click(); // Switch to individual mode
  updateRadius();
});

document.addEventListener('mouseup', () => {
  isDragging = false;
  currentHandle = null;
  document.body.style.userSelect = '';
});

// Init
updateRadius();