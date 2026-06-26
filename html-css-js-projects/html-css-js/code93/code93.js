// JavaScript for Code 93
class VirtualScrollList {
    constructor(options = {}) {
        this.itemHeight = options.itemHeight || 60;
        this.bufferSize = options.bufferSize || 5;
        this.totalItems = 0;
        this.items = [];
        this.visibleRange = {start: 0, end: 0};
        this.scrollTop = 0;
        this.isVariableHeight = false;
        this.itemHeights = [];
        this.itemOffsets = [];

        this.fps = 60;
        this.frameCount = 0;
        this.lastTime = performance.now();

        this.init();
    }

    init() {
        this.viewport = document.getElementById('viewport');
        this.scrollContent = document.getElementById('scroll-content');
        this.visibleItems = document.getElementById('visible-items');

        this.bindEvents();
        this.generateItems(100000);
        this.startFPSMonitor();
    }

    bindEvents() {
        this.viewport.addEventListener('scroll', () => this.handleScroll());
        document.getElementById('generate-btn').addEventListener('click', () => {
            const count = parseInt(document.getElementById('item-count').value);
            this.generateItems(count);
        });

        document.getElementById('item-height').addEventListener('change', (e) => {
            const val = e.target.value;
            if (val === 'variable') {
                this.isVariableHeight = true;
                this.itemHeight = 60;
            } else {
                this.isVariableHeight = false;
                this.itemHeight = parseInt(val);
            }
            this.calculateOffsets();
            this.render();
        });

        document.getElementById('scroll-top').addEventListener('click', () => {
            this.viewport.scrollTop = 0;
        });

        document.getElementById('scroll-random').addEventListener('click', () => {
            const randomPos = Math.random() * this.getTotalHeight();
            this.viewport.scrollTop = randomPos;
        });

        document.getElementById('scroll-bottom').addEventListener('click', () => {
            this.viewport.scrollTop = this.getTotalHeight();
        });

        window.addEventListener('resize', () => this.render());
    }

    generateItems(count) {
        this.totalItems = count;
        this.items = [];
        this.itemHeights = [];

        const names = ['Alice Johnson', 'Bob Smith', 'Carol White', 'David Brown', 'Emma Davis', 'Frank Wilson'];
        const roles = ['Developer', 'Designer', 'Manager', 'Analyst', 'Engineer', 'Director'];

        for (let i = 0; i < count; i++) {
            const height = this.isVariableHeight? 40 + Math.floor(Math.random() * 60) : this.itemHeight;

            this.items.push({
                id: i,
                name: names[i % names.length],
                role: roles[i % roles.length],
                email: `user${i}@example.com`,
                status: i % 3 === 0? 'Active' : i % 3 === 1? 'Pending' : 'Inactive',
                height: height
            });

            this.itemHeights.push(height);
        }

        this.calculateOffsets();
        this.render();
        this.updateStats();
    }

    calculateOffsets() {
        this.itemOffsets = [0];
        let offset = 0;

        for (let i = 0; i < this.totalItems; i++) {
            offset += this.isVariableHeight? this.itemHeights[i] : this.itemHeight;
            this.itemOffsets.push(offset);
        }
    }

    getTotalHeight() {
        return this.itemOffsets[this.totalItems] || this.totalItems * this.itemHeight;
    }

    getItemOffset(index) {
        return this.itemOffsets[index] || index * this.itemHeight;
    }

    getItemHeight(index) {
        return this.isVariableHeight? this.itemHeights[index] : this.itemHeight;
    }

    handleScroll() {
        this.scrollTop = this.viewport.scrollTop;
        requestAnimationFrame(() => this.render());
    }

    getVisibleRange() {
        const viewportHeight = this.viewport.clientHeight;
        const scrollTop = this.viewport.scrollTop;

        let start = 0;
        let end = this.totalItems;

        if (this.isVariableHeight) {
            // Binary search for start index
            let low = 0, high = this.totalItems;
            while (low < high) {
                const mid = Math.floor((low + high) / 2);
                if (this.itemOffsets[mid] < scrollTop) {
                    low = mid + 1;
                } else {
                    high = mid;
                }
            }
            start = Math.max(0, low - this.bufferSize);

            // Find end index
            const bottom = scrollTop + viewportHeight;
            for (let i = start; i < this.totalItems; i++) {
                if (this.itemOffsets[i] > bottom) {
                    end = Math.min(this.totalItems, i + this.bufferSize);
                    break;
                }
            }
        } else {
            start = Math.max(0, Math.floor(scrollTop / this.itemHeight) - this.bufferSize);
            end = Math.min(this.totalItems, Math.ceil((scrollTop + viewportHeight) / this.itemHeight) + this.bufferSize);
        }

        return {start, end};
    }

    render() {
        const range = this.getVisibleRange();
        this.visibleRange = range;

        // Set total height for scrollbar
        this.scrollContent.style.height = `${this.getTotalHeight()}px`;

        // Only re-render if range changed
        if (this.lastRenderedRange &&
            this.lastRenderedRange.start === range.start &&
            this.lastRenderedRange.end === range.end) {
            return;
        }

        this.lastRenderedRange = range;

        // Clear and render only visible items
        this.visibleItems.innerHTML = '';
        const fragment = document.createDocumentFragment();

        for (let i = range.start; i < range.end; i++) {
            const item = this.items[i];
            if (!item) continue;

            const itemEl = this.createItemElement(item, i);
            fragment.appendChild(itemEl);
        }

        this.visibleItems.appendChild(fragment);
        this.updateStats();
        this.frameCount++;
    }

    createItemElement(item, index) {
        const div = document.createElement('div');
        div.className = 'list-item';
        div.style.top = `${this.getItemOffset(index)}px`;
        div.style.height = `${this.getItemHeight(index)}px`;
        div.dataset.index = index;

        const initials = item.name.split(' ').map(n => n[0]).join('');

        div.innerHTML = `
            <div class="item-index">#${index + 1}</div>
            <div class="item-avatar">${initials}</div>
            <div class="item-content">
                <div class="item-title">${item.name}</div>
                <div class="item-subtitle">${item.role} • ${item.email}</div>
            </div>
            <div class="item-badge">${item.status}</div>
        `;

        div.addEventListener('click', () => {
            document.querySelectorAll('.list-item.selected').forEach(el => el.classList.remove('selected'));
            div.classList.add('selected');
        });

        return div;
    }

    updateStats() {
        const rendered = this.visibleRange.end - this.visibleRange.start;
        const memorySaved = ((1 - rendered / this.totalItems) * 100).toFixed(1);

        document.getElementById('rendered-count').textContent = rendered;
        document.getElementById('total-count').textContent = this.totalItems.toLocaleString();
        document.getElementById('scroll-pos').textContent = Math.round(this.scrollTop) + 'px';
        document.getElementById('memory-saved').textContent = memorySaved + '%';

        document.getElementById('debug-info').textContent =
            `Rendering ${rendered} of ${this.totalItems.toLocaleString()} items • Buffer: ${this.bufferSize} • Mode: ${this.isVariableHeight? 'Variable' : 'Fixed'} Height`;
    }

    startFPSMonitor() {
        const updateFPS = () => {
            const now = performance.now();
            const delta = now - this.lastTime;

            if (delta >= 1000) {
                this.fps = Math.round((this.frameCount * 1000) / delta);
                document.getElementById('fps').textContent = this.fps;
                this.frameCount = 0;
                this.lastTime = now;
            }

            requestAnimationFrame(updateFPS);
        };
        updateFPS();
    }
}

// Initialize
const virtualList = new VirtualScrollList();