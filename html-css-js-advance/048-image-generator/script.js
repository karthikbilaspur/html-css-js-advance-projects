class ImageGenerator {
    constructor() {
        this.currentImage = null;
        this.history = this.loadHistory();
        this.favorites = this.loadFavorites();
        this.currentTab = 'recent';
        this.abortController = null;

        this.elements = {
            category: document.getElementById('category'),
            width: document.getElementById('width'),
            height: document.getElementById('height'),
            blur: document.getElementById('blur'),
            blurValue: document.getElementById('blurValue'),
            grayscale: document.getElementById('grayscale'),
            generateBtn: document.getElementById('generateBtn'),
            downloadBtn: document.getElementById('downloadBtn'),
            favoriteBtn: document.getElementById('favoriteBtn'),
            randomImage: document.getElementById('randomImage'),
            loader: document.getElementById('loader'),
            errorState: document.getElementById('errorState'),
            retryBtn: document.getElementById('retryBtn'),
            imageUrl: document.getElementById('imageUrl'),
            imageSize: document.getElementById('imageSize'),
            imageId: document.getElementById('imageId'),
            copyBtn: document.getElementById('copyBtn'),
            historyGrid: document.getElementById('historyGrid'),
            toast: document.getElementById('toast'),
            tabs: document.querySelectorAll('.tab')
        };

        this.init();
    }

    init() {
        this.bindEvents();
        this.generateImage();
        this.renderHistory();
        this.updateFavoriteButton();
    }

    bindEvents() {
        this.elements.blur.addEventListener('input', (e) => {
            this.elements.blurValue.textContent = e.target.value;
        });

        this.elements.generateBtn.addEventListener('click', () => this.generateImage());
        this.elements.downloadBtn.addEventListener('click', () => this.downloadImage());
        this.elements.favoriteBtn.addEventListener('click', () => this.toggleFavorite());
        this.elements.copyBtn.addEventListener('click', () => this.copyUrl());
        this.elements.retryBtn.addEventListener('click', () => this.generateImage());

        // Presets
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.elements.width.value = btn.dataset.w;
                this.elements.height.value = btn.dataset.h;
                this.generateImage();
            });
        });

        // Tabs
        this.elements.tabs.forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && e.target.tagName!== 'INPUT' && e.target.tagName!== 'SELECT') {
                e.preventDefault();
                this.generateImage();
            }
            if (e.code === 'KeyD' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                this.downloadImage();
            }
        });

        // Auto-generate on input change with debounce
        [this.elements.width, this.elements.height, this.elements.category, this.elements.grayscale].forEach(el => {
            el.addEventListener('change', this.debounce(() => this.generateImage(), 500));
        });
    }

    debounce(func, wait) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    async generateImage() {
        // Cancel previous request
        if (this.abortController) {
            this.abortController.abort();
        }
        this.abortController = new AbortController();

        const width = this.elements.width.value || 800;
        const height = this.elements.height.value || 600;
        const category = this.elements.category.value;
        const blur = this.elements.blur.value;
        const grayscale = this.elements.grayscale.checked;

        let url = `https://picsum.photos/${width}/${height}`;
        const seed = Math.floor(Math.random() * 10000);
        const params = new URLSearchParams({ random: seed });

        if (blur > 0) params.append('blur', blur);
        if (grayscale) params.append('grayscale', '');
        if (category) params.append('category', category);

        url += `?${params.toString()}`;

        this.showLoader();
        this.hideError();

        try {
            const response = await fetch(url, { signal: this.abortController.signal });
            if (!response.ok) throw new Error('Failed to fetch');

            this.currentImage = {
                url,
                width,
                height,
                id: response.headers.get('picsum-id') || seed,
                timestamp: Date.now()
            };

            this.elements.randomImage.src = url;
            this.elements.imageUrl.value = url;
            this.elements.imageSize.textContent = `${width} x ${height}`;
            this.elements.imageId.textContent = this.currentImage.id;

            this.addToHistory(this.currentImage);
            this.updateFavoriteButton();
            this.hideLoader();

        } catch (error) {
            if (error.name === 'AbortError') return;
            this.showError();
            this.hideLoader();
        }
    }

    showLoader() {
        this.elements.loader.classList.add('active');
        this.elements.randomImage.style.opacity = '0.3';
    }

    hideLoader() {
        this.elements.loader.classList.remove('active');
        this.elements.randomImage.style.opacity = '1';
    }

    showError() {
        this.elements.errorState.hidden = false;
    }

    hideError() {
        this.elements.errorState.hidden = true;
    }

    async downloadImage() {
        if (!this.currentImage) return;

        try {
            this.showToast('Downloading...');
            const response = await fetch(this.currentImage.url);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `random-${this.currentImage.id}.jpg`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            this.showToast('Downloaded!');
        } catch (error) {
            this.showToast('Download failed. Right-click to save.', 'error');
        }
    }

    copyUrl() {
        if (!this.currentImage) return;
        navigator.clipboard.writeText(this.currentImage.url).then(() => {
            this.elements.copyBtn.textContent = 'Copied!';
            this.elements.copyBtn.classList.add('copied');
            setTimeout(() => {
                this.elements.copyBtn.textContent = 'Copy';
                this.elements.copyBtn.classList.remove('copied');
            }, 2000);
        });
    }

    toggleFavorite() {
        if (!this.currentImage) return;

        const index = this.favorites.findIndex(f => f.url === this.currentImage.url);
        if (index > -1) {
            this.favorites.splice(index, 1);
            this.showToast('Removed from favorites');
        } else {
            this.favorites.unshift(this.currentImage);
            this.showToast('Added to favorites');
        }

        localStorage.setItem('imageFavorites', JSON.stringify(this.favorites));
        this.updateFavoriteButton();
        if (this.currentTab === 'favorites') this.renderHistory();
    }

    updateFavoriteButton() {
        const isFav = this.currentImage && this.favorites.some(f => f.url === this.currentImage.url);
        this.elements.favoriteBtn.setAttribute('aria-pressed', isFav);
    }

    addToHistory(image) {
        this.history = this.history.filter(item => item.url!== image.url);
        this.history.unshift(image);
        if (this.history.length > 20) this.history = this.history.slice(0, 20);
        localStorage.setItem('imageHistory', JSON.stringify(this.history));
        if (this.currentTab === 'recent') this.renderHistory();
    }

    loadHistory() {
        return JSON.parse(localStorage.getItem('imageHistory')) || [];
    }

    loadFavorites() {
        return JSON.parse(localStorage.getItem('imageFavorites')) || [];
    }

    switchTab(tab) {
        this.currentTab = tab;
        this.elements.tabs.forEach(t => {
            t.classList.toggle('active', t.dataset.tab === tab);
            t.setAttribute('aria-selected', t.dataset.tab === tab);
        });
        this.renderHistory();
    }

    renderHistory() {
        const items = this.currentTab === 'favorites'? this.favorites : this.history;
        this.elements.historyGrid.innerHTML = '';

        if (items.length === 0) {
            this.elements.historyGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-dim);">No ${this.currentTab} yet</p>`;
            return;
        }

        items.forEach((item, index) => {
            const div = document.createElement('div');
            div.className = 'history-item';
            div.setAttribute('role', 'button');
            div.setAttribute('tabindex', '0');
            div.setAttribute('aria-label', `Load image ${index + 1}`);

            div.innerHTML = `
                <img src="${item.url}" alt="History image ${index + 1}" loading="lazy">
                <button class="remove-btn" aria-label="Remove">×</button>
            `;

            div.addEventListener('click', (e) => {
                if (e.target.classList.contains('remove-btn')) return;
                this.loadFromHistory(item);
            });

            div.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') this.loadFromHistory(item);
            });

            div.querySelector('.remove-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                this.removeFromHistory(item, index);
            });

            this.elements.historyGrid.appendChild(div);
        });
    }

    loadFromHistory(item) {
        this.currentImage = item;
        this.elements.randomImage.src = item.url;
        this.elements.imageUrl.value = item.url;
        this.elements.imageSize.textContent = `${item.width} x ${item.height}`;
        this.elements.imageId.textContent = item.id;
        this.elements.width.value = item.width;
        this.elements.height.value = item.height;
        this.updateFavoriteButton();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    removeFromHistory(item, index) {
        if (this.currentTab === 'favorites') {
            this.favorites.splice(index, 1);
            localStorage.setItem('imageFavorites', JSON.stringify(this.favorites));
        } else {
            this.history.splice(index, 1);
            localStorage.setItem('imageHistory', JSON.stringify(this.history));
        }
        this.renderHistory();
    }

    showToast(message, type = 'success') {
        this.elements.toast.textContent = message;
        this.elements.toast.className = 'toast show';
        setTimeout(() => {
            this.elements.toast.classList.remove('show');
        }, 3000);
    }
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    new ImageGenerator();
});