// JavaScript for Code 90
class FormBuilder {
    constructor() {
        this.fields = [];
        this.selectedFieldId = null;
        this.fieldIdCounter = 0;
        this.draggedElement = null;

        this.init();
    }

    init() {
        this.bindPaletteEvents();
        this.bindCanvasEvents();
        this.bindButtons();
        this.bindFormSettings();
    }

    bindPaletteEvents() {
        document.querySelectorAll('.field-item').forEach(item => {
            item.addEventListener('dragstart', (e) => this.handleDragStart(e));
            item.addEventListener('dragend', (e) => this.handleDragEnd(e));
        });
    }

    bindCanvasEvents() {
        const canvas = document.getElementById('form-canvas');

        canvas.addEventListener('dragover', (e) => {
            e.preventDefault();
            const afterElement = this.getDragAfterElement(canvas, e.clientY);
            if (afterElement) {
                canvas.insertBefore(this.getDragPlaceholder(), afterElement);
            } else {
                canvas.appendChild(this.getDragPlaceholder());
            }
        });

        canvas.addEventListener('drop', (e) => {
            e.preventDefault();
            this.removeDragPlaceholder();
            if (this.draggedElement) {
                const type = this.draggedElement.dataset.type;
                this.addField(type);
            }
        });

        canvas.addEventListener('dragleave', (e) => {
            if (e.target === canvas) {
                this.removeDragPlaceholder();
            }
        });
    }

    bindButtons() {
        document.getElementById('preview-btn').addEventListener('click', () => this.showPreview());
        document.getElementById('export-json').addEventListener('click', () => this.exportJSON());
        document.getElementById('export-html').addEventListener('click', () => this.exportHTML());
        document.getElementById('clear-btn').addEventListener('click', () => this.clearAll());
        document.getElementById('close-preview').addEventListener('click', () => this.closeModal('preview-modal'));
        document.getElementById('close-export').addEventListener('click', () => this.closeModal('export-modal'));
        document.getElementById('copy-export').addEventListener('click', () => this.copyExport());
    }

    bindFormSettings() {
        document.getElementById('form-title').addEventListener('input', (e) => {
            document.getElementById('canvas-title').textContent = e.target.value || 'Untitled Form';
        });

        document.getElementById('form-desc').addEventListener('input', (e) => {
            document.getElementById('canvas-desc').textContent = e.target.value;
        });
    }

    handleDragStart(e) {
        this.draggedElement = e.target;
        e.target.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'copy';
    }

    handleDragEnd(e) {
        e.target.classList.remove('dragging');
        this.draggedElement = null;
        this.removeDragPlaceholder();
    }

    getDragPlaceholder() {
        let placeholder = document.querySelector('.drag-placeholder');
        if (!placeholder) {
            placeholder = document.createElement('div');
            placeholder.className = 'drag-placeholder';
            placeholder.style.height = '60px';
            placeholder.style.background = '#e6fffa';
            placeholder.style.border = '2px dashed #38b2ac';
            placeholder.style.borderRadius = '8px';
            placeholder.style.marginBottom = '20px';
        }
        return placeholder;
    }

    removeDragPlaceholder() {
        const placeholder = document.querySelector('.drag-placeholder');
        if (placeholder) placeholder.remove();
    }

    getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.form-field:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;

