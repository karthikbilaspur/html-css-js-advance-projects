class PageBuilder {
    constructor() {
        this.blocks = [];
        this.selectedBlockId = null;
        this.draggedType = null;
        this.blockCounter = 0;

        this.init();
    }

    init() {
        this.bindEvents();
        this.loadFromStorage();
    }

    bindEvents() {
        // Drag blocks from sidebar
        document.querySelectorAll('.block-item').forEach(item => {
            item.addEventListener('dragstart', (e) => {
                this.draggedType = e.target.dataset.type;
                e.target.classList.add('dragging');
            });

            item.addEventListener('dragend', (e) => {
                e.target.classList.remove('dragging');
            });
        });

        // Canvas drop zones
        this.setupDropZones();

        // Toolbar buttons
        document.getElementById('preview-btn').addEventListener('click', () => this.showPreview());
        document.getElementById('clear-btn').addEventListener('click', () => this.clearCanvas());
        document.getElementById('export-html').addEventListener('click', () => this.exportHTML());
        document.getElementById('save-btn').addEventListener('click', () => this.saveToStorage());
        document.getElementById('close-preview').addEventListener('click', () => this.closePreview());

        // Click outside to deselect
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.canvas-block') &&!e.target.closest('.properties-panel')) {
                this.deselectBlock();
            }
        });
    }

    setupDropZones() {
        const canvas = document.getElementById('canvas');

        canvas.addEventListener('dragover', (e) => {
            e.preventDefault();
            const dropZone = e.target.closest('.drop-zone');
            if (dropZone) {
                dropZone.classList.add('drag-over');
            }
        });

        canvas.addEventListener('dragleave', (e) => {
            const dropZone = e.target.closest('.drop-zone');
            if (dropZone) {
                dropZone.classList.remove('drag-over');
            }
        });

        canvas.addEventListener('drop', (e) => {
            e.preventDefault();
            const dropZone = e.target.closest('.drop-zone');
            if (dropZone && this.draggedType) {
                dropZone.classList.remove('drag-over');
                const index = parseInt(dropZone.dataset.index);
                this.addBlock(this.draggedType, index);
            }
        });
    }

    addBlock(type, index) {
        const block = {
            id: `block-${this.blockCounter++}`,
            type: type,
            content: this.getDefaultContent(type),
            styles: this.getDefaultStyles(type)
        };

        this.blocks.splice(index, 0, block);
        this.renderCanvas();
        this.selectBlock(block.id);
        this.saveToStorage();
    }

    getDefaultContent(type) {
        const defaults = {
            heading: 'Your Heading Here',
            text: 'Click to edit this text. You can write multiple lines and format your content.',
            image: 'https://via.placeholder.com/600x400?text=Your+Image',
            button: 'Click Me',
            columns: {left: 'Left Column', right: 'Right Column'},
            spacer: ''
        };
        return defaults[type] || '';
    }

    getDefaultStyles(type) {
        const defaults = {
            heading: {fontSize: '32px', color: '#1a1a1a', textAlign: 'left'},
            text: {fontSize: '16px', color: '#3c4043', textAlign: 'left'},
            button: {backgroundColor: '#1a73e8', color: '#ffffff', padding: '12px 24px'},
            spacer: {height: '40px'}
        };
        return defaults[type] || {};
    }

    renderCanvas() {
        const canvas = document.getElementById('canvas');
        canvas.innerHTML = '';

        this.blocks.forEach((block, index) => {
            // Drop zone before block
            const dropZone = this.createDropZone(index);
            canvas.appendChild(dropZone);

            // Block element
            const blockEl = this.createBlockElement(block);
            canvas.appendChild(blockEl);
        });

        // Final drop zone
        const finalDropZone = this.createDropZone(this.blocks.length);
        canvas.appendChild(finalDropZone);

        if (this.blocks.length === 0) {
            finalDropZone.querySelector('span').textContent = 'Drag blocks here to start building';
        }
    }

    createDropZone(index) {
        const zone = document.createElement('div');
        zone.className = 'drop-zone';
        zone.dataset.index = index;
        zone.innerHTML = '<span></span>';
        return zone;
    }

    createBlockElement(block) {
        const wrapper = document.createElement('div');
        wrapper.className = 'canvas-block';
        wrapper.dataset.blockId = block.id;

        if (this.selectedBlockId === block.id) {
            wrapper.classList.add('selected');
        }

        // Toolbar
        const toolbar = document.createElement('div');
        toolbar.className = 'block-toolbar';
        toolbar.innerHTML = `
            <button title="Move Up" onclick="builder.moveBlock('${block.id}', -1)">↑</button>
            <button title="Move Down" onclick="builder.moveBlock('${block.id}', 1)">↓</button>
            <button title="Duplicate" onclick="builder.duplicateBlock('${block.id}')">⧉</button>
            <button title="Delete" onclick="builder.deleteBlock('${block.id}')">✕</button>
        `;
        wrapper.appendChild(toolbar);

        // Content
        const content = document.createElement('div');
        content.className = 'block-content';

        switch(block.type) {
            case 'heading':
                content.className += ' block-heading';
                content.contentEditable = true;
                content.textContent = block.content;
                content.style.fontSize = block.styles.fontSize;
                content.style.color = block.styles.color;
                content.style.textAlign = block.styles.textAlign;
                break;

            case 'text':
                content.className += ' block-text';
                content.contentEditable = true;
                content.textContent = block.content;
                content.style.fontSize = block.styles.fontSize;
                content.style.color = block.styles.color;
                content.style.textAlign = block.styles.textAlign;
                break;

            case 'image':
                const img = document.createElement('img');
                img.className = 'block-image';
                img.src = block.content;
                img.alt = 'Image';
                content.appendChild(img);
                break;

            case 'button':
                const btn = document.createElement('button');
                btn.className = 'block-button';
                btn.textContent = block.content;
                btn.style.backgroundColor = block.styles.backgroundColor;
                btn.style.color = block.styles.color;
                btn.contentEditable = true;
                content.appendChild(btn);
                break;

            case 'columns':
                content.className += ' block-columns';
                const leftCol = document.createElement('div');
                leftCol.className = 'block-column';
                leftCol.contentEditable = true;
                leftCol.textContent = block.content.left;

                const rightCol = document.createElement('div');
                rightCol.className = 'block-column';
                rightCol.contentEditable = true;
                rightCol.textContent = block.content.right;

                content.appendChild(leftCol);
                content.appendChild(rightCol);
                break;

            case 'spacer':
                content.className += ' block-spacer';
                content.style.height = block.styles.height;
                break;
        }

        content.addEventListener('click', (e) => {
            e.stopPropagation();
            this.selectBlock(block.id);
        });

        content.addEventListener('input', (e) => {
            this.updateBlockContent(block.id, e.target);
        });

        wrapper.appendChild(content);
        return wrapper;
    }

    selectBlock(blockId) {
        this.selectedBlockId = blockId;
        document.querySelectorAll('.canvas-block').forEach(b => b.classList.remove('selected'));
        document.querySelector(`[data-block-id="${blockId}"]`)?.classList.add('selected');
        this.showProperties(blockId);
    }

    deselectBlock() {
        this.selectedBlockId = null;
        document.querySelectorAll('.canvas-block').forEach(b => b.classList.remove('selected'));
        this.showProperties(null);
    }

    showProperties(blockId) {
        const panel = document.getElementById('properties-content');

        if (!blockId) {
            panel.innerHTML = '<p class="hint">Select a block to edit</p>';
            return;
        }

        const block = this.blocks.find(b => b.id === blockId);
        if (!block) return;

        let html = `<div class="property-group"><label>Block Type</label><input type="text" value="${block.type}" readonly></div>`;

        if (block.type === 'heading' || block.type === 'text') {
            html += `
                <div class="property-group">
                    <label>Font Size</label>
                    <select onchange="builder.updateBlockStyle('${blockId}', 'fontSize', this.value)">
                        <option value="14px" ${block.styles.fontSize === '14px'? 'selected' : ''}>Small</option>
                        <option value="16px" ${block.styles.fontSize === '16px'? 'selected' : ''}>Normal</option>
                        <option value="24px" ${block.styles.fontSize === '24px'? 'selected' : ''}>Large</option>
                        <option value="32px" ${block.styles.fontSize === '32px'? 'selected' : ''}>Heading</option>
                    </select>
                </div>
                <div class="property-group">
                    <label>Color</label>
                    <input type="color" value="${block.styles.color}" onchange="builder.updateBlockStyle('${blockId}', 'color', this.value)">
                </div>
                <div class="property-group">
                    <label>Align</label>
                    <select onchange="builder.updateBlockStyle('${blockId}', 'textAlign', this.value)">
                        <option value="left">Left</option>
                        <option value="center">Center</option>
                        <option value="right">Right</option>
                    </select>
                </div>
            `;
        }

        if (block.type === 'image') {
            html += `
                <div class="property-group">
                    <label>Image URL</label>
                    <input type="text" value="${block.content}" onchange="builder.updateBlockContentDirect('${blockId}', this.value)">
                </div>
            `;
        }

        if (block.type === 'button') {
            html += `
                <div class="property-group">
                    <label>Background Color</label>
                    <input type="color" value="${block.styles.backgroundColor}" onchange="builder.updateBlockStyle('${blockId}', 'backgroundColor', this.value)">
                </div>
                <div class="property-group">
                    <label>Text Color</label>
                    <input type="color" value="${block.styles.color}" onchange="builder.updateBlockStyle('${blockId}', 'color', this.value)">
                </div>
            `;
        }

        panel.innerHTML = html;
    }

    updateBlockContent(blockId, element) {
        const block = this.blocks.find(b => b.id === blockId);
        if (!block) return;

        if (block.type === 'columns') {
            const cols = element.querySelectorAll('.block-column');
            block.content = {
                left: cols[0]?.textContent || '',
                right: cols[1]?.textContent || ''
            };
        } else {
            block.content = element.textContent || element.value;
        }
        this.saveToStorage();
    }

    updateBlockContentDirect(blockId, value) {
        const block = this.blocks.find(b => b.id === blockId);
        if (block) {
            block.content = value;
            this.renderCanvas();
            this.selectBlock(blockId);
            this.saveToStorage();
        }
    }

    updateBlockStyle(blockId, property, value) {
        const block = this.blocks.find(b => b.id === blockId);
        if (block) {
            block.styles[property] = value;
            this.renderCanvas();
            this.selectBlock(blockId);
            this.saveToStorage();
        }
    }

    moveBlock(blockId, direction) {
        const index = this.blocks.findIndex(b => b.id === blockId);
        const newIndex = index + direction;

        if (newIndex >= 0 && newIndex < this.blocks.length) {
            [this.blocks[index], this.blocks[newIndex]] = [this.blocks[newIndex], this.blocks[index]];
            this.renderCanvas();
            this.selectBlock(blockId);
            this.saveToStorage();
        }
    }

    duplicateBlock(blockId) {
        const index = this.blocks.findIndex(b => b.id === blockId);
        const block = this.blocks[index];
        const newBlock = JSON.parse(JSON.stringify(block));
        newBlock.id = `block-${this.blockCounter++}`;

        this.blocks.splice(index + 1, 0, newBlock);
        this.renderCanvas();
        this.selectBlock(newBlock.id);
        this.saveToStorage();
    }

    deleteBlock(blockId) {
        this.blocks = this.blocks.filter(b => b.id!== blockId);
        this.deselectBlock();
        this.renderCanvas();
        this.saveToStorage();
    }

    clearCanvas() {
        if (confirm('Clear all blocks?')) {
            this.blocks = [];
            this.renderCanvas();
            this.saveToStorage();
        }
    }

    showPreview() {
        const html = this.generateHTML();
        const iframe = document.getElementById('preview-frame');
        const doc = iframe.contentDocument || iframe.contentWindow.document;
        doc.open();
        doc.write(html);
        doc.close();

        document.getElementById('preview-modal').classList.add('active');
    }

    closePreview() {
        document.getElementById('preview-modal').classList.remove('active');
    }

    generateHTML() {
        let body = '';
        this.blocks.forEach(block => {
            body += this.blockToHTML(block);
        });

        return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Exported Page</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 900px; margin: 0 auto; padding: 40px 20px; }
       .block-heading { font-size: 2rem; font-weight: 700; margin: 20px 0; }
       .block-text { font-size: 16px; line-height: 1.6; margin: 16px 0; }
       .block-button { display: inline-block; padding: 12px 24px; background: #1a73e8; color: white; border: none; border-radius: 4px; font-size: 14px; font-weight: 600; cursor: pointer; margin: 16px 0; }
       .block-image { max-width: 100%; height: auto; margin: 16px 0; border-radius: 4px; }
       .block-columns { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
       .block-spacer { height: 40px; }
    </style>
</head>
<body>
    ${body}
</body>
</html>`;
    }

    blockToHTML(block) {
        switch(block.type) {
            case 'heading':
                return `<h1 class="block-heading" style="font-size:${block.styles.fontSize};color:${block.styles.color};text-align:${block.styles.textAlign}">${block.content}</h1>`;
            case 'text':
                return `<p class="block-text" style="font-size:${block.styles.fontSize};color:${block.styles.color};text-align:${block.styles.textAlign}">${block.content}</p>`;
            case 'image':
                return `<img class="block-image" src="${block.content}" alt="">`;
            case 'button':
                return `<button class="block-button" style="background-color:${block.styles.backgroundColor};color:${block.styles.color}">${block.content}</button>`;
            case 'columns':
                return `<div class="block-columns"><div>${block.content.left}</div><div>${block.content.right}</div></div>`;
            case 'spacer':
                return `<div class="block-spacer" style="height:${block.styles.height}"></div>`;
            default:
                return '';
        }
    }

    exportHTML() {
        const html = this.generateHTML();
        const blob = new Blob([html], {type: 'text/html'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'page.html';
        a.click();
    }

    saveToStorage() {
        localStorage.setItem('pagebuilder-data', JSON.stringify({
            blocks: this.blocks,
            counter: this.blockCounter
        }));
    }

    loadFromStorage() {
        const saved = localStorage.getItem('pagebuilder-data');
        if (saved) {
            const data = JSON.parse(saved);
            this.blocks = data.blocks || [];
            this.blockCounter = data.counter || 0;
            this.renderCanvas();
        }
    }
}

const builder = new PageBuilder();