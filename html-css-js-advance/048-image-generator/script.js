const categorySelect = document.getElementById('category');
const widthInput = document.getElementById('width');
const heightInput = document.getElementById('height');
const blurInput = document.getElementById('blur');
const blurValue = document.getElementById('blurValue');
const generateBtn = document.getElementById('generateBtn');
const downloadBtn = document.getElementById('downloadBtn');
const randomImage = document.getElementById('randomImage');
const loader = document.getElementById('loader');
const imageUrl = document.getElementById('imageUrl');
const imageSize = document.getElementById('imageSize');
const copyBtn = document.getElementById('copyBtn');
const historyGrid = document.getElementById('historyGrid');

let currentImageUrl = '';
let history = JSON.parse(localStorage.getItem('imageHistory')) || [];

// Update blur display
blurInput.addEventListener('input', (e) => {
    blurValue.textContent = e.target.value;
});

// Generate image
generateBtn.addEventListener('click', generateImage);

// Generate on load
generateImage();
renderHistory();

function generateImage() {
    const width = widthInput.value || 800;
    const height = heightInput.value || 600;
    const category = categorySelect.value;
    const blur = blurInput.value;

    let url = `https://picsum.photos/${width}/${height}`;

    // Add seed for randomness
    const seed = Math.floor(Math.random() * 1000);
    url += `?random=${seed}`;

    if (blur > 0) {
        url += `&blur=${blur}`;
    }

    if (category) {
        url += `&category=${category}`;
    }

    showLoader();

    // Create new image to preload
    const img = new Image();
    img.onload = () => {
        randomImage.src = url;
        currentImageUrl = url;
        imageUrl.textContent = url;
        imageSize.textContent = `${width} x ${height}`;
        hideLoader();
        addToHistory(url, width, height);
    };
    img.onerror = () => {
        hideLoader();
        alert('Failed to load image. Please try again.');
    };
    img.src = url;
}

function showLoader() {
    loader.classList.add('active');
    randomImage.style.opacity = '0.3';
}

function hideLoader() {
    loader.classList.remove('active');
    randomImage.style.opacity = '1';
}

// Download image
downloadBtn.addEventListener('click', async () => {
    if (!currentImageUrl) return;

    try {
        const response = await fetch(currentImageUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `random-image-${Date.now()}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        alert('Download failed. Try right-clicking the image and "Save Image As"');
    }
});

// Copy URL
copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(currentImageUrl).then(() => {
        copyBtn.textContent = 'Copied!';
        copyBtn.classList.add('copied');
        setTimeout(() => {
            copyBtn.textContent = 'Copy';
            copyBtn.classList.remove('copied');
        }, 2000);
    });
});

// History management
function addToHistory(url, width, height) {
    const historyItem = { url, width, height, timestamp: Date.now() };

    // Avoid duplicates
    history = history.filter(item => item.url!== url);
    history.unshift(historyItem);

    // Keep only last 12
    if (history.length > 12) {
        history = history.slice(0, 12);
    }

    localStorage.setItem('imageHistory', JSON.stringify(history));
    renderHistory();
}

function renderHistory() {
    historyGrid.innerHTML = '';

    history.forEach(item => {
        const div = document.createElement('div');
        div.classList.add('history-item');
        div.innerHTML = `<img src="${item.url}" alt="History">`;
        div.addEventListener('click', () => {
            randomImage.src = item.url;
            currentImageUrl = item.url;
            imageUrl.textContent = item.url;
            imageSize.textContent = `${item.width} x ${item.height}`;
            widthInput.value = item.width;
            heightInput.value = item.height;
        });
        historyGrid.appendChild(div);
    });
}

// Keyboard shortcut: Space to generate
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && e.target.tagName!== 'INPUT') {
        e.preventDefault();
        generateImage();
    }
});