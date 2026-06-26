// JavaScript for Code 99
class RealTimeChat {
    constructor() {
        this.messages = [];
        this.currentUser = {id: 'user1', name: 'You', avatar: 'YU'};
        this.ws = null;
        this.typingTimeout = null;
        this.isTyping = false;
        this.messageIdCounter = 0;
        this.renderedMessages = new Map();
        this.visibleRange = {start: 0, end: 0};
        this.bufferSize = 10;
        this.messagesPerPage = 20;

        this.init();
    }

    init() {
        this.bindEvents();
        this.connectWebSocket();
        this.loadInitialMessages();
        this.setupVirtualScroll();
    }

    bindEvents() {
        const input = document.getElementById('message-input');
        const sendBtn = document.getElementById('send-btn');

        input.addEventListener('input', () => this.handleTyping());
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' &&!e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        sendBtn.addEventListener('click', () => this.sendMessage());

        // Auto-resize textarea
        input.addEventListener('input', () => {
            input.style.height = 'auto';
            input.style.height = Math.min(input.scrollHeight, 100) + 'px';
        });
    }

    connectWebSocket() {
        // Mock WebSocket - simulates real-time connection
        this.updateConnectionStatus('connected');

        this.ws = {
            send: (data) => this.handleMockMessage(JSON.parse(data)),
            close: () => {}
        };

        // Simulate incoming messages from other users
        setInterval(() => {
            if (Math.random() > 0.7) {
                this.simulateIncomingMessage();
            }
        }, 8000);

        // Simulate typing indicators
        setInterval(() => {
            if (Math.random() > 0.8) {
                this.showTypingIndicator('Alice');
                setTimeout(() => this.hideTypingIndicator(), 2000);
            }
        }, 15000);
    }

    handleMockMessage(data) {
        // Simulate server echo with delivery status
        setTimeout(() => {
            this.updateMessageStatus(data.id, 'delivered');
        }, 500);

        setTimeout(() => {
            this.updateMessageStatus(data.id, 'read');
        }, 1500);
    }

    updateConnectionStatus(status) {
        const dot = document.getElementById('status-dot');
        const text = document.getElementById('status-text');

        if (status === 'connected') {
            dot.classList.add('connected');
            text.textContent = 'Connected';
        }
    }

    loadInitialMessages() {
        // Generate mock messages
        const mockMessages = [
            {id: 1, author: {id: 'user2', name: 'Alice'}, text: 'Hey everyone! 👋', timestamp: Date.now() - 3600000, status: 'read'},
            {id: 2, author: {id: 'user3', name: 'Bob'}, text: 'Welcome to the chat!', timestamp: Date.now() - 3500000, status: 'read'},
            {id: 3, author: {id: 'user2', name: 'Alice'}, text: 'This virtual scroll is amazing', timestamp: Date.now() - 3400000, status: 'read'},
            {id: 4, author: {id: 'user1', name: 'You'}, text: 'Thanks! Built with CSS containment', timestamp: Date.now() - 3300000, status: 'read'},
            {id: 5, author: {id: 'user4', name: 'Charlie'}, text: 'Can handle thousands of messages smoothly', timestamp: Date.now() - 3200000, status: 'read'}
        ];

        // Add 100 more for virtual scroll demo
        for (let i = 6; i <= 105; i++) {
            mockMessages.push({
                id: i,
                author: {id: `user${(i % 4) + 1}`, name: ['You', 'Alice', 'Bob', 'Charlie'][i % 4]},
                text: `Message ${i} - Lorem ipsum dolor sit amet`,
                timestamp: Date.now() - (106 - i) * 60000,
                status: 'read'
            });
        }

        this.messages = mockMessages;
        this.renderVisibleMessages();
        this.scrollToBottom();
    }

    setupVirtualScroll() {
        const viewport = document.getElementById('messages-viewport');

        viewport.addEventListener('scroll', () => {
            this.updateVisibleRange();

            // Load more on scroll to top
            if (viewport.scrollTop < 100) {
                this.loadMoreMessages();
            }
        });
    }

    updateVisibleRange() {
        const viewport = document.getElementById('messages-viewport');
        const scrollTop = viewport.scrollTop;
        const viewportHeight = viewport.clientHeight;

        // Estimate item height
        const itemHeight = 60;
        const start = Math.max(0, Math.floor(scrollTop / itemHeight) - this.bufferSize);
        const end = Math.min(this.messages.length, Math.ceil((scrollTop + viewportHeight) / itemHeight) + this.bufferSize);

        if (start!== this.visibleRange.start || end!== this.visibleRange.end) {
            this.visibleRange = {start, end};
            this.renderVisibleMessages();
        }
    }

