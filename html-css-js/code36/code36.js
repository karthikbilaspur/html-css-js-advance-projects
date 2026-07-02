// JavaScript for Code 36
const hOffset = document.getElementById('hOffset');
const vOffset = document.getElementById('vOffset');
const blur = document.getElementById('blur');
const spread = document.getElementById('spread');
const shadowColor = document.getElementById('shadowColor');
const opacity = document.getElementById('opacity');
const insetCheck = document.getElementById('insetCheck');

const hOffsetValue = document.getElementById('hOffsetValue');
const vOffsetValue = document.getElementById('vOffsetValue');
const blurValue = document.getElementById('blurValue');
const spreadValue = document.getElementById('spreadValue');
const opacityValue = document.getElementById('opacityValue');

const previewElement = document.getElementById('previewElement');
const cssCode = document.getElementById('cssCode');
const copyBtn = document.getElementById('copyBtn');
const addLayerBtn = document.getElementById('addLayerBtn');
const layersSection = document.getElementById('layersSection');
const layersList = document.getElementById('layersList');
const presetGrid = document.getElementById('presetGrid');

let shadowLayers = [];

const presets = [
  { name: 'Soft', h: 0, v: 10, b: 30, s: 0, c: '#000000', o: 10 },
  { name: 'Hard', h: 5, v: 5, b: 0, s: 0, c: '#000000', o: 30 },
  { name: 'Neumorphism', h: 20, v: 20, b: 60, s: -10, c: '#bebebe', o: 100 },
  { name: 'Glow', h: 0, v: 0, b: 40, s: 0, c: '#667eea', o: 60 },
  { name: 'Inset', h: 0, v: 5, b: 10, s: 0, c: '#000000', o: 20, inset: true },
  { name: 'Multiple', layers: [
    { h: 0, v: 1, b: 2, s: 0, c: '#000000', o: 10 },
    { h: 0, v: 2, b: 4, s: 0, c: '#000000', o: 10 },
    { h: 0, v: 4, b: 8, s: 0, c: '#000000', o: 10 }
  ]}
];

function hexToRgba(hex, opacity) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
}

function buildShadowString(layer) {
  const color = hexToRgba(layer.color, layer.opacity);
  const inset = layer.inset? 'inset ' : '';
  return `${inset}${layer.h}px ${layer.v}px ${layer.b}px ${layer.s}px ${color}`;
}

function updateShadow() {
  const currentLayer = {
    h: parseInt(hOffset.value),
    v: parseInt(vOffset.value),
    b: parseInt(blur.value),
    s: parseInt(spread.value),
    color: shadowColor.value,
    opacity: parseInt(opacity.value),
    inset: insetCheck.checked
  };

  const allLayers = shadowLayers.length > 0? [...shadowLayers, currentLayer] : [currentLayer];
  const shadowCSS = allLayers.map(buildShadowString).join(', ');

  previewElement.style.boxShadow = shadowCSS;
  cssCode.textContent = `box-shadow: ${shadowCSS};`;

  // Update value displays
  hOffsetValue.textContent = currentLayer.h + 'px';
  vOffsetValue.textContent = currentLayer.v + 'px';
  blurValue.textContent = currentLayer.b + 'px';
  spreadValue.textContent = currentLayer.s + 'px';
  opacityValue.textContent = currentLayer.opacity + '%';
}

function addLayer() {
  const layer = {
    h: parseInt(hOffset.value),
    v: parseInt(vOffset.value),
    b: parseInt(blur.value),
    s: parseInt(spread.value),
    color: shadowColor.value,
    opacity: parseInt(opacity.value),
    inset: insetCheck.checked
  };

  shadowLayers.push(layer);
  renderLayers();
  layersSection.classList.add('active');

  // Reset controls
  hOffset.value = 0;
  vOffset.value = 0;
  blur.value = 10;
  spread.value = 0;
  opacity.value = 30;
  insetCheck.checked = false;
  updateShadow();
}

function renderLayers() {
  layersList.innerHTML = shadowLayers.map((layer, idx) => `
    <div class="layer-item">
      <div class="layer-preview" style="box-shadow: ${buildShadowString(layer)}"></div>
      <div class="layer-info">Layer ${idx + 1}: ${layer.h}px ${layer.v}px ${layer.b}px</div>
      <button class="delete-layer" onclick="deleteLayer(${idx})">Delete</button>
    </div>
  `).join('');
}

function deleteLayer(idx) {
  shadowLayers.splice(idx, 1);
  renderLayers();
  if (shadowLayers.length === 0) {
    layersSection.classList.remove('active');
  }
  updateShadow();
}

function loadPreset(preset) {
  if (preset.layers) {
    shadowLayers = preset.layers;
    renderLayers();
    layersSection.classList.add('active');
  } else {
    shadowLayers = [];
    layersSection.classList.remove('active');
    hOffset.value = preset.h;
    vOffset.value = preset.v;
    blur.value = preset.b;
    spread.value = preset.s;
    shadowColor.value = preset.c;
    opacity.value = preset.o;
    insetCheck.checked = preset.inset || false;
  }
  updateShadow();
}

// Event listeners
[hOffset, vOffset, blur, spread, opacity].forEach(input => {
  input.addEventListener('input', updateShadow);
});

shadowColor.addEventListener('input', updateShadow);
insetCheck.addEventListener('change', updateShadow);

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

addLayerBtn.addEventListener('click', addLayer);

// Load presets
presets.forEach(preset => {
  const div = document.createElement('div');
  div.className = 'preset';
  const shadow = preset.layers? preset.layers.map(buildShadowString).join(', ') : buildShadowString(preset);
  div.style.boxShadow = shadow;
  div.style.background = 'white';
  div.innerHTML = preset.name;
  div.onclick = () => loadPreset(preset);
  presetGrid.appendChild(div);
});

// Make deleteLayer global
window.deleteLayer = deleteLayer;

// Init
updateShadow();