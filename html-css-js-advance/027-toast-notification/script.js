const successBtn = document.getElementById('successBtn');
const errorBtn = document.getElementById('errorBtn');
const infoBtn = document.getElementById('infoBtn');
const warningBtn = document.getElementById('warningBtn');
const toasts = document.getElementById('toasts');

const messages = {
    success: ['Saved successfully!', 'Profile updated!', 'Payment complete!'],
    error: ['Something went wrong', 'Failed to save', 'Network error'],
    info: ['New update available', 'You have 3 messages', 'Backup complete'],
    warning: ['Low disk space', 'Password expires soon', 'Session timeout']
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

function createToast(type) {
    const toast = document.createElement('div');
    toast.classList.add('toast', type);

    const randomMessage = messages[type][Math.floor(Math.random() * messages[type].length)];

    toast.innerHTML = `
        <span class="toast-icon">${icons[type]}</span>
        <span class="toast-message">${randomMessage}</span>
        <button class="toast-close">&times;</button>
    `;

    toasts.appendChild(toast);

    // Close button
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => removeToast(toast));

    // Auto remove after 3 seconds
    setTimeout(() => {
        removeToast(toast);
    }, 3000);
}

function removeToast(toast) {
    toast.classList.add('removing');
    setTimeout(() => {
        toast.remove();
    }, 300); // Match animation duration
}