    renderVisibleMessages() {
        const container = document.getElementById('messages-list');
        const {start, end} = this.visibleRange;

        // Use DocumentFragment for batch DOM updates
        const fragment = document.createDocumentFragment();
        const existingIds = new Set();

        // Keep existing messages that are still visible
        this.renderedMessages.forEach((el, id) => {
            const msgIndex = this.messages.findIndex(m => m.id === id);
            if (msgIndex >= start && msgIndex < end) {
                fragment.appendChild(el);
                existingIds.add(id);
            }
        });

        // Add new visible messages
        for (let i = start; i < end; i++) {
            const msg = this.messages[i];
            if (!existingIds.has(msg.id)) {
                const el = this.createMessageElement(msg);
                fragment.appendChild(el);
                this.renderedMessages.set(msg.id, el);
            }
        }

        // Remove old messages from DOM
        this.renderedMessages.forEach((el, id) => {
            const msgIndex = this.messages.findIndex(m => m.id === id);
            if (msgIndex < start || msgIndex >= end) {
                el.remove();
                this.renderedMessages.delete(id);
            }
        });

        container.innerHTML = '';
        container.appendChild(fragment);
    }

    createMessageElement(msg) {
        const isOwn = msg.author.id === this.currentUser.id;
        const div = document.createElement('div');
        div.className = `message ${isOwn? 'own' : ''}`;
        div.dataset.messageId = msg.id;

        const time = new Date(msg.timestamp).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit'
        });

        div.innerHTML = `
            <div class="message-bubble">
                ${!isOwn? `<div class="message-author">${msg.author.name}</div>` : ''}
                <div class="message-text">${this.escapeHtml(msg.text)}</div>
                <div class="message-meta">
                    <span>${time}</span>
                    ${isOwn? `<span class="message-status ${msg.status}"></span>` : ''}
                </div>
            </div>
        `;

        return div;
    }

    sendMessage() {
        const input = document.getElementById('message-input');
        const text = input.value.trim();

        if (!text) return;

        const message = {
            id: ++this.messageIdCounter,
            author: this.currentUser,
            text: text,
            timestamp: Date.now(),
            status: 'pending',
            optimistic: true
        };

        // Optimistic update
        this.messages.push(message);
        this.renderVisibleMessages();
        this.scrollToBottom();

        input.value = '';
        input.style.height = 'auto';

        // Send via WebSocket
        if (this.ws) {
            this.ws.send(JSON.stringify(message));
        }

        this.stopTyping();
    }

    updateMessageStatus(id, status) {
        const msg = this.messages.find(m => m.id === id);
        if (msg) {
            msg.status = status;
            const el = this.renderedMessages.get(id);
            if (el) {
                const statusEl = el.querySelector('.message-status');
                if (statusEl) {
                    statusEl.className = `message-status ${status}`;
                }
            }
        }
    }

    simulateIncomingMessage() {
        const users = [
            {id: 'user2', name: 'Alice'},
            {id: 'user3', name: 'Bob'},
            {id: 'user4', name: 'Charlie'}
        ];

        const texts = [
            'That\'s awesome!',
            'I agree 👍',
            'Can you share more details?',
            'This is really cool',
            'Nice work!'
        ];

        const user = users[Math.floor(Math.random() * users.length)];
        const text = texts[Math.floor(Math.random() * texts.length)];

        const message = {
            id: ++this.messageIdCounter,
            author: user,
            text: text,
            timestamp: Date.now(),
            status: 'delivered'
        };

        this.messages.push(message);
        this.renderVisibleMessages();
        this.scrollToBottom();
    }

    handleTyping() {
        if (!this.isTyping) {
            this.isTyping = true;
            // Send typing event to server
        }

        clearTimeout(this.typingTimeout);
        this.typingTimeout = setTimeout(() => {
            this.stopTyping();
        }, 1000);
    }

    stopTyping() {
        this.isTyping = false;
        // Send stop typing event
    }

    showTypingIndicator(name) {
        const indicator = document.getElementById('typing-indicator');
        document.getElementById('typing-text').textContent = `${name} is typing...`;
        indicator.classList.add('active');
    }

    hideTypingIndicator() {
        document.getElementById('typing-indicator').classList.remove('active');
    }

    loadMoreMessages() {
        const loader = document.getElementById('load-more');
        loader.classList.add('active');

        // Simulate loading older messages
        setTimeout(() => {
            loader.classList.remove('active');
        }, 1000);
    }

    scrollToBottom() {
        const viewport = document.getElementById('messages-viewport');
        requestAnimationFrame(() => {
            viewport.scrollTop = viewport.scrollHeight;
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

new RealTimeChat();