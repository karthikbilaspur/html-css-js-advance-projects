// JavaScript for Code 12
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('modalOverlay');
    const openBtn = document.getElementById('openModal');
    const closeBtn = document.getElementById('closeModal');
    const modalTitle = document.getElementById('modalTitle');
    let lastFocusedElement = null;

    function openModal() {
        lastFocusedElement = document.activeElement; // Save focus
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');
        closeBtn.focus(); // Move focus into modal
    }

    function closeModal() {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
        if (lastFocusedElement) lastFocusedElement.focus(); // Return focus
    }

    // Open modal
    openBtn.addEventListener('click', openModal);

    // Close modal via button
    closeBtn.addEventListener('click', closeModal);

    // Close modal by clicking on the dark background overlay
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
});