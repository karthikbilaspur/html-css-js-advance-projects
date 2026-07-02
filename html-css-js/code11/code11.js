// JavaScript for Code 11
document.addEventListener('DOMContentLoaded', () => {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active from all buttons + update ARIA
            tabButtons.forEach(btn => {
                btn.classList.remove('active');
                btn.setAttribute('aria-selected', 'false');
            });
            
            // Add active to clicked button
            button.classList.add('active');
            button.setAttribute('aria-selected', 'true');

            // Hide all content sections
            tabContents.forEach(content => {
                content.classList.remove('active');
                content.hidden = true;
            });

            // Show target content using aria-controls
            const targetId = button.getAttribute('aria-controls');
            const targetContent = document.getElementById(targetId);
            targetContent.classList.add('active');
            targetContent.hidden = false;
        });
    });
});