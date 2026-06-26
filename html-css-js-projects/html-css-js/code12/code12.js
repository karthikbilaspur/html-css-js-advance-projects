// JavaScript for Code 12
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('modalOverlay');
    const openBtn = document.getElementById('openModal');
    const closeBtn = document.getElementById('closeModal');

    // Open modal
    openBtn.addEventListener('click', () => {
        modal.style.display = 'flex';
    });

    // Close modal via button
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Close modal by clicking on the dark background overlay
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
});