            if (offset < 0 && offset > closest.offset) {
                return {offset: offset, element: child};
            } else {
                return closest;
            }
        }, {offset: Number.NEGATIVE_INFINITY}).element;
    }

    addField(type) {
        const field = {
            id: `field_${this.fieldIdCounter++}`,
            type: type,
            label: this.getDefaultLabel(type),
            placeholder: '',
            required: false,
            helpText: '',
            options: ['select', 'radio'].includes(type)? ['Option 1', 'Option 2'] : []
        };

        this.fields.push(field);
        this.renderCanvas();
        this.selectField(field.id);
    }

    getDefaultLabel(type) {
        const labels = {
            text: 'Text Field',
            email: 'Email Address',
            number: 'Number',
            textarea: 'Long Text',
            select: 'Dropdown',
            radio: 'Radio Group',
            checkbox: 'Checkbox',
            date: 'Date',
            file: 'File Upload',
            section: 'Section Header'
        };
        return labels[type] || 'Field';
    }

    renderCanvas() {
        const canvas = document.getElementById('form-canvas');

        if (this.fields.length === 0) {
            canvas.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🎨</div>
                    <p>Drag fields here to build your form</p>
                </div>
            `;
            return;
        }

        canvas.innerHTML = '';
        this.fields.forEach(field => {
            canvas.appendChild(this.createFieldElement(field));
        });
    }

    createFieldElement(field) {
        const div = document.createElement('div');
        div.className = 'form-field';
        div.dataset.fieldId = field.id;
        if (field.id === this.selectedFieldId) {
            div.classList.add('selected');
        }

        div.addEventListener('click', (e) => {
            e.stopPropagation();
            this.selectField(field.id);
        });

        const header = document.createElement('div');
        header.className = 'field-header';

        const label = document.createElement('div');
        label.className = 'field-label';
        label.innerHTML = field.label + (field.required? '<span class="required-star">*</span>' : '');
        header.appendChild(label);

        const actions = document.createElement('div');
        actions.className = 'field-actions';
        actions.innerHTML = `
            <button class="icon-btn" onclick="formBuilder.duplicateField('${field.id}')" title="Duplicate">📋</button>
            <button class="icon-btn" onclick="formBuilder.deleteField('${field.id}')" title="Delete">🗑️</button>
        `;
        header.appendChild(actions);
        div.appendChild(header);

        const input = this.createInputElement(field);
        div.appendChild(input);

        if (field.helpText) {
            const help = document.createElement('div');
            help.className = 'field-help';
            help.textContent = field.helpText;
            div.appendChild(help);
        }

        return div;
    }

    createInputElement(field) {
        let element;

        switch(field.type) {
            case 'textarea':
                element = document.createElement('textarea');
                element.className = 'field-textarea';
                element.placeholder = field.placeholder;
                element.disabled = true;
                break;

            case 'select':
                element = document.createElement('select');
                element.className = 'field-select';
                element.disabled = true;
                field.options.forEach(opt => {
                    const option = document.createElement('option');
                    option.textContent = opt;
                    element.appendChild(option);
                });
                break;

            case 'radio':
                element = document.createElement('div');
                element.className = 'radio-group';
                field.options.forEach(opt => {
                    const div = document.createElement('div');
                    div.className = 'radio-item';
                    div.innerHTML = `<input type="radio" disabled> <span>${opt}</span>`;
                    element.appendChild(div);
                });
                break;

            case 'checkbox':
                element = document.createElement('div');
                element.className = 'checkbox-item';
                element.innerHTML = `<input type="checkbox" disabled> <span>${field.label}</span>`;
                break;

            case 'section':
                element = document.createElement('h3');
                element.textContent = field.label;
                element.style.borderBottom = '2px solid #e2e8f0';
                element.style.paddingBottom = '8px';
                element.style.marginBottom = '0';
                break;

            default:
                element = document.createElement('input');
                element.className = 'field-input';
                element.type = field.type;
                element.placeholder = field.placeholder;
                element.disabled = true;
        }

        return element;
    }

    selectField(fieldId) {
        this.selectedFieldId = fieldId;
        document.querySelectorAll('.form-field').forEach(f => {
            f.classList.toggle('selected', f.dataset.fieldId === fieldId);
        });
        this.renderProperties();
    }

    renderProperties() {
        const container = document.getElementById('properties-content');
        const field = this.fields.find(f => f.id === this.selectedFieldId);

        if (!field) {
            container.innerHTML = '<p class="hint">Select a field to edit</p>';
            return;
        }

        let html = `
            <div class="property-group">
                <label>Label</label>
                <input type="text" value="${field.label}"
                    onchange="formBuilder.updateField('${field.id}', 'label', this.value)">
            </div>
        `;

        if (!['section', 'checkbox'].includes(field.type)) {
            html += `
                <div class="property-group">
                    <label>Placeholder</label>
                    <input type="text" value="${field.placeholder}"
                        onchange="formBuilder.updateField('${field.id}', 'placeholder', this.value)">
                </div>
            `;
        }

        if (!['section'].includes(field.type)) {
            html += `
                <div class="property-group">
                    <label class="checkbox-label">
                        <input type="checkbox" ${field.required? 'checked' : ''}
                            onchange="formBuilder.updateField('${field.id}', 'required', this.checked)">
                        <span>Required field</span>
                    </label>
                </div>
            `;
        }

        if (['select', 'radio'].includes(field.type)) {
            html += `
                <div class="property-group">
                    <label>Options</label>
                    <div class="options-list" id="options-list">
                        ${field.options.map((opt, idx) => `
                            <div class="option-row">
                                <input type="text" value="${opt}"
                                    onchange="formBuilder.updateOption('${field.id}', ${idx}, this.value)">
                                <button onclick="formBuilder.removeOption('${field.id}', ${idx})">✕</button>
                            </div>
                        `).join('')}
                    </div>
                    <button onclick="formBuilder.addOption('${field.id}')" style="margin-top: 8px;">+ Add Option</button>
                </div>
            `;
        }

        html += `
            <div class="property-group">
                <label>Help Text</label>
                <textarea rows="2" onchange="formBuilder.updateField('${field.id}', 'helpText', this.value)">${field.helpText}</textarea>
            </div>
        `;

        container.innerHTML = html;
    }

    updateField(fieldId, property, value) {
        const field = this.fields.find(f => f.id === fieldId);
        if (field) {
            field[property] = value;
            this.renderCanvas();
        }
    }

    updateOption(fieldId, index, value) {
        const field = this.fields.find(f => f.id === fieldId);
        if (field && field.options) {
            field.options[index] = value;
            this.renderCanvas();
        }
    }

    addOption(fieldId) {
        const field = this.fields.find(f => f.id === fieldId);
        if (field && field.options) {
            field.options.push(`Option ${field.options.length + 1}`);
            this.renderProperties();
            this.renderCanvas();
        }
    }

    removeOption(fieldId, index) {
        const field = this.fields.find(f => f.id === fieldId);
        if (field && field.options && field.options.length > 1) {
            field.options.splice(index, 1);
            this.renderProperties();
            this.renderCanvas();
        }
    }

    duplicateField(fieldId) {
        const field = this.fields.find(f => f.id === fieldId);
        if (field) {
            const newField = JSON.parse(JSON.stringify(field));
            newField.id = `field_${this.fieldIdCounter++}`;
            newField.label = field.label + ' Copy';
            const index = this.fields.indexOf(field);
            this.fields.splice(index + 1, 0, newField);
            this.renderCanvas();
        }
    }

    deleteField(fieldId) {
        this.fields = this.fields.filter(f => f.id!== fieldId);
        if (this.selectedFieldId === fieldId) {
            this.selectedFieldId = null;
        }
        this.renderCanvas();
        this.renderProperties();
    }

    clearAll() {
        if (confirm('Clear all fields? This cannot be undone.')) {
            this.fields = [];
            this.selectedFieldId = null;
            this.renderCanvas();
            this.renderProperties();
        }
    }

    showPreview() {
        const modal = document.getElementById('preview-modal');
        const body = document.getElementById('preview-body');

        let html = `<form id="preview-form">`;
        html += `<h2>${document.getElementById('form-title').value}</h2>`;

        const desc = document.getElementById('form-desc').value;
        if (desc) html += `<p style="color: #718096; margin-bottom: 20px;">${desc}</p>`;

        this.fields.forEach(field => {
            if (field.type === 'section') {
                html += `<h3 style="border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin: 20px 0;">${field.label}</h3>`;
                return;
            }

            html += `<div style="margin-bottom: 20px;">`;
            html += `<label style="display: block; font-weight: 600; margin-bottom: 6px;">${field.label}${field.required? ' <span style="color: #e53e3e;">*</span>' : ''}</label>`;

            switch(field.type) {
                case 'textarea':
                    html += `<textarea placeholder="${field.placeholder}" ${field.required? 'required' : ''} style="width: 100%; padding: 8px; border: 1px solid #cbd5e0; border-radius: 6px;"></textarea>`;
                    break;
                case 'select':
                    html += `<select ${field.required? 'required' : ''} style="width: 100%; padding: 8px; border: 1px solid #cbd5e0; border-radius: 6px;">`;
                    field.options.forEach(opt => html += `<option>${opt}</option>`);
                    html += `</select>`;
                    break;
                case 'radio':
                    field.options.forEach(opt => {
                        html += `<div style="margin: 8px 0;"><label><input type="radio" name="${field.id}" ${field.required? 'required' : ''}> ${opt}</label></div>`;
                    });
                    break;
                case 'checkbox':
                    html += `<label><input type="checkbox" ${field.required? 'required' : ''}> ${field.label}</label>`;
                    break;
                default:
                    html += `<input type="${field.type}" placeholder="${field.placeholder}" ${field.required? 'required' : ''} style="width: 100%; padding: 8px; border: 1px solid #cbd5e0; border-radius: 6px;">`;
            }

            if (field.helpText) {
                html += `<div style="font-size: 12px; color: #718096; margin-top: 4px;">${field.helpText}</div>`;
            }
            html += `</div>`;
        });

        html += `<button type="submit" style="padding: 10px 24px; background: #4299e1; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">Submit</button>`;
        html += `</form>`;

        body.innerHTML = html;
        modal.classList.add('active');
    }

    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
    }

    generateJSONSchema() {
        const schema = {
            title: document.getElementById('form-title').value,
            description: document.getElementById('form-desc').value,
            type: 'object',
            properties: {},
            required: []
        };

        this.fields.forEach(field => {
            if (field.type === 'section') return;

            const prop = {
                type: this.getSchemaType(field.type),
                title: field.label
            };

            if (field.placeholder) prop.description = field.placeholder;
            if (field.helpText) prop.helpText = field.helpText;

            if (['select', 'radio'].includes(field.type)) {
                prop.enum = field.options;
            }

            const key = field.label.toLowerCase().replace(/\s+/g, '_');
            schema.properties[key] = prop;

            if (field.required) {
                schema.required.push(key);
            }
        });

        return schema;
    }

    getSchemaType(fieldType) {
        const types = {
            text: 'string',
            email: 'string',
            textarea: 'string',
            number: 'number',
            date: 'string',
            select: 'string',
            radio: 'string',
            checkbox: 'boolean',
            file: 'string'
        };
        return types[fieldType] || 'string';
    }

    exportJSON() {
        const schema = this.generateJSONSchema();
        document.getElementById('export-title').textContent = 'JSON Schema';
        document.getElementById('export-content').textContent = JSON.stringify(schema, null, 2);
        document.getElementById('export-modal').classList.add('active');
    }

    exportHTML() {
        let html = `<!DOCTYPE html>\n<html>\n<head>\n <title>${document.getElementById('form-title').value}</title>\n`;
        html += ` <style>\n body { font-family: sans-serif; max-width: 600px; margin: 40px auto; padding: 20px; }\n`;
        html += `.field { margin-bottom: 20px; }\n label { display: block; font-weight: 600; margin-bottom: 6px; }\n`;
        html += ` input, textarea, select { width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; }\n`;
        html += ` button { padding: 10px 24px; background: #4299e1; color: white; border: none; border-radius: 6px; cursor: pointer; }\n`;
        html += ` </style>\n</head>\n<body>\n <form>\n <h1>${document.getElementById('form-title').value}</h1>\n`;

        this.fields.forEach(field => {
            if (field.type === 'section') {
                html += ` <h2>${field.label}</h2>\n`;
                return;
            }
            html += ` <div class="field">\n <label>${field.label}${field.required? ' *' : ''}</label>\n`;
            html += ` <input type="${field.type}" placeholder="${field.placeholder}" ${field.required? 'required' : ''}>\n </div>\n`;
        });

        html += ` <button type="submit">Submit</button>\n </form>\n</body>\n</html>`;

        document.getElementById('export-title').textContent = 'HTML Export';
        document.getElementById('export-content').textContent = html;
        document.getElementById('export-modal').classList.add('active');
    }

    copyExport() {
        const content = document.getElementById('export-content').textContent;
        navigator.clipboard.writeText(content).then(() => {
            const btn = document.getElementById('copy-export');
            const original = btn.textContent;
            btn.textContent = 'Copied!';
            setTimeout(() => btn.textContent = original, 2000);
        });
    }
}

const formBuilder = new FormBuilder();s