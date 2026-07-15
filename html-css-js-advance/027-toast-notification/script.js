const successBtn = document.getElementById('successBtn');
const errorBtn = document.getElementById('errorBtn');
const infoBtn = document.getElementById('infoBtn');
const warningBtn = document.getElementById('warningBtn');
const toasts = document.getElementById('toasts');

const messages = {
    success: ['Saved successfully!', 'Profile updated!', 'Payment complete!', 'Changes applied!'],
    error: ['Something went wrong', 'Failed to save', 'Network error', 'Access denied'],
    info: ['New update available', 'You have 3 messages', 'Backup complete', 'Sync finished'],
    warning: ['Low disk space', 'Password expires soon', 'Session timeout', 'Unsaved changes']
};

const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠'
};

successBtn.addEventListener('click', () => createToast('success'));
errorBtn.addEventListener('click', () => createToast('error'));
infoBtn.addEventListener('click', () => createToast('info'));
warningBtn.addEventListener('click', () => createToast('warning'));

// Keyboard shortcuts: 1=success, 2=error, 3=info, 4=warning
document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'BUTTON') return;
    if (e.key === '1') createToast('success');
    if (e.key === '2') createToast('error');
    if (e.key === '3') createToast('info');
    if (e.key === '4') createToast('warning');
});

function createToast(type) {
    const toast = document.createElement('div');
    toast.classList.add('toast', type);
    toast.setAttribute('role', 'alert');

    const randomMessage = messages[type][Math.floor(Math.random() * messages[type].length)];

    toast.innerHTML = `
        <div class="toast-content">
            <span class="toast-icon">${icons[type]}</span>
            <span class="toast-message">${randomMessage}</span>
            <button class="toast-close" aria-label="Close notification">&times;</button>
        </div>
        <div class="toast-progress">
            <div class="toast-progress-bar"></div>
        </div>
    `;

    toasts.appendChild(toast);

    // Close button
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => removeToast(toast));

    // Pause auto-remove on hover
    let timeoutId = setTimeout(() => removeToast(toast), 3000);
    
    toast.addEventListener('mouseenter', () => clearTimeout(timeoutId));
    toast.addEventListener('mouseleave', () => {
        timeoutId = setTimeout(() => removeToast(toast), 3000);
    });
}

function removeToast(toast) {
    if (!toast || toast.classList.contains('removing')) return;
    
    toast.classList.add('removing');
    setTimeout(() => {
        toast.remove();
    }, 300);
}