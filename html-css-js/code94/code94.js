// JavaScript for Code 94
class ImageCropper {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.image = null;
        this.rotation = 0;

        this.cropBox = {
            x: 50,
            y: 50,
            width: 200,
            height: 200,
            dragging: false,
            resizing: false,
            handle: null,
            startX: 0,
            startY: 0
        };

        this.aspectRatio = 'free';
        this.scale = 1;
        this.offsetX = 0;
        this.offsetY = 0;

        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        document.getElementById('upload-btn').addEventListener('click', () => {
            document.getElementById('file-input').click();
        });

        document.getElementById('file-input').addEventListener('change', (e) => {
            this.loadImage(e.target.files[0]);
        });

        const dropZone = document.getElementById('drop-zone');
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('drag-over');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            this.loadImage(e.dataTransfer.files[0]);
        });

        document.getElementById('reset-btn').addEventListener('click', () => this.resetCrop());
        document.getElementById('rotate-btn').addEventListener('click', () => this.rotate());
        document.getElementById('export-btn').addEventListener('click', () => this.export());
        document.getElementById('aspect-ratio').addEventListener('change', (e) => {
            this.aspectRatio = e.target.value;
            this.applyAspectRatio();
        });

        document.getElementById('quality').addEventListener('input', (e) => {
            document.getElementById('quality-val').textContent = Math.round(e.target.value * 100) + '%';
        });

        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.canvas.addEventListener('mouseup', () => this.onMouseUp());
        this.canvas.addEventListener('mouseleave', () => this.onMouseUp());

        // Touch events
        this.canvas.addEventListener('touchstart', (e) => this.onTouchStart(e));
        this.canvas.addEventListener('touchmove', (e) => this.onTouchMove(e));
        this.canvas.addEventListener('touchend', () => this.onMouseUp());
    }

    loadImage(file) {
        if (!file ||!file.type.startsWith('image/')) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.image = img;
                this.rotation = 0;
                this.initCropBox();
                this.draw();
                document.getElementById('drop-zone').style.display = 'none';
                this.canvas.classList.add('active');
                document.getElementById('export-btn').disabled = false;
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    initCropBox() {
        const maxW = this.canvas.width * 0.8;
        const maxH = this.canvas.height * 0.8;
        const size = Math.min(maxW, maxH, 300);

        this.cropBox.x = (this.canvas.width - size) / 2;
        this.cropBox.y = (this.canvas.height - size) / 2;
        this.cropBox.width = size;
        this.cropBox.height = size;

        this.updateDimensions();
    }

    draw() {
        if (!this.image) return;

        // Fit image to canvas
        const container = this.canvas.parentElement;
        const maxWidth = container.clientWidth - 40;
        const maxHeight = container.clientHeight - 40;

        let w = this.image.width;
        let h = this.image.height;

        if (this.rotation % 180!== 0) {
            [w, h] = [h, w];
        }

        this.scale = Math.min(maxWidth / w, maxHeight / h, 1);
        this.canvas.width = w * this.scale;
        this.canvas.height = h * this.scale;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw rotated image
        this.ctx.save();
        this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.rotate(this.rotation * Math.PI / 180);
        this.ctx.drawImage(
            this.image,
            -this.image.width * this.scale / 2,
            -this.image.height * this.scale / 2,
            this.image.width * this.scale,
            this.image.height * this.scale
        );
        this.ctx.restore();

        // Draw overlay
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Clear crop area
        this.ctx.clearRect(this.cropBox.x, this.cropBox.y, this.cropBox.width, this.cropBox.height);
        this.ctx.drawImage(this.canvas, this.cropBox.x, this.cropBox.y, this.cropBox.width, this.cropBox.height,
            this.cropBox.x, this.cropBox.y, this.cropBox.width, this.cropBox.height);

        // Draw crop border
        this.ctx.strokeStyle = '#1a73e8';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(this.cropBox.x, this.cropBox.y, this.cropBox.width, this.cropBox.height);

        // Draw handles
        this.drawHandles();
    }

    drawHandles() {
        const handles = this.getHandles();
        this.ctx.fillStyle = '#1a73e8';

        handles.forEach(h => {
            this.ctx.beginPath();
            this.ctx.arc(h.x, h.y, 6, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.strokeStyle = 'white';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        });
    }

    getHandles() {
        const {x, y, width, height} = this.cropBox;
        return [
            {x: x, y: y, cursor: 'nw-resize', name: 'nw'},
            {x: x + width, y: y, cursor: 'ne-resize', name: 'ne'},
            {x: x, y: y + height, cursor: 'sw-resize', name: 'sw'},
            {x: x + width, y: y + height, cursor: 'se-resize', name: 'se'}
        ];
    }

    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    onMouseDown(e) {
        const pos = this.getMousePos(e);
        const handles = this.getHandles();

        // Check handles
        for (let handle of handles) {
            if (Math.hypot(pos.x - handle.x, pos.y - handle.y) < 10) {
                this.cropBox.resizing = true;
                this.cropBox.handle = handle.name;
                this.cropBox.startX = pos.x;
                this.cropBox.startY = pos.y;
                return;
            }
        }

        // Check if inside crop box
        if (pos.x >= this.cropBox.x && pos.x <= this.cropBox.x + this.cropBox.width &&
            pos.y >= this.cropBox.y && pos.y <= this.cropBox.y + this.cropBox.height) {
            this.cropBox.dragging = true;
            this.cropBox.startX = pos.x - this.cropBox.x;
            this.cropBox.startY = pos.y - this.cropBox.y;
        }
    }

    onMouseMove(e) {
        const pos = this.getMousePos(e);

        // Update cursor
        const handles = this.getHandles();
        let cursor = 'crosshair';

        for (let handle of handles) {
            if (Math.hypot(pos.x - handle.x, pos.y - handle.y) < 10) {
                cursor = handle.cursor;
                break;
            }
        }

        if (pos.x >= this.cropBox.x && pos.x <= this.cropBox.x + this.cropBox.width &&
            pos.y >= this.cropBox.y && pos.y <= this.cropBox.y + this.cropBox.height) {
            cursor = 'move';
        }

        this.canvas.style.cursor = cursor;

        if (this.cropBox.dragging) {
            this.cropBox.x = Math.max(0, Math.min(pos.x - this.cropBox.startX, this.canvas.width - this.cropBox.width));
            this.cropBox.y = Math.max(0, Math.min(pos.y - this.cropBox.startY, this.canvas.height - this.cropBox.height));
            this.draw();
            this.updateDimensions();
        } else if (this.cropBox.resizing) {
            this.resizeCrop(pos);
            this.draw();
            this.updateDimensions();
        }
    }

    resizeCrop(pos) {
        const handle = this.cropBox.handle;
        let {x, y, width, height} = this.cropBox;

        if (handle.includes('e')) {
            width = Math.max(50, pos.x - x);
        }
        if (handle.includes('w')) {
            const newX = Math.min(pos.x, x + width - 50);
            width += x - newX;
            x = newX;
        }
        if (handle.includes('s')) {
            height = Math.max(50, pos.y - y);
        }
        if (handle.includes('n')) {
            const newY = Math.min(pos.y, y + height - 50);
            height += y - newY;
            y = newY;
        }

        // Apply aspect ratio
        if (this.aspectRatio!== 'free') {
            const [w, h] = this.aspectRatio.split(':').map(Number);
            const ratio = w / h;

            if (handle.includes('e') || handle.includes('w')) {
                height = width / ratio;
            } else {
                width = height * ratio;
            }
        }

        // Constrain to canvas
        width = Math.min(width, this.canvas.width - x);
        height = Math.min(height, this.canvas.height - y);

        this.cropBox.x = x;
        this.cropBox.y = y;
        this.cropBox.width = width;
        this.cropBox.height = height;
    }

    onMouseUp() {
        this.cropBox.dragging = false;
        this.cropBox.resizing = false;
        this.cropBox.handle = null;
    }

    onTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        this.onMouseDown(touch);
    }

    onTouchMove(e) {
        e.preventDefault();
        const touch = e.touches[0];
        this.onMouseMove(touch);
    }

    applyAspectRatio() {
        if (this.aspectRatio === 'free') return;

        const [w, h] = this.aspectRatio.split(':').map(Number);
        const ratio = w / h;

        const newHeight = this.cropBox.width / ratio;
        if (newHeight <= this.canvas.height - this.cropBox.y) {
            this.cropBox.height = newHeight;
        } else {
            this.cropBox.height = this.canvas.height - this.cropBox.y;
            this.cropBox.width = this.cropBox.height * ratio;
        }

        this.draw();
        this.updateDimensions();
    }

    resetCrop() {
        if (!this.image) return;
        this.initCropBox();
        this.draw();
    }

    rotate() {
        if (!this.image) return;
        this.rotation = (this.rotation + 90) % 360;
        this.initCropBox();
        this.draw();
    }

    updateDimensions() {
        document.getElementById('crop-x').value = Math.round(this.cropBox.x / this.scale);
        document.getElementById('crop-y').value = Math.round(this.cropBox.y / this.scale);
        document.getElementById('crop-w').value = Math.round(this.cropBox.width / this.scale);
        document.getElementById('crop-h').value = Math.round(this.cropBox.height / this.scale);
    }

    export() {
        if (!this.image) return;

        const quality = parseFloat(document.getElementById('quality').value);

        // Create temp canvas for export
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');

        const exportWidth = this.cropBox.width / this.scale;
        const exportHeight = this.cropBox.height / this.scale;

        tempCanvas.width = exportWidth;
        tempCanvas.height = exportHeight;

        // Draw rotated and cropped image
        tempCtx.save();
        tempCtx.translate(exportWidth / 2, exportHeight / 2);
        tempCtx.rotate(this.rotation * Math.PI / 180);

        const sx = this.cropBox.x / this.scale;
        const sy = this.cropBox.y / this.scale;
        const sWidth = this.cropBox.width / this.scale;
        const sHeight = this.cropBox.height / this.scale;

        tempCtx.drawImage(
            this.image,
            sx, sy, sWidth, sHeight,
            -exportWidth / 2, -exportHeight / 2, exportWidth, exportHeight
        );
        tempCtx.restore();

        // Download
        tempCanvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `cropped-${Date.now()}.png`;
            a.click();
            URL.revokeObjectURL(url);
        }, 'image/png', quality);
    }

    saveToStorage() {
        // Could save state here
    }
}

new ImageCropper();